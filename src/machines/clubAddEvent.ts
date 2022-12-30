import { createMachine, assign, sendParent } from "xstate";


export const ClubAddEventMachine = 
/** @xstate-layout N4IgpgJg5mDOIC5QEMIQKIDcwDsAusAdAJYQA2YAxAMoAqAggEq0DaADALqKgAOA9rGJ5ifHNxAAPRGwA0IAJ7SAvkrmoM2fEQAWYMmT4B3PgCcyESvQAiVgProAaugBytQo3TUACgHlndryYXVk5xfkFhUXEpBABOABZCWIAOACYARgB2AGZ47IBWWLZ8rLlFBFTU-MIANnzi+PzknLrY7OSVVRAcPgg4cXUsXAIwgSERMSRJRABaKszCTNTm7NX45LT02LLZ5sJ6tkO2LPiazMz4zJU1NCGtEnIwUYiJ6MR0msTko-Tk7PSGjUNjsEAC2IRUj9KmxMmx-lVriBBpoCIQ+nhkMQyPApuFxlEpjEZul8ol8iV4sd0tTkvkMiDshl9ikailGjUCvkaojkcMdHoDMYzBBnvjJqAiZDYotljk1hsMtsFO9-oQYfFqdkaul-pluZ0gA */
createMachine({
    id: "addEvents",
    preserveActionOrder: true,
    predictableActionArguments: true,
    initial: "idle",
    tsTypes: {} as import("./clubAddEvent.typegen").Typegen0,
    context: {
        name: ""
    },    
    states: {
        idle: {
            on: {
                START: 'helloworld'
            }
        },
        helloworld: {
            on: {
                "ADD_EVENT.RESPOND_PARENT": {
                    actions: sendParent("ADD_EVENT.DONE"),
                    target: "responded"
                }
            }
        },
        responded: {}
    }
})