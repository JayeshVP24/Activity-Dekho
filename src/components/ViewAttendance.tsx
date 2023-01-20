import { useActor } from "@xstate/react";
import { useContext } from "react";
import { GlobalStateContext } from "./GlobalStateProvider";

const ViewAttendance: React.FC = () => {
  const globalServices = useContext(GlobalStateContext);
  const [state, send] = useActor(globalServices.clubEventService);

  return (
    <section>
      <div className="">
        <h2 className="text-2xl font-medium ">Attendance</h2>
        <h3 className="text-4xl font-semibold mt-2">
          {state.context.currentEvent.name}
        </h3>
      </div>
      <input
        className="w-full outline-none rounded-full px-4 py-2 mt-4 bg-opacity-50 bg-white
            "
        type="text"
        placeholder="Search"
        onChange={(e) => {
          console.log(e.target.value);
          send({ type: "FILTER_ATTENDANCE", query: e.target.value });
        }}
      />
      <div className="flex flex-col gap-y-4 mt-6 h-72 overflow-auto customScrollbar">
        {state.context.filteredAttendance.length === 0 && (
          <div>
            <p className="text-center text-3xl">No attendance found</p>
            <button
              className="btnFtrs bg-yellow-200 px-6 w-full mt-4 hover:bg-yellow-300"
              onClick={() => {
                send("CLOSE_VIEW_ATTENDANCE")
                send({type: "ADD_ATTENDANCE", currentEvent: state.context.currentEvent})}}
            >
              Add Attendance
            </button>
          </div>
        )}
        {state.context.filteredAttendance.map((a) => (
          <span
            key={a}
            className="flex justify-between w-full max-w-sm mx-auto bg-lime-300 px-4 py-1 rounded-2xl
          "
          >
            <p> {a}</p>
            <button className="bg-red-400 px-2 rounded-3xl">Delete</button>
          </span>
        ))}
      </div>
    </section>
  );
};

export default ViewAttendance;
