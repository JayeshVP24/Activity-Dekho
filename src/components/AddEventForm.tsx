import { useActor } from "@xstate/react";
import { useContext } from "react";
import { GlobalStateContext } from "./GlobalStateProvider";
import { Timestamp } from "firebase/firestore";
const AddEventForm: React.FC = () => {
  const globalServices = useContext(GlobalStateContext);
  const [state, send] = useActor(globalServices.clubEventService);

  return (
    <section>
      <div className="">
        <h3 className="text-4xl font-semibold mt-2">Add New Event</h3>
        <form className="mt-4 flex flex-col gap-y-4"
        onSubmit={(e) => {
            e.preventDefault()
            send({type: "ADD_EVENT.SUBMIT", newEvent: {
            name: e.currentTarget["NAME"].value,
            activityHours: e.currentTarget["ACTIVITY_HOURS"].value,
            startDate: Timestamp.fromDate(new Date(e.currentTarget["FROM"].value)),
            endDate: Timestamp.fromDate(new Date(e.currentTarget["TO"].value))
        }})}}
        >
          <span>
            <label htmlFor="NAME" className=" font-medium xl:text-lg ">
              Event Name
            </label>
            <input
            required
              name="NAME"
              className="w-full border-2 bg-transparent border-white py-2 rounded-2xl mt-2 outline-none
          pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
          text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
          xl:mt-4 xl:py-2
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
              className="w-full border-2 bg-transparent border-white py-2 rounded-2xl mt-2 outline-none
          pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
          text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
          xl:mt-4 xl:py-2
          "
              placeholder="Event Name"
            />
          </span>
          <span>
            <label htmlFor="FROM" className=" font-medium xl:text-lg ">
              From
            </label>
            <input
            required
              name="FROM"
              type="date"
              className="w-full border-2 bg-transparent border-white py-2 rounded-2xl mt-2 outline-none
            pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
            text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
            xl:mt-4 xl:py-2
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
              className="w-full border-2 bg-transparent border-white py-2 rounded-2xl mt-2 outline-none
            pl-4 text-slate-900 placeholder:text-slate-600  font-semibold
            text-lg  transition-all ring-4 focus:ring-orange-400 ring-orange-300
            xl:mt-4 xl:py-2
            "
              placeholder="Event Name"
            />
          </span>
          <button
            type="submit"
            className="bg-green-400 ring-4 ring-green-200  hover:ring-green-300 w-full mt-8  btnFtrs
        "    
          >
            🚀 Add Event 🚀
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddEventForm;
