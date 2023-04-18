import { assign, createMachine, ActorRefFrom } from "xstate";
import { ClubType } from "../utils/types";

export interface ClubAuthContext {
  club?: ClubType;
  error?: string;
  clubList?: ClubType[];
  // filteredClubList?: ClubType[];

  password?: string;
  loggedIn: boolean;
  modalOpen: boolean;
  loading: boolean;
}
export type ClubAuthEvent =
  | { type: "LOGIN" }
  | { type: "SELECT_CLUB"; club: ClubType }
  | { type: "RETRY" }
  | { type: "GO_BACK" }
  | { type: "CLOSE_MODAL" }
  | { type: "LOGOUT" }
  | { type: "OPEN_MODAL" }
  | { type: "FILTER_CLUB_LIST", query: string }
  | { type: "VALIDATE_AUTH", password: string }
  | {type: "error.platform.getclublist", data: string}
  | {type: "error.platform.validateauth", data: string}
  
// interface ClubAuthServices  {
//   getClubsList: {
//     data: { clubs?: ClubType[], error?: string };
//   };
//   validateAuth: {
//     data: {club?: ClubType, error? :string}
//   }
// } 

  const ClubAuthMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGMA2BXARgYgMIBkB5AZQFEB9AWUIBEBBfAbQAYBdRUABwHtYBLAC59uAOw4gAHogC0ARgDsANgB0zAKwAmeQA4AzLu0aNa5gBZtAGhABPGRt0BOZWu2LZG5tve7F8hwF9-KzQsbEIABVIAOSpaBhZ2JBAefiFRcSkEWQVlBwcXRV1TDQdtNQNZK1sEaQ1ZbWcHUyL5LXNZUzV5QOCMHAjo2PomWUSuXkFhMSTMzpVTRXbmXXs1UsUqmXqNZQ1TZs0XT2NFNR6QEMxlVG4oGAhCdAFsIgBxAEkohPEUyfSZmS6XJ5dyKQzMZilbStSw2RDyZSuRQOPbuUyyBwGFznS7KGACIQiKC4PqwfB8WDPCCiMDKPgiABu3AA1rT8ZdUBSBN8kr80tNQJlDspfK5PBV7MZNllmDsHAomq06tDZLKcX08WACfTiaTyZTsGAAE5G7hG5ScVAAQwEADMzQBbTUCDlcnnjVJTDKITTKdGmCG6dT2fayDZwrLGVSQ3TyUytFZFezqrDKCAUy1W6w6klYMlc7BkfCkXAAFXIBAAqgAhd3JCb870IWOmZSOEyuaHy2PSjSLZQ6fYLTyy4zyXQpq7p2CZ7NE0gms3YABKpFLy4AmnW+V6AQg+ypVXHTHk1MU-Bppd5nDGlG5IVpFIpJxbTQ6BKQRAJjeErbBYAA7maEDYAAagw7z0KWFB0JWpYABLbg2u6CogGiuG28byg4ZinE+0qdAi2jmOKD4Ql0L6cG+H5fj+f6AcB2CvIQ5DVnQuAANJIZ6-yoQgLgNK48jyJCXjoh0ajSgYDTyF0hQicUsjlBOQQXBqDJWpyEA2jqdBPAAFtg1IiLS9JMqyygaVpNpgFaBncX8AqSIgAbMI0+TZMw9RqCYl4RmCQKOGUXkOEqPgqb0qZWXw2mElAekCIZxqmuamZ2o6lmaTFNl2YlDmNnuTTKEpdQlMsXgiX2UnoaosZhkUeT2MsgSqSI3AQHA4iXD8yG8c5NRGE4xEmBiWg4SUKzStIKwIp4bhGNo0JmNCL43HckCPAIPU8U5mRyF4iKdCFY2ypifnVMwL74nFuaYPmlLbY5TalbkewrPs+hKPkuhTSeN4QtkzR+E0bQvtOs45nqXKPQVfFrAibhQiey19j9EZaECAZeJoAU6Mwz6qbi4PWnOUALilMMof1HS5F47jaPK2wOKc8i9s0IroZoZTM4RZyExqVHcO+n7fkav7-kBRoQJTfWZLGCPqBiM0+YoyymFJ0I3koxRBnUCovtFsW6QZMu7Wh8iyLkqoBizcYMz2EZnjsHgojzxRaDoL65fpxDoMgyBwLAtroKgptNmCcrFK4ugKLJHiSY7aiW32Hn2BbCxFC1-hAA */
  createMachine(
    {
      predictableActionArguments: true,
      id: "club",
      initial: "loggedOut",
      schema: {
        services: {} as {
          getClubsList: {data: ClubType[] | string} ;
          validateAuth: {
            data: ClubType | string
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
        },

        "OPEN_MODAL": [{
          target: "gettingClubsList",
          actions: ["openModal", "clearErrorMsgFromContext"],
          cond: "notLoggedIn"
        }, {
          target: ".authSuccessful",
          actions: "closeModal"
        }]
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
            }
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
              actions: ["changeContextToLoggedIn", "closeModal", "moveToDashboardPage"]
            },
            onError: {
              target: "promtEnterPassword",
              actions: "addErrorMsgToContext",
            },
          },
        },

        authSuccessful: {
          entry: ["clearPasswordFromContext"]
        }
      },
    },
    {
      guards: {
        notLoggedIn: (context) => {
          return context.loggedIn ? false : true
        }
      },
      actions: {
        addClubsListToContext: assign({
          clubList: (_,event) => {
            // // console.log("inside machine event: ", event.data)
            return event.data as ClubType[]},
          // filteredClubList: (_, event) => event.data as ClubType[]
        }),
        // filterClublist: assign({
        //   // filteredClubList: (context, event) => {
        //   //   return context.clubList.filter(f => f.name.toLowerCase().includes(event.query.toLowerCase()))
        //   // }
        // }),
    
        addClubToContext: assign({
          club: (_, event) => event.club
        }),
 
        changeContextToLoggedIn: assign({
          loggedIn: true
        }),
        addErrorMsgToContext: assign({
          error: (_,event) => event.data as string
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
