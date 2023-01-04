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
      <div className="flex flex-col gap-y-4 mt-6 h-72 overflow-scroll">
        {state.context.currentEvent.attendance && Object.keys(state.context.currentEvent.attendance).map((a) => (
          <span key={a} className="flex justify-between w-full bg-lime-300 px-4 py-1 rounded-2xl
          ">
            <p> {a}</p>
            <button className="bg-red-400 px-2 rounded-3xl" >Delete</button>
          </span>
        ))}
        
      </div>
    </section>
  );
};

export default ViewAttendance;
