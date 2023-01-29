import { useActor } from "@xstate/react";
import { useContext } from "react";
import { Attendee } from "../../enums";
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
        {state.context.currentAttendance.length === 0 && (
          <div className="my-auto" >
            <p className="text-center text-3xl">No attendance found 🤧</p>
            <button
              className="btnFtrs bg-yellow-200 px-6 w-full mt-4 hover:bg-yellow-300"
              onClick={() => {
                send("CLOSE_VIEW_ATTENDANCE");
                send({
                  type: "ADD_ATTENDANCE",
                  currentEvent: state.context.currentEvent,
                });
              }}
            >
              Add Attendance
            </button>
          </div>
        )}
        {(state.context.currentAttendance.length !== 0 && state.context.filteredAttendance.length === 0) && (
          <div className="my-auto" >
            <p className="text-center text-3xl">No one with that query 💀</p>
          </div>
        )}
        {state.context.filteredAttendance.map((a) => (
          <span
            key={a.id}
            className="flex flex-col justify-between w-full  mx-auto bg-lime-300 px-4 py-2 rounded-2xl
          "
          >
            <p className="flex items-center">
              {a.id}{" "}
              <span className="italic bg-amber-200 px-2 rounded-full ml-auto text-sm">
                {a.attendee}
              </span>
            </p>
            <span className="mt-2 text-sm flex flex-grap gap-x-4 ">
              <button className="bg-red-400 px-4 rounded-3xl capitalize outline-none">delete</button>
              <select
                onChange={e => console.log(e.target.value)}
                className="bg-red-400 px-3 w-max rounded-3xl  outline-none   "
                defaultValue={a.attendee}
              >
                {Object.values(Attendee).map((o) => (
                  <option value={o}
                  key={o}
                  // selected={o === a.attendee}
                  className="capitalize px-2"
                  > {o.toString()}</option>
                ))}
              </select>
            </span>
          </span>
        ))}
      </div>
    </section>
  );
};

export default ViewAttendance;
