import { useActor, useSelector } from "@xstate/react";
import { signOut } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { AnimatePresence } from "framer-motion";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { State } from "xstate";
import { Attendee, DateFilters } from "../utils/enums";
import { ClubType } from "../utils/types";
import { getFilteredDates } from "../utils/utils";
import AddAttendanceForm from "../components/AddAttendanceForm";
import AddAttendeeForm from "../components/AddAttendeeForm";
import AddEventForm from "../components/AddEventForm";
import AvatarGenerator from "../components/AvatarGenerator";
import Confirmation from "../components/Confirmation";
import EditEventForm from "../components/EditEventForm";
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
  const [attendeeType, setAttendeeType] = useState<Attendee>()

  const {dateFilter, currentEvent, events, loading, errorMsg, currentAttendee} = useSelector(
    globalServices.clubEventService,
    (state) => state.context
  );
  //   const isloggedIn = useSelector(globalServices.clubAuthService, loggedIn);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const [inputData, setInputData] = useState("");
  const inputDataHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputData(e.target.value);
  }, []);
  const filteredEvents = useMemo(() => {
    if (!inputData) return events;
    return events.filter((a) =>
      a.id.toLowerCase().includes(inputData.toLowerCase()) || a.name.toLowerCase().includes(inputData.toLowerCase())
    );
  }, [inputData, events]);
  useEffect(() => {
    // console.log(state.value);
  }, [state]);

  useEffect(() => {
    // // console.log();
    // // console.log(state.context.filteredEvents)
    // send("CLEAR_CONTEXT")
    // // console.log(state.context.filteredEvents)
    if (authClub) {
      send("LOAD");
    }
  }, [authClub]);

  // useEffect(() => {
  //   if (!authClub) {
  //     //   // console.log("login pop");
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
      {filteredEvents && (
        <div>
          <input
            className="w-full outline-none rounded-full px-4 py-2 mt-4 bg-opacity-50 bg-white
            "
            type="text"
            placeholder="Search"
            value={inputData}
            onChange={inputDataHandler}
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
              onChange={e => // console.log(e.target.value)}

            />
            <label htmlFor="toDate">To: </label>
            <input
              // value={state.context.dateFilter.toDate.toDate().toString()}
              className="rounded-full bg-transparent  "
              type="date"
              name="toDate"
            /> */}
          </div>
          <form
            className="flex flex-wrap gap-2 mt-3"
            onChange={(e) => {
              e.preventDefault();
              const fromDate = e.currentTarget["fromDate"].value;
              const toDate = e.currentTarget["toDate"].value;
              if (!fromDate || !toDate) return;
              const dateFilters = {
                fromDate: Timestamp.fromDate(new Date(fromDate)),
                toDate: Timestamp.fromDate(new Date(toDate)),
              };
              setCurrentFilter(DateFilters.custom);
              send({
                type: "EVENT_DATE_FILTER",
                dateFilters,
              });
            }}
          >
            <span className="bg-green-300 px-4 py-1 rounded-full "
                onClick={e => fromRef.current.showPicker()}
            
            >
              <label htmlFor="fromDate">From: </label>
              <input
                className="rounded-full bg-transparent  outline-none"
                type="date"
                name="fromDate"
                ref={fromRef}
                value={
                  dateFilter.fromDate.toDate().toISOString().split("T")[0]
                }
              />
            </span>
            <span className="bg-green-300 px-4 py-1 rounded-full"
                onClick={e => toRef.current.showPicker()}
            
            >
              <label htmlFor="toDate">To: </label>

              <input
                className="rounded-full bg-transparent outline-none "
                type="date"
                name="toDate"
                ref={toRef}
                value={dateFilter.toDate.toDate().toISOString().split("T")[0]}
              />
            </span>
            {/* <button
              type="submit"
              className="bg-blue-300 rounded-full px-4
            hover:bg-blue-400 active:scale-95 transition-all"
            >
              Custom Date
            </button> */}
          </form>
          {/* <div className="mt-2">
            <p>Showing Data of dates</p>
            <p>
              from - {state.context.dateFilter.fromDate.toDate().toDateString()}{" "}
            </p>
            <p>
              to - {state.context.dateFilter.toDate.toDate().toDateString()}{" "}
            </p>
          </div> */}
          <section className="flex  flex-wrap gap-7  mt-8">
            {(events?.length <= 0 || filteredEvents?.length <= 0) ? (
              <div className="w-full mt-10" >
                <h2 className="text-3xl lg:text-5xl font-semibold mx-auto w-fit">No Events Found 🤐</h2>
              </div>
            ) : filteredEvents.map((e) => {
              // const startDate = e.startDate.toDate().toDateString()
              // const endDate = e.endDate.toDate().toDateString()
              return (
                <div
                  onClick={() =>
                    send({ type: "VIEW_ATTENDANCE", currentEvent: e })
                  }
                  key={e.id}
                  className="bg-yellow-200 px-5 py-8 rounded-3xl block  pr-16 text-left
                hover:ring-4 ring-yellow-300 ring-opacity-70 active:scale-90 transition-all
                max-w-sm cursor-pointer "
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
                    <span className="italic mr-2 inline-block">scope - </span>
                    <span className="bg-pink-300 px-4  rounded-full mt-2 inline-block capitalize">
                      {e.scope}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-x-4 gap-y-3 w-fit  mt-6">
                    <button
                      className="bg-teal-400 px-4 py-1 rounded-xl 
                    ring-4 ring-teal-300 ring-opacity-40 hover:ring-opacity-90
                    
                    "
                      onClick={() =>
                        send({ type: "ADD_ATTENDANCE", currentEvent: e })
                      }
                    >
                      Add attendance
                    </button>
                    <button
                      className="bg-blue-400 px-4 py-1 rounded-xl 
                    ring-4 ring-blue-300 ring-opacity-40 hover:ring-opacity-90
                    
                    "
                      onClick={() =>
                        send({ type: "EDIT_EVENT", currentEvent: e })
                      }
                    >
                      Edit event
                    </button>
                    <button
                      className="bg-red-400 px-4 py-1 rounded-xl 
                    ring-4 ring-red-300 ring-opacity-40 hover:ring-opacity-90
                    
                    "
                      onClick={() =>
                        send({ type: "DELETE_EVENT", currentEvent: e })
                      }
                    >
                      Delete event
                    </button>
                  </span>
                </div>
              );
            })}
          </section>
        </div>
      )}
      {(
        <ModalWrapper
          isModalOpen={state.matches("viewingAttendance") }
          closeModal={() => send("CLOSE_VIEW_ATTENDANCE")}
          loading={loading}
        >
          <ViewAttendance setAttendeeType={setAttendeeType} />
        </ModalWrapper>
      )}
      {(
        <ModalWrapper
          isModalOpen={state.matches("viewingAttendance.DeleteAttendee")}
          loading={false}
          closeModal={() => send("DELETE_ATTENDEE.CLOSE")}
        >
          <Confirmation errorMsg={errorMsg} mainMsg={`Delete ${currentAttendee}`}
          loading={loading}
          confirmMsg="Delete Attendee"
          subMsg={`This will delete attendance of this student for event ${currentEvent?.name}`}
          closeConfirm={() => send("DELETE_ATTENDEE.CLOSE")}
          submitConfirm={() => send({type: "DELETE_ATTENDEE.SUBMIT", deleteAttendeeId: currentAttendee } )}
          />
        </ModalWrapper>
      )}
      {(
        <ModalWrapper
          isModalOpen={state.matches("viewingAttendance.EditAttendee")}
          loading={false}
          closeModal={() => send("EDIT_ATTENDEE.CLOSE")}
        >
          <Confirmation errorMsg={errorMsg} mainMsg={`Make ${currentAttendee} ${attendeeType} `}
          loading={loading}
          confirmMsg="Update Attendee"
          subMsg={`This will mark the attendee as ${attendeeType} for event ${currentEvent?.name}`}
          closeConfirm={() => send("EDIT_ATTENDEE.CLOSE")}
          submitConfirm={() => send({type: "EDIT_ATTENDEE.SUBMIT", attendeeId: currentAttendee, attendeeType } )}
          />
        </ModalWrapper>
      )}
      {(
        <ModalWrapper
          isModalOpen={state.matches("viewingAttendance.AddAttendee")}
          closeModal={() => send("ADD_ATTENDEE.CLOSE")}
          loading={loading}
        >
          <AddAttendeeForm />
        </ModalWrapper>
      )}
      {(
        <ModalWrapper
          isModalOpen={state.matches("addAttendance")}
          closeModal={() => send("ADD_ATTENDANCE.CLOSE")}
          loading={loading}
        >
          <AddAttendanceForm />
        </ModalWrapper>
      )}
      {state.matches("displayingEvents") && (
        <button
          className="btnFtrs fixed  bg-stone-800 text-white 
          bottom-24 lg:bottom-36 right-5 rounded-full px-4 
          "
          onClick={() => send({ type: "ADD_EVENT" })}
        >
          Add Event
        </button>
      )}
      {(
        <ModalWrapper
          isModalOpen={state.matches("AddEvent")}
          loading={loading}
          closeModal={() => send("ADD_EVENT.CLOSE")}
        >
          <AddEventForm />
        </ModalWrapper>
      )}
      {(
        <ModalWrapper
          isModalOpen={state.matches("EditEvent")}
          loading={loading}
          closeModal={() => send("EDIT_EVENT.CLOSE")}
        >
          <EditEventForm />
        </ModalWrapper>
      )}
      {(
        <ModalWrapper
          isModalOpen={state.matches("DeleteEvent")}
          loading={false}
          closeModal={() => send("DELETE_EVENT.CLOSE")}
        >
          <Confirmation errorMsg={errorMsg} mainMsg={`Delete ${currentEvent?.name}`}
          confirmMsg="Delete Event"
          loading={loading}
          subMsg="This will delete all the attendance records of this event"
          closeConfirm={() => send("DELETE_EVENT.CLOSE")}
          submitConfirm={() => send({type: "DELETE_EVENT.SUBMIT", deleteEventId: currentEvent?.id } )}
          />
        </ModalWrapper>
      )}
      
    </main>
  );
};
export default Events;
