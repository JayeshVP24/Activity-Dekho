import { useActor, useSelector } from "@xstate/react";
import { AnimatePresence } from "framer-motion";
import { NextPage } from "next";
import Image from "next/image";
import { useContext, useEffect } from "react";
import { State } from "xstate";
import { ClubType } from "../../types";
import AddAttendanceForm from "../components/AddAttendanceForm";
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
  //   const [authState, authSend] = useActor(globalServices.clubAuthService);
  const { send: authSend } = globalServices.clubAuthService;
  const authClub = globalServices.authClub;

  //   const isloggedIn = useSelector(globalServices.clubAuthService, loggedIn);
  useEffect(() => {
    console.log(state.value);
  }, [state]);

  useEffect(() => {
    // console.log();
    if (authClub) {
      send("LOAD");
    }
  }, [authClub]);

  useEffect(() => {
    if (!authClub) {
      //   console.log("login pop");
      authSend("LOGIN");
    }
  }, [authClub]);

  if (!authClub) {
    return (
      <div className="  mx-auto px-20 top-[30%]">
        <h1 className="text-5xl mx-auto p-10 bg-red-500 rounded-3xl">
          Please Login
        </h1>
        <button
          onClick={() => authSend("LOGIN")}
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
      {state.context.events && (
        <section className="lg:flex flex-wrap gap-10">
          {state.context.events.map((e) => {
            // const startDate = e.startDate.toDate().toDateString()
            // const endDate = e.endDate.toDate().toDateString()
            return (
              <div
                onClick={() =>
                  send({ type: "VIEW_ATTENDANCE", currentEvent: e })
                }
                key={e.id}
                className="bg-yellow-200 px-5 py-8 rounded-3xl mt-8 block w-full text-left
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
    </main>
  );
};
export default Events;
