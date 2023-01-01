import { useActor, useSelector } from "@xstate/react";
import { NextPage } from "next";
import Image from "next/image";
import { useContext, useEffect } from "react";
import { State } from "xstate";
import { ClubType } from "../../types";
import AvatarGenerator from "../components/AvatarGenerator";
import { GlobalStateContext } from "../components/GlobalStateProvider";
import { auth } from "../firebase/config";
import {
  ClubAuthActor,
  ClubAuthContext,
  ClubAuthEvent,
} from "../machines/clubAuth";

const loggedIn = (state: State<ClubAuthContext, ClubAuthEvent>) => {
  return state.matches("authSuccesfull");
};

const Club: NextPage = () => {
  const globalServices = useContext(GlobalStateContext);

  // if(!auth.currentUser) {
  //     return (
  //         <p>not allowed please login</p>
  //     )
  // }

  const [state, send] = useActor(globalServices.clubEventService);
  //   const [authState, authSend] = useActor(globalServices.clubAuthService);
  const { send: authSend } = globalServices.clubAuthService;
  const authClub = globalServices.authClub;

  const isloggedIn = useSelector(globalServices.clubAuthService, loggedIn);
  useEffect(() => {
    console.log(state.value);
  }, [state]);

  useEffect(() => {
    console.log();
    if (auth.currentUser) {
      send("LOAD");
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (!authClub) {
      console.log("login pop");
      authSend("LOGIN");
    }
  }, [authClub]);

  if (!authClub) {
    return (
      <div
        className="  mx-auto px-20 top-[30%]
   
    "
      >
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
      {state.matches("displayingEvents") && (
        <section className="">
          {state.context.events.map((e) => {
            // const startDate = e.startDate.toDate().toDateString()
            // const endDate = e.endDate.toDate().toDateString()
            return (
              <div key={e.id} className="bg-yellow-200 px-5 py-8 rounded-3xl mt-8 block">
                <span className="text-2xl block font-semibold mb-2">{e.name}</span>
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
                  <span className="italic mr-2 inline-block">activity Hours - </span>
                  <span className="bg-indigo-300 px-4  rounded-full mt-2 inline-block">
                    {e.activityHours}
                  </span>
                </span>
              </div>
            );
          })}
        </section>
      )}
      {/* {state.matches("displayingError") && <div>{state.context.errorMsg}</div>}
      {state.matches("viewingAttendance") &&
        state.context.events.map((e) => <div>{e.name}</div>)} */}
    </main>
  );
};
export default Club;
