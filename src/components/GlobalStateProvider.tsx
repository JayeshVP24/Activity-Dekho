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
      getClubsList: async () => await getClubsListQuery(),
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
        router.push("/club");
      },
    },
  });

  //   const [state] = useActor(clubAuthService);

  const clubEventService = useInterpret(ClubEventMachine, {
    services: {
      retrieveClubEvents: async (_) => {
        console.log("well i reached in global context");
        return await retrieveClubEventsQuery(authClub.id);
      },
    //   retrieveAttendance: async (_) =>
    //     new Promise(() => {
    //       return resolve("afw")
    //     }),
    },
  });

  return (
    <GlobalStateContext.Provider
      value={{ clubAuthService, clubEventService, authClub }}
    >
      <ClubAuth />
      {children}
    </GlobalStateContext.Provider>
  );
};
export default GlobalStateProvider;
