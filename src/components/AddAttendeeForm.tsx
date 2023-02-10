import { useActor, useSelector } from "@xstate/react";
import { useContext } from "react";
import { GlobalStateContext } from "./GlobalStateProvider";
import { Timestamp } from "firebase/firestore";
import { Attendee, EventScope } from "../utils/enums";
const AddAttendeeForm: React.FC = () => {
  const globalServices = useContext(GlobalStateContext);
  //   const [state, send] = useActor(globalServices.clubEventService);
  const { send } = globalServices.clubEventService;
  const eventName = useSelector(
    globalServices.clubEventService,
    (state) => state.context.currentEvent.name
  );
  const errorMsg = useSelector(
    globalServices.clubEventService,
    (state) => state.context.errorMsg
  );
  return (
    <section>
      <div className="max-h-[38rem] overflow-y-scroll p-2 customScrollbar">
        {errorMsg && (
          <p className="text-red-600 text-xl font-semibold">{errorMsg}</p>
        )}
        <h3 className="text-2xl font-semibold mt-2">Add Attendee to</h3>
        <h3 className="text-4xl font-semibold mt-2">{eventName}</h3>
        <form
          className="mt-4 flex flex-col gap-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            send({
              type: "ADD_ATTENDEE.SUBMIT",
              attendeeId: e.currentTarget["ERP"].value,
              attendeeType: e.currentTarget["TYPE"].value,
              //   newEvent: {
              //     name: e.currentTarget["NAME"].value,
              //     activityHours: e.currentTarget["ACTIVITY_HOURS"].value,
              //     startDate: Timestamp.fromDate(
              //       new Date(e.currentTarget["FROM"].value)
              //     ),
              //     endDate: Timestamp.fromDate(
              //       new Date(e.currentTarget["TO"].value)
              //     ),
              //     scope: e.currentTarget["SCOPE"].value as EventScope,
              //   },
            });
          }}
        >
          <span>
            <label htmlFor="ERP" className=" font-medium xl:text-lg ">
              Student ERP ID
            </label>
            <input
              required
              name="ERP"
              className="w-full  bg-transparent  py-2 rounded-2xl mt-2 outline-none
                pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
                text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
                xl:mt-2 xl:py-2
                "
              placeholder="Student ERP ID"
            />
          </span>
          <span className="flex flex-wrap items-center gap-x-8">
            <label htmlFor="TYPE" className=" font-medium xl:text-lg ">
              Event Scope
            </label>

            <select
              name="TYPE"
              className="w-max  bg-transparent  py-2 rounded-2xl mt-2 outline-none
                pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
                text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
                xl:mt-2 xl:py-2"
              defaultValue={Attendee.participant}
            >
              {Object.values(Attendee).map((s) => (
                <option>{s}</option>
              ))}
            </select>
          </span>

          <button
            type="submit"
            className="bg-green-400 ring-4 ring-green-200  hover:ring-green-300 w-full mt-8  btnFtrs
        "
          >
            🚀 Add Attendee 🚀
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddAttendeeForm;
