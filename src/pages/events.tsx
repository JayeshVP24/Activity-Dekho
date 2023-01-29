import { useActor, useSelector } from "@xstate/react";
import { signOut } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { AnimatePresence } from "framer-motion";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { State } from "xstate";
import { DateFilters } from "../../enums";
import { ClubType } from "../../types";
import { getFilteredDates } from "../../utils";
import AddAttendanceForm from "../components/AddAttendanceForm";
import AddEventForm from "../components/AddEventForm";
import AvatarGenerator from "../components/AvatarGenerator";
import { GlobalStateContext } from "../components/GlobalStateProvider";
import ModalWrapper from "../components/ModalWrapper";
import ViewAttendance from "../components/ViewAttendance";
import { auth } from "../firebase/config";
import {
  ClubAuthActor,
  ClubAuthContext,
  ClubAuthEvent,
} from "../machines/clubAuth";

const loggedIn = (state: State<ClubAuthContext, ClubAuthEvent>) => {
  return state.matches("authSuccesfull");
};

const Events: NextPage = () => {
  const globalServices = useContext(GlobalStateContext);
  const [state, send] = useActor(globalServices.clubEventService);
  const [authState, authSend] = useActor(globalServices.clubAuthService);
  const [currentFilter, setCurrentFilter] = useState<DateFilters>(
    DateFilters.currentYear
  );
  // const { send: authSend } = globalServices.clubAuthService;
  const authClub = globalServices.authClub;
  const router = useRouter();

  //   const isloggedIn = useSelector(globalServices.clubAuthService, loggedIn);
  useEffect(() => {
    console.log(state.value);
  }, [state]);

  useEffect(() => {
    // console.log();
    // console.log(state.context.filteredEvents)
    // send("CLEAR_CONTEXT")
    // console.log(state.context.filteredEvents)
    if (authClub) {
      send("LOAD");
    }
  }, [authClub]);

  // useEffect(() => {
  //   if (!authClub) {
  //     //   console.log("login pop");
  //     authSend("OPEN_MODAL");
  //   }
  // }, [authClub]);

  if (!authClub) {
    return (
      <div className="  mx-auto px-20 top-[30%]">
        <h1 className="text-5xl mx-auto p-10 bg-red-500 rounded-3xl">
          Please Login
        </h1>
        <button
          onClick={() => authSend("OPEN_MODAL")}
          className="btnFtrs bg-cyan-400 w-full mt-10
        ring-4 ring-cyan-200  hover:ring-cyan-300 "
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <main className="mx-10 xl:mx-20 2xl:mx-32">
      <div className="flex flex-col gap-y-4">
        {authClub?.photoUrl && (
          <Image
            src={authClub.photoUrl}
            width="100"
            height={100}
            alt={`Logo of ${authClub.name}`}
            className="w-24"
          />
        )}
        {!authClub.photoUrl && <AvatarGenerator big name={authClub.name} />}
        <div className="">
          <h1 className="text-3xl font-semibold">Welcome</h1>
          <h2 className="text-5xl font-bold mt-2">{authClub.name}</h2>
        </div>
      </div>
      {state.matches("retrievingEvents") && (
        <div className="text-3xl font-semibold bg-yellow-300 px-5 py-2 rounded-full mt-8">
          Loading 💭
        </div>
      )}
      {state.matches("displayingError") && (
        <div className="  mx-auto px-5 top-[30%]">
          <h1 className="text-5xl mx-auto p-10 bg-red-500 rounded-3xl">
            Uhh oh!🥴 <br />
            Some error occured
          </h1>
          <button
            onClick={() => send("RETRIEVE_EVENTS.RETRY")}
            className="btnFtrs bg-cyan-400 w-full mt-10
         ring-4 ring-cyan-200  hover:ring-cyan-300 "
          >
            Try Again 💪
          </button>
        </div>
      )}
      {state.context.filteredEvents && (
        <div>
          <input
            className="w-full outline-none rounded-full px-4 py-2 mt-4 bg-opacity-50 bg-white
            "
            type="text"
            placeholder="Search"
            onChange={(e) => {
              console.log(e.target.value);
              send({ type: "FILTER_EVENTS_LIST", query: e.target.value });
            }}
          />
          <div className="mt-4 flex gap-2 flex-wrap ">
            <button
              onClick={() => {
                const dateFilters = getFilteredDates(DateFilters.currentYear);
                setCurrentFilter(DateFilters.currentYear);
                send({
                  type: "EVENT_DATE_FILTER",
                  dateFilters,
                });
              }}
              className={`border-2 border-black rounded-full px-4
            hover:bg-slate-200 active:scale-95 transition-all
            ${
              currentFilter.includes(DateFilters.currentYear)
                ? "bg-green-300"
                : "bg-transparent"
            }`}
            >
              Current Year
            </button>
            <button
              onClick={() => {
                const dateFilters = getFilteredDates(DateFilters.currentSem);
                setCurrentFilter(DateFilters.currentSem);
                send({
                  type: "EVENT_DATE_FILTER",
                  dateFilters,
                });
              }}
              className={`border-2 border-black rounded-full px-4
            hover:bg-slate-200 active:scale-95 transition-all
            ${
              currentFilter.includes(DateFilters.currentSem)
                ? "bg-green-300"
                : "bg-transparent"
            }`}
            >
              Current Sem
            </button>
            <button
              onClick={() => {
                const dateFilters = getFilteredDates(DateFilters.lastSem);
                setCurrentFilter(DateFilters.lastSem);
                send({
                  type: "EVENT_DATE_FILTER",
                  dateFilters,
                });
              }}
              className={`border-2 border-black rounded-full px-4
            hover:bg-slate-200 active:scale-95 transition-all
            ${
              currentFilter.includes(DateFilters.lastSem)
                ? "bg-green-300"
                : "bg-transparent"
            }`}
            >
              Last Sem
            </button>
            <button
              onClick={() => {
                const dateFilters = getFilteredDates(DateFilters.lastYear);
                setCurrentFilter(DateFilters.lastYear);
                send({
                  type: "EVENT_DATE_FILTER",
                  dateFilters,
                });
              }}
              className={`border-2 border-black rounded-full px-4
            hover:bg-slate-200 active:scale-95 transition-all
            ${
              currentFilter.includes(DateFilters.lastYear)
                ? "bg-green-300"
                : "bg-transparent"
            }`}
            >
              Last Year
            </button>
            {/* <label htmlFor="fromDate">From: </label>
            <input
              value={state.context.dateFilter.fromDate.toDate().getFullYear}
              className="rounded-full bg-transparent  "
              type="date"
              name="fromDate"
              onChange={e => console.log(e.target.value)}

            />
            <label htmlFor="toDate">To: </label>
            <input
              // value={state.context.dateFilter.toDate.toDate().toString()}
              className="rounded-full bg-transparent  "
              type="date"
              name="toDate"
            /> */}
          </div>
          <form className="flex flex-wrap gap-2 mt-2" 
            onSubmit={(e) => {
              e.preventDefault()
              const fromDate = e.currentTarget["fromDate"].value
              const toDate = e.currentTarget["toDate"].value
              if(!fromDate || !toDate) return
              const dateFilters = {
                fromDate: Timestamp.fromDate(new Date(fromDate)),
                toDate: Timestamp.fromDate(new Date(toDate))
              }
              setCurrentFilter(DateFilters.custom)
              send({
                type: "EVENT_DATE_FILTER",
                dateFilters
              })}
            }
            >
              <label htmlFor="fromDate">From: </label>
              <input className="rounded-full bg-transparent  " type="date" name="fromDate" />
              <label htmlFor="toDate">To: </label>
              <input className="rounded-full bg-transparent  " type="date" name="toDate" />
            <button type="submit"
            className="bg-blue-300 rounded-full px-4
            hover:bg-blue-400 active:scale-95 transition-all"
            >Custom Date</button>
            </form>
          <div className="mt-2">
            <p>Showing Data of dates</p>
            <p>
              from - {state.context.dateFilter.fromDate.toDate().toDateString()}{" "}
            </p>
            <p>
              to - {state.context.dateFilter.toDate.toDate().toDateString()}{" "}
            </p>
          </div>
          <section className="lg:flex flex-wrap gap-7  mt-8">
            {state.context.filteredEvents.map((e) => {
              // const startDate = e.startDate.toDate().toDateString()
              // const endDate = e.endDate.toDate().toDateString()
              return (
                <div
                  onClick={() =>
                    send({ type: "VIEW_ATTENDANCE", currentEvent: e })
                  }
                  key={e.id}
                  className="bg-yellow-200 px-5 py-8 rounded-3xl block min-w-max pr-16 text-left
                hover:ring-4 ring-yellow-300 ring-opacity-70 active:scale-90 transition-all
                max-w-sm cursor-pointer"
                >
                  <span className="text-2xl block font-semibold mb-2 overflow-hidden">
                    {e.name}
                  </span>
                  {e.startDate.toDate().toDateString() ===
                  e.endDate.toDate().toDateString() ? (
                    <span className="block">
                      <span className="italic mr-2 inline-block">on - </span>
                      <span className="bg-green-300 px-4  rounded-full mt-2 inline-block">
                        {e.startDate.toDate().toDateString()}
                      </span>
                    </span>
                  ) : (
                    <>
                      <span className="block">
                        {" "}
                        <span className="italic mr-2 inline-block">
                          from -{" "}
                        </span>{" "}
                        <span className="bg-green-300 px-4  rounded-full mt-2 inline-block">
                          {" "}
                          {e.startDate.toDate().toDateString()}
                        </span>
                      </span>
                      <span className="block">
                        <span className="italic mr-2 inline-block">to - </span>{" "}
                        <span className="bg-indigo-300 px-4  rounded-full mt-2 inline-block">
                          {e.endDate.toDate().toDateString()}
                        </span>{" "}
                      </span>
                    </>
                  )}
                  <span className="block">
                    <span className="italic mr-2 inline-block">
                      activity hours -{" "}
                    </span>
                    <span className="bg-orange-400 px-4  rounded-full mt-2 inline-block">
                      {e.activityHours}
                    </span>
                  </span>
                  <span className="block">
                    <span className="italic mr-2 inline-block">
                      scope -{" "}
                    </span>
                    <span className="bg-pink-300 px-4  rounded-full mt-2 inline-block capitalize">
                      {e.scope}
                    </span>
                  </span>
                  <button
                    className="bg-teal-400 px-4 py-1 rounded-xl mt-4
                hover:ring-4 ring-teal-300 ring-opacity-50
                
                "
                    onClick={() =>
                      send({ type: "ADD_ATTENDANCE", currentEvent: e })
                    }
                  >
                    Add attendance
                  </button>
                </div>
              );
            })}
          </section>
        </div>
      )}
      {state.matches("viewingAttendance") && (
        <ModalWrapper
          isModalOpen={state.context.modalViewAttendance}
          closeModal={() => send("CLOSE_VIEW_ATTENDANCE")}
          loading={state.context.loading}
        >
          <ViewAttendance />
        </ModalWrapper>
      )}
      {state.matches("addAttendance") && (
        <ModalWrapper
          isModalOpen={state.context.modalAddAttendance}
          closeModal={() => send("ADD_ATTENDANCE.CLOSE")}
          loading={state.context.loading}
        >
          <AddAttendanceForm />
        </ModalWrapper>
      )}
      {state.matches("displayingEvents") && (
        <button
          className="btnFtrs fixed  bg-stone-800 text-white 
          bottom-24 right-5 rounded-full px-4 
          "
          onClick={() => send({ type: "ADD_EVENT" })}
        >
          Add Event
        </button>
      )}
      {state.matches("AddEvent") && (
        <ModalWrapper
          isModalOpen={state.context.modalAddEvent}
          loading={state.context.loading}
          closeModal={() => send("ADD_EVENT.CLOSE")}
        >
          <AddEventForm />
        </ModalWrapper>
      )}
    </main>
  );
};
export default Events;
