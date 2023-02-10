import { useActor, useSelector } from "@xstate/react";
import { useContext } from "react";
import { GlobalStateContext } from "./GlobalStateProvider";
import { Timestamp } from "firebase/firestore";
import { EventScope } from "../utils/enums";
const EditEventForm: React.FC = () => {
  const globalServices = useContext(GlobalStateContext);
  // const [_, send] = useActor(globalServices.clubEventService);
  const {send} = globalServices.clubEventService
  const {errorMsg, loading, currentEvent} = useSelector(globalServices.clubEventService, (state) => state.context)
  
  return (
    <section>
      <div className="max-h-[38rem] overflow-y-scroll p-2 customScrollbar">
      {errorMsg && <p className="text-red-600 text-xl font-semibold">{errorMsg}</p>}
        <h3 className="text-4xl font-semibold mt-2">Edit Event</h3>
        <form
          className="mt-4 flex flex-col gap-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            send({
              type: "EDIT_EVENT.SUBMIT",
              editedEvent: {
                name: e.currentTarget["NAME"].value,
                activityHours: Number(e.currentTarget["ACTIVITY_HOURS"].value),
                startDate: Timestamp.fromDate(
                  new Date(e.currentTarget["FROM"].value)
                ),
                endDate: Timestamp.fromDate(
                  new Date(e.currentTarget["TO"].value)
                ),
                scope: e.currentTarget["SCOPE"].value as EventScope,
                id: currentEvent?.id
              },
            });
          }}
        >
          <span>
            <label htmlFor="NAME" className=" font-medium xl:text-lg ">
              Event Name
            </label>
            <input
              required
              name="NAME"
              defaultValue={currentEvent?.name}
              className="w-full  bg-transparent  py-2 rounded-2xl mt-2 outline-none
          pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
          text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
          xl:mt-2 xl:py-2
          "
              placeholder="Event Name"
            />
          </span>
          <span>
            <label htmlFor="NAME" className=" font-medium xl:text-lg ">
              Activity Hours
            </label>

            <input
              required
              name="ACTIVITY_HOURS"
              type="number"
              defaultValue={currentEvent?.activityHours}
              className="w-full  bg-transparent  py-2 rounded-2xl mt-2 outline-none
          pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
          text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
          xl:mt-2 xl:py-2
          "
              placeholder="Event Name"
            />
          </span>
          <span className="flex flex-wrap items-center gap-x-8" >
            <label htmlFor="SCOPE" className=" font-medium xl:text-lg ">
              Event Scope
            </label>

            <select name="SCOPE" className="w-max  bg-transparent  py-2 rounded-2xl mt-2 outline-none
          pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
          text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
          xl:mt-2 xl:py-2"
          defaultValue={currentEvent?.scope}
          >
              {Object.values(EventScope).map(s => (
                <option>{s}</option>
              ))}
            </select>

            {/* <input
              required
              name="ACTIVITY_HOURS"
              type="number"
              className="w-full  bg-transparent  py-2 rounded-2xl mt-2 outline-none
          pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
          text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
          xl:mt-2 xl:py-2
          "
              placeholder="Event Name"
            /> */}
          </span>
          <span>
            <label htmlFor="FROM" className=" font-medium xl:text-lg ">
              From
            </label>
            <input
              required
              name="FROM"
              type="date"
              defaultValue={currentEvent?.startDate.toDate().toISOString().split('T')[0]}
              className="w-full  bg-transparent  py-2 rounded-2xl mt-2 outline-none
            pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
            text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
            xl:mt-2 xl:py-2
            "
              placeholder="Event Name"
            />
          </span>
          <span>
            <label htmlFor="TO" className=" font-medium xl:text-lg ">
              To
            </label>
            <input
              required
              name="TO"
              type="date"
              defaultValue={currentEvent?.endDate.toDate().toISOString().split('T')[0]}
              className="w-full  bg-transparent  py-2 rounded-2xl mt-2 outline-none
            pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
            text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
            xl:mt-2 xl:py-2
            "
              placeholder="Event Name"
            />
          </span>
          <button
            type="submit"
            className="bg-green-400 ring-4 ring-green-200  hover:ring-green-300 w-full mt-8  btnFtrs
        "
          >
            {loading ? "Loading 🔃" : "📝 Edit Event 📝"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditEventForm;
