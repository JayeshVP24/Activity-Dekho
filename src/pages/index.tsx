import { NextPage } from "next";
import { useMachine, useActor } from "@xstate/react";
import ClubAuthMachine from "../machines/clubAuth";
import { ClubAddEventMachine } from "../machines/clubAddEvent";
import ClientOnly from "../components/ClientOnly";
import { ActorRefFrom } from "xstate";
import { getClubsListQuery, validateAuthQuery } from "../firebase/Club";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useEffect } from "react";

const Index: NextPage = () => {
  const [state, send] = useMachine(ClubAuthMachine, {
    services: {
      getClubsList: async () => await getClubsListQuery(),
      validateAuth: async (context, event) =>
        validateAuthQuery(context.club.name, context.club.email, event.password ),
    },
  });

  // useEffect(() => {
  //   signInWithEmailAndPassword(auth,"sort.tcet@gmail.com", "sort123")
  //     .then((userCred) => {
  //       console.log(userCred.user)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  // },[])
  // const [state2, send2] = useActor(state.context.addEventRef);
  // console.log(state.nextEvents);
  return (
    <ClientOnly>
      <div>
        <div>
          <pre className="mb-8">
            {JSON.stringify(
              {
                value: state.value,
                context: state.context,
              },
              null,
              2
            )}
          </pre>
          <div className="flex gap-x-5">
            {state.nextEvents.map((event) => (
              <button key={event} onClick={() => send(event)}>{event}</button>
            ))}
          </div>
          <div className="flex gap-x-5 ">
            {state.matches("displayingClubsList") &&
              state.context.clubList.map((c) => (
                <span key={c.name} className="cursor-pointer" onClick={() => 
                send({ type: "SELECT_CLUB", club: c })}>
                  {c.name}
                </span>
              ))}
          </div>
          {state.matches("promtEnterPassword") && (
            <form onSubmit={(f) => {
              f.preventDefault()
              send({type: "VALIDATE_AUTH",password: f.currentTarget["PASSWORD"].value })
              }} >
            <input 
              type="password"
              name="PASSWORD"
              placeholder="enter your password"
            />
            <button type="submit">Submit</button>
            </form>
          )}
        </div>
        {/* <div className="mt-10">
        <pre className="mb-8">
          {JSON.stringify(
            {
              value: state2.value,
              context: state2.context,
            },
            null,
            2
          )}
        </pre>
        <div className="flex gap-x-5" >
          {state2.nextEvents.map((event) => (
            <button onClick={() => send2(event)}>{event}</button>
          ))}
        </div>
      </div> */}
      </div>
    </ClientOnly>
  );
};

export default Index;
