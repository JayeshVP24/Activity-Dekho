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
export type ClubAuthEvent =
  | { type: "LOGIN" }
  | { type: "SELECT_CLUB"; club: ClubType }
  | { type: "RETRY" }
  | { type: "GO_BACK" }
  | { type: "CLOSE_MODAL" }
  | { type: "OPEN_MODAL" }
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
  /** @xstate-layout N4IgpgJg5mDOIC5QGMA2BXARgYgMIBkB5AZQFEB9AWUIBEBBfAbQAYBdRUABwHtYBLAC59uAOw4gAHogC0ARgDsANgB0zAKwAmeQA4AzLu0aNa5gBZtAGhABPGRt0BOZWu2LZG5tve7F8hwF9-KzQsbEIABVIAOSpaBhZ2JBAefiFRcSkEWQVlBwcXRV1TDQdtNQNZK1sEaQ1ZbWcHUyL5LXNZUzV5QOCMTGVUbigYCEJ0AWwiAHEASSiE8RTBYTEkzNrlbVKNdvlW02YjXyqZXVllOvM1NULtO4P6npAQ-pgBIREoXD7YfD5YCYQURgZR8EQAN24AGsQW8Xqh-gIFkklmlVqBMpo1MpfK5PBV7MYTllDrkFE1WnVtPJZIcni9lG8Pl8fn8AdgwAAnTncTnKTioACGAgAZryALaMsACeGI5FcXjLdJrRCaZSmDrMZi6dT2UwaxTE9zYrUOXTyUytXR6+z0vrKCD-AWC6xgllYX6I7BkfCkXAAFXIBAAqgAheXJRVojKIc2mZSOEyuakOWTm4kaRTxnT60yKTyHYzyXR2rAOp1C12fUjc3nYABKpH99YAmhHUSsYwhMypaRbTHk1MU-BojfZnMwzUo3JOtIpFKX+pweeKBKQRAIueFBbBYAB3XkQbAANQYM3o-oodGD-oAEu2o52Vd3XAnLamHGZFDdDTZEJ15E2cx8VnLUukXfkVzXDctx3fdD2wKZCHIUM6FwABpB9UifDFVTuTZfHkScvA1Do1GJAwGnkLpCiI4pZHKEsgmee1wUFBEIGFN06HGAALbAgREEEwUhGFlDYjjhTAQU+KwpV0Ukf8tUafJsmYeprkOYlFD0BNShMWQHEpHwmN6MsJL4TjmR4gR+K5Hk+WdUUJXE9jLKkmTbLk6NnyaZQGLqEptS8IjMwojQGm1GlCgHBx7G1RcwkiGJqHoJhZESBVsOVXCEE6FQ83abV7DUUpf2qORDAufVdCxbRPGMb9AmYkRuAgOBxBeRZHxyxSaiMJxtE6dS4r8Q4zVHP8amtQDPDcHZ9UUCK9AgwZhkgMYBG67KFPWepziGgzRs-EprWJZgIKZN1vg9NktpRHrdsQQLch2a0avNRR8l0YlpAHCctWyZo-CaNoIMdWBnSrd1ME9AFtvkrtSsAtxSiGz9zEzH6pq0XR1U8AKdPNeqF2YhkIaht0awchGfNyjpci8dwtmyQwHG-eQM2aHEIs0Mp2YAtQIOXbhV3XTdOW3XcD05CBaZwvrzRR9RDJm658yKCjqQnJRih1OpyQgiyrO4vj5d6zItHOVMzGYDmLS2dMpqHDQLlnAXii0HQIM83jiHQZBkDgWARXQVBzaehAdNd0HXDOPZNHUYlrnOTNVPsGk8yKZr-CAA */
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
            // console.log("inside machine event: ", event.data)
            return event.data as ClubType[]}
        }),
    
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
