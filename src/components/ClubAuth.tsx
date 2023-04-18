import { useActor, useMachine, useSelector } from "@xstate/react";
import {
  getClubsListQuery,
  validateAuthQuery,
} from "../firebase/firestore/Club";
import ClubAuthMachine, {
  ClubAuthContext,
  ClubAuthEvent,
} from "../machines/clubAuth";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";

import Image from "next/image";
import AvatarGenerator from "./AvatarGenerator";
import { useRouter } from "next/router";
import { GlobalStateContext } from "./GlobalStateProvider";
import { Sender } from "xstate";

const ClubAuth: React.FC = () => {
  const router = useRouter();
  const variants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  };
  // const [state, send] = useMachine(ClubAuthMachine, {
  //   services: {
  //     getClubsList: async () => await getClubsListQuery(),
  //     validateAuth: async (context, event) =>
  //       validateAuthQuery(
  //         context.club.name,
  //         context.club.email,
  //         event.password
  //       ),
  //   },
  //   context: {
  //     modalOpen: false,
  //   },
  //   actions: {
  //     moveToDashboardPage: () => {
  //       router.push("/events");
  //     },
  //   },
  // });

  const globalServices = useContext(GlobalStateContext);
  const [state, send] = useActor(globalServices.clubAuthService);
  // const { send } = globalServices.clubAuthService;
  const [inputData, setInputData] = useState("");
  const inputDataHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputData(e.target.value);
  }, []);
  const { clubList, club, error } = useSelector(
    globalServices.clubAuthService,
    (state) => state.context
  );
  const filteredClubList = useMemo(() => {
    if (!inputData) return clubList;
    return clubList.filter((a) =>
      a.id.toLowerCase().includes(inputData.toLowerCase())
    );
  }, [inputData, clubList]);
  //   // console.log(typeof send)

  //   useEffect(() => {
  //     send("OPEN_MODAL");
  //   }, []);

  useEffect(() => {
    // console.log(state.value);
    // // console.log(state.context);
  }, [state]);

  return (
    <section>
      {state.matches("displayingError") && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="flex flex-col text-center text-black text-5xl font-semibold my-auto "
        >
          <span> Something went wrong! 😶‍🌫️ </span>
          <button
            className="bg-orange-400 ring-4 font-normal ring-orange-300   
          hover:ring-orange-200 w-full mt-12 btnFtrs"
            onClick={() => send("RETRY")}
          >
            RETRY
          </button>
        </motion.div>
      )}
      {state.matches("displayingClubsList") && (
        <div>
          <h2 className="text-4xl font-semibold  ">Select your Club 🏫</h2>
          <input
            className="w-full outline-none rounded-full px-4 py-2 mt-4 bg-opacity-50 bg-white
                  "
            type="text"
            value={inputData}
            placeholder="Search"
            onChange={inputDataHandler}

          />
          <div
            className="flex flex-col gap-y-6 mt-8 max-h-64 overflow-y-auto  p-2 
                  "
          >
            {filteredClubList &&
              filteredClubList.map((c) => (

                <motion.button
                  variants={variants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  key={c.id}
                  onClick={() => send({ type: "SELECT_CLUB", club: c })}
                  className="flex items-center gap-x-4 text-lg bg-green-400  px-4 py-2 
                  rounded-2xl ring-4 ring-green-400 hover:ring-green-300 ring-opacity-70 active:scale-90 transition-all font-medium "
                >
                  {c.photoUrl && (
                    <Image
                      src={c.photoUrl}
                      width="100"
                      height={100}
                      alt={`Logo of ${c.name}`}
                      className="w-12"
                    />
                  )}
                  {!c.photoUrl && <AvatarGenerator name={c.name} />}
                  <p className="w-fit ">{c.name}</p>
                </motion.button>
              ))}
          </div>
        </div>
      )}
      {(state.matches("promtEnterPassword") ||
        state.matches("validatingAuth")) && (
        <form
          onSubmit={(f) => {
            f.preventDefault();
            send({
              type: "VALIDATE_AUTH",
              password: f.currentTarget["PASSWORD"].value,
            });
          }}
        >
          <h2 className="text-4xl font-semibold  ">Enter Your Password 🔑</h2>
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mt-6  "
          >
            {club && club?.photoUrl && (
              <Image
                src={club.photoUrl}
                width="100"
                height={100}
                alt={`Logo of ${club.name}`}
                className="w-24"
              />
            )}
            {club && !club.photoUrl && (
              <AvatarGenerator big name={club.name} />
            )}
            <h3 className="text-3xl font-semibold mt-4">
              {club.name}

            </h3>
            <input
              name="PASSWORD"
              required
              className="w-full  bg-transparent py-4 rounded-2xl mt-4 outline-none
                        pl-4 text-slate-900 placeholder:text-slate-800  font-semibold
                        focus:text-lg  transition-all ring-4  ring-yellow-400 
                        xl:mt-6 xl:py-5
                        "
              type="password"
              placeholder="Enter your password here"
            />
            {error && (

              <p
                className="text-sm text-white
                    bg-red-500 px-4 py-1 rounded-xl mt-2
                    "
              >
                {error}

              </p>
            )}
            {state.matches("validatingAuth") && (
              <span className="text-lg bg-orange-300 px-2 py-4 rounded-2xl block mt-6 text-center font-semibold ">
                Verifying you 👁️
              </span>
            )}
            {state.matches("promtEnterPassword") && (
              <div>
                <button
                  type="submit"
                  className=" ring-4 bg-sky-400 ring-sky-400 ring-opacity-50 hover:ring-sky-300 w-full mt-8 btnFtrs text-lg"
                >
                  Login 🐣
                </button>
                <button
                  type="submit"
                  onClick={() => send("GO_BACK")}
                  className=" ring-4 bg-rose-400 ring-rose-400 ring-opacity-50 hover:ring-rose-300 w-full mt-4 btnFtrs text-lg"
                >
                  Go Back 🥚
                </button>
                {/* <ChildComp send={send} /> */}
              </div>
            )}
            {state.matches("authSuccessful") && (
              <div>
                <h2 className="text-4xl font-semibold  ">
                  Login Successfull 🫡
                </h2>
              </div>
            )}
          </motion.div>
        </form>
      )}
    </section>
  );
};

export default ClubAuth;

// const ChildComp: React.FC<{send: Sender<ClubAuthEvent>}> = ({send}) => {
//   send("")
//   return (
//     <h1>heeffe</h1>
//   )
// }
