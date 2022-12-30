import { assign, createMachine } from "xstate";
import { ClubType } from "../../types";

interface ClubAuthContext {
  club?: ClubType;
  error?: string;
  clubList?: ClubType[];
  password?: string;
  loggedIn: boolean
}
type ClubAuthEvent =
  | { type: "LOGIN" }
  | { type: "SELECT_CLUB"; club: ClubType }
  | { type: "RETRY" }
  | { type: "RETRY_PASSWORD" }
  | { type: "GO_BACK" }
  | { type: "VALIDATE_AUTH", password: string }
  | {type: "error.platform.getclublist", data: {error: string}}
  | {type: "error.platform.validateauth", data: {error: string}}
  
// type ClubAuthTypestate =
//   | {
//       value: "loggedOut" | "gettingClubsList";
//       context: ClubAuthContext & {
//         club: undefined;
//         error: undefined;
//         clubList: undefined;
//         password: undefined;
//       };
//     }
//   | {
//       value: "displayingClubList" | "promtEnterPassword";
//       context: ClubAuthContext & {
//         club: undefined;
//         error: undefined;
//         password: undefined;
//         clubList: ClubType[];
//       };
//     }
//   | {
//       value: "displayingError";
//       context: ClubAuthContext & {
//         club: undefined;
//         error: string;
//         password: undefined;
//         clubList: undefined;
//       };
//     };

const ClubAuthMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGMA2BXARgOlQeyhggHl0AXAYgBliBxASQDkBtABgF1FQAHPWASzL88AOy4gAHolYAaEAE9pAXyVy0WbDDJCRUAMIZMsKv1iUIosNn4iAbngDWVresypTZNpyQheAoaLiUggArABMIdgAbADsABxRrHEAzHEAjGHJEXKKCGmsYdgAnGkxRQAsMWFhaXEx+WEqaoaaYNo2+obGHhRgAE59eH3Y3KgAhmQAZkMAtq1kru5mXuJ+gsJiPsHh2OVpyfFhMckhVbXlOYhptdhpUSGsp8lRcZlRaSFNIK7YEKajY3kHQMWG6ZgoAGUAKJUKF6AAqAH09FQAKoAIRWPjWAU2oGCB3K2GSRQeCTqJQOlwQYSiRPi5UZiTiBQixy+Pz+sABQN0UIGQwoACUofChQBNLE8PjrQJbRAAWjC5VYuxSIQqRVpJ1YUWpaQq2EeETqqWStTeHJa3EGMzIUJEZH6AAUxrBYAB3IYQCgANQAglR6AARf3wqGI-2o+EACSlvhluKCiDCCWJlRKRVY5XuUT1CkQ5VO2Di5RZKVYWtYjxiVo0tjG7ggEw6-vIAAsKBYRFYbPYnNgG02JmAxh34ziNsmEDmirdNSUQnUQiFkslqbFVaVSaSwlrSqc6zgh-xmzooG2yJ3+oNhgCprNB43TyOx1eJ4mp-KEAqtdhwjURQkpW2blEB1KnHExIPOURwskUCFlkevz-OMvIXh2-K3sKooSoizr+hCEIAOrEEKwYfv4X74lcmS3MqcQpPcYFRCUaTUmuMRGqmdw1EuZbpMhNp4HaDpOn0rrul6fQ+rQxCIui-p6AA0pRsp4pIiBLlBCQxDElbpHsaRFhxjHYDEpxRAc2Z8WuKiqCAIh4BAcDiK4qyfnKNE-qmUFlicmrag8VnUgq+RpLcpYgdWjFgSE5TIfghCQKQZAeVRXmaT+tQRaWDwGkcWZ7lk1KsMhWjniCRgmGY6XqdOYRJLs9RZMqJx1Ik+a5GFyTRFFcSriE+wsoByFcjywJdDVaXYp5GnbEUXHvEUsVZmW2rUkcvUquk4QvAcLJRGNqGAh0WFDHVSbfquxRFtmDx7tU4TsQWNLHLsSS8RqZTlCcCUOT8wmiY6Lpup63qXdRWUHEtjwGlkFkhIkyQXK9qRcQ8MR0pkBTXGUyEnmerYdpDmXBEcEUlNmuqnDEZZATEEGwdgjVakUdKwUc8TIW+7YQugyDIHAsCTOgqCk-NiAvIUFSplZpQWY1IQQUNLOsUNmT1DmKPHdyaHE1e519BL049aqSO47BgXpOur0qnOA17uzv2rlqtb2UAA */
  createMachine(
    {
      predictableActionArguments: true,
      id: "club",
      initial: "loggedOut",
      schema: {
        services: {} as {
          getClubsList: {
            data: { clubs?: ClubType[], error?: string };
          };
          validateAuth: {
            data: {club?: ClubType, error? :string}
          }
        },
        events: {} as ClubAuthEvent,
        context: {} as ClubAuthContext,
      },
      context: {
        club: undefined,
        clubList: undefined,
        error: undefined,
        password: undefined,
        loggedIn: false
      },
      tsTypes: {} as import("./clubAuth.typegen").Typegen0,
      states: {
        loggedOut: {
          on: {
            LOGIN: {
              target: "gettingClubsList",
            },
          },
        },

        gettingClubsList: {
          invoke: {
            src: "getClubsList",
            id:"getclublist",
            onDone: {
              target: "displayingClubsList",
              actions: "addClubsListToContext",
              internal: true
            },

            onError: {
              target: "displayingError",
              actions: "addErrorMsgToContext"
            }
          },
        },

        displayingClubsList: {
          on: {
            SELECT_CLUB: {
              target: "promtEnterPassword",
              actions: "addClubToContext",
            },
          },
        },

        displayingError: {
          on: {
            RETRY: {
              target: "loggedOut",
              actions: ["clearErrorMsgFromContext"],
            }
          },
        },

        promtEnterPassword: {
          on: {
            VALIDATE_AUTH: "validatingAuth",
            GO_BACK: "displayingClubsList"
          },
        },

        validatingAuth: {
          invoke: {
            src: "validateAuth",
            id: "validateauth",
            onDone: {
              target: "authSuccessful",
              actions: "changeContextToLoggedIn"
            },
            onError: {
              target: "displayingAuthError",
              actions: "addErrorMsgToContext",
            },
          },
        },

        authSuccessful: {
          entry: "clearPasswordFromContext",
          type: "final",
        },

        displayingAuthError: {
          on: {
            RETRY_PASSWORD: {
              target: "promtEnterPassword",
              actions: ["clearErrorMsgFromContext"],
            }
          }
        }
      },
    },
    {

      actions: {
        addClubsListToContext: assign({
          clubList: (_,event) => event.data.clubs
        }),
    
        addClubToContext: assign({
          club: (_, event) => event.club
        }),
 
        changeContextToLoggedIn: assign({
          loggedIn: true
        }),
        addErrorMsgToContext: assign({
          error: (_,event) => event.data.error
        }),
        clearErrorMsgFromContext: assign({
          error: () => ""
        }),
        clearPasswordFromContext: assign({
          password: () => undefined
        }),
      },
    }
  );

export default ClubAuthMachine;

// export const ClubLoginMachine =
//   /** @xstate-layout N4IgpgJg5mDOIC5QGEA2BXARgAgDIHsoBLAO2wFkBDAYwAtSwA6IiVMAYinwBV8DiSAbQAMAXUSgADvlhEALkXwkJIAB6JhAGhABPDQF9D2kvghwVaLHkKkKNeiTArpshUpXqEAWgAsADm09bz8AdkYAViMQSxx+Wyo6BmZWJyQQF3lFZTTPLV1EAEYCvwiATnLS4T8fHxCAJgA2cIaomOsBO0THRhg5BRIoGNwiWDlnGUz3HMLSgsYCitKG0v86nzq6wMRK+eE9uoKAZga6w+EfZcNDIA */
//   createMachine<ClubLoginContext>({
//     id: "clubLogin",
//     initial: "idle",
//     preserveActionOrder: true,
//     predictableActionArguments: true,
//     context: {
//       name: "",
//       addEventRef: null,
//     },
//     states: {
//       idle: {
//         entry: assign({
//           addEventRef: () => spawn(ClubAddEventMachine, "addeventref"),
//         }),
//         on: {
//           "ADD_EVENT.START": {
//             actions: send(
//               { type: "START" },
//               {to: "addeventref"}
//             ),
//           },
//           "ADD_EVENT.DONE": {
//             target: "eventAdded"
//           }
//         },
//       },
//       gettingClubList: {},
//       eventAdded: {}
//     },
//   });

//   export const remoteMachine = createMachine({
//     id: 'remote',
//     initial: 'offline',
//     states: {
//       offline: {
//         on: {
//           WAKE: 'online'
//         }
//       },
//       online: {
//         after: {
//           1000: {
//             actions: sendParent('REMOTE.ONLINE')
//           }
//         }
//       }
//     }
//   });

//   export const parentMachine = createMachine({
//     id: 'parent',
//     initial: 'waiting',
//     // schema: {
//     //     context: { } as {
//     //         localOne: string
//     //     }
//     // },
//     context: {
//       localOne: null
//     },
//     states: {
//       waiting: {
//         entry: assign({
//           localOne: () => spawn(remoteMachine, "localOne")
//         }),
//         on: {
//           'LOCAL.WAKE': {
//             // actions: send({ type: 'WAKE' }, { to: (context) => context.localOne })
//             actions: sendTo("localOne", {type: "WAKE"})
//           },
//           'REMOTE.ONLINE': { target: 'connected' }
//         }
//       },
//       connected: {}
//     }
//   });
