import { assign, createMachine, ActorRefFrom } from "xstate";
import { ClubType } from "../../types";

export interface ClubAuthContext {
  club?: ClubType;
  error?: string;
  clubList?: ClubType[];
  password?: string;
  loggedIn: boolean;
  modalOpen: boolean;
  loading: boolean;
}
type ClubAuthEvent =
  | { type: "LOGIN" }
  | { type: "SELECT_CLUB"; club: ClubType }
  | { type: "RETRY" }
  | { type: "GO_BACK" }
  | { type: "CLOSE_MODAL" }
  | { type: "VALIDATE_AUTH", password: string }
  | {type: "error.platform.getclublist", data: {error: string}}
  | {type: "error.platform.validateauth", data: {error: string}}
  const ClubAuthMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGMA2BXARgYgMIBkB5AZQFEB9AWUIBEBBfAbQAYBdRUABwHtYBLAC59uAOw4gAHogC0ARgDsANgB0zAKwAmeQA4AzLu0aNa5gBZtAGhABPGRt0BOZWu2LZG5tve7F8hwF9-KzQsZVRuKBgIQnQBbCIAcQBJADkWdiQQHn4hUXEpBGYrW0LA4IxMZRgBIREoXArYfD5YOIhRMGU+EQA3bgBrTuqQzFQWgXTxbMFhMUyCzTVlX1dPA29jYsRZZg1lBwUHU3kjWW15HY0ykBGqsBru+sbm1uwwACd37nflTlQAQwEADNvgBbO4CEZjVqTTLTXJzUALPamWSmZjMXTqeymVGKLYIdxLDEOXTyY72HH2a63CAtP7-ayPBpYJrjbBkfCkXAAFXIBAAqgAhWFcXgzPLzRBk0zKRwmVznA5kgkaRSynS40yKTy7YzyXQ0irKOmwBlMuqkT7fbAAJVIPNtAE1RVlxQj8og1SoduTTA4HGpTFoHBoCd5nMxSUo3FGtIpFEbQpwvqCBKQRAIPgAFf6wWAAd2+EGwADUGEl6DyKHQBTyABKu+GzT0IDSuOXHA4OMyKNQJgmmNTyZTacxrOMY4dJyop7hpjNZ965-NF94lhKEchCui4ADSTfdLalCBc2lHvnkUa8qLRagJBnP8mHijJZg0sjU+hnyh6-zGECAo8dCxAAFtg7QiJ03R9IMv7-nwgFZv8YGHjkx5Iog2pOLIRwBp+5xqF+ugEr4zDKIcaiBhooYKNOQQ3Maf4AUBdQgQI4EfF8PwMsCYLwSxyGoWwUxHpKmEIEcFGaO4PbrFeaoPu2qhkrIr7+qGWKGtcIjcBAcDiCMonoeJkh2DRo5DswuEhrspJhjYMi6FoqiuN46p+MGRw-uEkSQDEAjGRKiJmQgcheJZJg2X4dnOQSzA-tUtRPKyLyBXCYkhQUH57KGpjObi+hKIGJGOWF-qRhishomSAbBuSP6muazLPOMQUeieVEjm4DjaGOPbmGqpUlFoujKOiXiaIoeg6MwiYMbS9IAhaUBWtx7UYaFaL7F47jaAcZw0X28iqvlyztpo2hUeqw5qD+c4LpmOZ5oWxYbaZBRkt16i4c5z79pipgPuckZKMGWIfocP7MYhrFQOxoHvVlXoXPsOzosd5L7SqZVBnsHihg46rBloOg-ihHHEOgyDIHAsBAugqBI62025cGri6Aoz4ePeuNqLIyhqoG3gXNquimIEgRAA */
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
        loggedIn: false,
        modalOpen: false,
        loading: false
      },
      tsTypes: {} as import("./clubAuth.typegen").Typegen0,
      on: {
        "CLOSE_MODAL": {
          target: "loggedOut",
          actions: ["closeModal", "clearErrorMsgFromContext"]
        }
      },
      states: {
        loggedOut: {
          on: {
            LOGIN: {
              target: "gettingClubsList",
              actions: ["openModal"]
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

          entry: "setLoadingTrue",
          exit: "setLoadingFalse"
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
              target: "gettingClubsList",
              actions: ["clearErrorMsgFromContext"],
            }
          }
        },

        promtEnterPassword: {
          on: {
            VALIDATE_AUTH: "validatingAuth",
            GO_BACK: {
              target: "displayingClubsList",
              actions: "clearErrorMsgFromContext"
            }
          },
        },

        validatingAuth: {
          invoke: {
            src: "validateAuth",
            id: "validateauth",
            onDone: {
              target: "authSuccessful",
              actions: ["changeContextToLoggedIn", "closeModal"]
            },
            onError: {
              target: "promtEnterPassword",
              actions: "addErrorMsgToContext",
            },
          },
        },

        authSuccessful: {
          entry: "clearPasswordFromContext",
          type: "final",
          exit: "moveToDashboardPage"
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
          error:(_) => undefined
        }),
        clearPasswordFromContext: assign({
          password: (_) =>undefined
        }),
        openModal: assign({
          modalOpen: true
        }),
        closeModal: assign({
          modalOpen: false
        }),
        setLoadingTrue: assign({
          loading: true
        }),
        setLoadingFalse: assign({
          loading: false
        })
      },
    }
  );

export default ClubAuthMachine;

export type ClubAuthActor = ActorRefFrom<typeof ClubAuthMachine>

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
