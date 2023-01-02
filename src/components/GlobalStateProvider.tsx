import { useActor, useInterpret } from "@xstate/react";
import { useRouter } from "next/router";
import { resolve } from "node:path/win32";
import React, { useState } from "react";
import { createContext } from "react";
import { ClubType } from "../../types";
import {
  getClubsListQuery,
  validateAuthQuery,
} from "../firebase/firestore/Club";
import { retrieveClubEventsQuery } from "../firebase/firestore/Events";
import ClubAuthMachine, { ClubAuthActor } from "../machines/clubAuth";
import ClubEventMachine, { ClubEventActor } from "../machines/clubEvents";
import ClubAuth from "./ClubAuth";
import ModalWrapper from "./ModalWrapper";

export const GlobalStateContext = createContext<{
  clubAuthService: ClubAuthActor | undefined;
  clubEventService: ClubEventActor | undefined;
  authClub: ClubType | undefined;
}>({
  clubAuthService: undefined,
  clubEventService: undefined,
  authClub: undefined,
});

const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [authClub, setAuthClub] = useState<ClubType | undefined>(undefined);
  const clubAuthService = useInterpret(ClubAuthMachine, {
    services: {
      getClubsList: async (_) => await getClubsListQuery(),
      validateAuth: async (context, event) =>
        validateAuthQuery(
          context.club.name,
          context.club.email,
          event.password
        ),
    },
    context: {
      modalOpen: false,
    },
    actions: {
      moveToDashboardPage: (context) => {
        setAuthClub(context.club);
        router.push("/events");
      },
    },
  });

  const clubEventService = useInterpret(ClubEventMachine, {
    services: {
      retrieveClubEvents: async (_) => {
        // console.log("well i reached in global context");
        return await retrieveClubEventsQuery(authClub.id);
      },
      //   retrieveAttendance: async (_) =>
      //     new Promise(() => {
      //       return resolve("afw")
      //     }),
    },
  });

  const [state, send] = useActor(clubAuthService);
  return (
    <GlobalStateContext.Provider
      value={{ clubAuthService, clubEventService, authClub }}
    >
      <ModalWrapper
        isModalOpen={state.context.modalOpen}
        closeModal={() => send("CLOSE_MODAL")}
        loading={state.context.loading}
        retryEvent={() => send("RETRY")}
        errorInModal={state.context.error}
      >
        <ClubAuth  />
      </ModalWrapper>
      {children}
    </GlobalStateContext.Provider>
  );
};
export default GlobalStateProvider;
