import { useActor, useInterpret } from "@xstate/react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { resolve } from "node:path/win32";
import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { ClubType } from "../utils/types";
import { auth } from "../firebase/config";
import {
  getClubsListQuery,
  validateAuthQuery,
} from "../firebase/firestore/Club";
import {
  addAttendanceQuery,
  addAttendeeToDBQuery,
  addEventToDBQuery,
  deleteAttendeeOnDBQuery,
  deleteEventOnDBQuery,
  editAttendeeOnDBQuery,
  editEventOnDBQuery,
  retrieveClubEventsQuery,
} from "../firebase/firestore/Events";
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
  useEffect(() => {
    setAuthClub(JSON.parse(sessionStorage.getItem("club")))
  }, [])
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
      loggedIn: !!auth.currentUser,
      club: authClub
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
      retrieveClubEvents: async (context,_) => {
        // console.log("well i reached in global context");
        return await retrieveClubEventsQuery(authClub.id, context.dateFilter);
      },
      // @ts-ignore
      addAttendanceToDB: async (context) => {
        return await addAttendanceQuery(
          authClub.id,
          context.currentEvent.id,
          context.excelAttendance
        );
      },
      addEventToDB: async (_, event) => {
        return await addEventToDBQuery(authClub.id, event.newEvent);
      },
      editEventOnDb: async (_, event) => {
        return await editEventOnDBQuery(authClub.id, event.editedEvent)
      },
      deleteEvent: async (context, event) => {
        // console.log("deleting event")
        return await deleteEventOnDBQuery(authClub.id, event.deleteEventId, context.currentAttendance)
      },
      deleteAttendee: async (context, event) => {
        return await deleteAttendeeOnDBQuery(authClub.id, context.currentEvent, event.deleteAttendeeId)
      },
      editAttendee: async (context, event) => {
        return await editAttendeeOnDBQuery(authClub.id, context.currentEvent, event.attendeeId, event.attendeeType)
      },
      addAttendee: async (context, event) => {
        return await addAttendeeToDBQuery(authClub.id, context.currentEvent, event.attendeeId, event.attendeeType)
      },
      //   retrieveAttendance: async (_) =>
      //     new Promise(() => {
      //       return resolve("afw")
      //     }),
    },
  });

  const [state, send] = useActor(clubAuthService);
  const [eventState, eventSend] = useActor(clubEventService);
  // useEffect(() => {
  //   if (auth.currentUser) {
  //     state.context.loggedIn = true;
  //     state.context.club = JSON.parse(sessionStorage.getItem("club"))
  //   }
  //   send("CLOSE_MODAL")
  // }, []);
  useEffect(() => {
    if (authClub) {
      //   // console.log("login pop");
      state.context.loggedIn = true;
      state.context.club = JSON.parse(sessionStorage.getItem("club"))
      send("OPEN_MODAL");
    } else {
      send("CLOSE_MODAL")
    }
  }, [authClub]);
  return (
    <GlobalStateContext.Provider
      value={{ clubAuthService, clubEventService, authClub }}
    >
      <ModalWrapper
        isModalOpen={state.context.modalOpen}
        closeModal={() => send("CLOSE_MODAL")}
        loading={state.context.loading}
      >
        <ClubAuth />
      </ModalWrapper>
      {state.context.loggedIn && <button
        className="btnFtrs fixed  bg-stone-800 text-white 
          bottom-10 lg:bottom-20 right-5 rounded-full px-4  z-20
          "
        onClick={() => {
          // // console.log({"events": eventState.context.filteredEvents})
          eventSend("CLEAR_CONTEXT")
          // // console.log({"events": eventState.context.filteredEvents})
          signOut(auth).then(() => {
            sessionStorage.removeItem("club")
            state.context.loggedIn = false;
            router.push("/");
          });
        }}
      >
        Log Out
      </button>}
      {children}
    </GlobalStateContext.Provider>
  );
};
export default GlobalStateProvider;
