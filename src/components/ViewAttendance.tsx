import { useActor, useSelector } from "@xstate/react";
import { ChangeEvent, useCallback, useContext, useMemo, useState } from "react";
import { Attendee } from "../../enums";
import Confirmation from "./Confirmation";
import { GlobalStateContext } from "./GlobalStateProvider";
import ModalWrapper from "./ModalWrapper";

const ViewAttendance: React.FC = () => {
  const globalServices = useContext(GlobalStateContext);
  const [state, send] = useActor(globalServices.clubEventService);

  const { currentEvent, currentAttendance, currentAttendee, loading, errorMsg } = useSelector(
    globalServices.clubEventService,
    (state) => state.context
  );
  // const { send } = globalServices.clubEventService;

  const [inputData, setInputData] = useState("");
  const inputDataHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputData(e.target.value);
  }, []);
  const filteredAttendance = useMemo(() => {
    if (!inputData) return currentAttendance;
    return currentAttendance?.filter((a) =>
      a.id.toLowerCase().includes(inputData.toLowerCase())
    );
  }, [inputData, currentAttendance]);


  const [attendeeType, setAttendeeType] = useState<Attendee>()

  return (
    <section>
      <div className="">
        <h2 className="text-2xl font-medium ">Attendance</h2>
        <h3 className="text-4xl font-semibold mt-2">{currentEvent?.name}</h3>
      </div>
      <input
        className="w-full outline-none rounded-full px-4 py-2 mt-4 bg-opacity-50 bg-white
            "
        type="text"
        value={inputData}
        placeholder="Search"
        onChange={inputDataHandler}
      />
      <div className="flex flex-col gap-y-4 mt-6 h-72 overflow-auto customScrollbar">
        {currentAttendance?.length === 0 && (
          <div className="my-auto">
            <p className="text-center text-3xl">No attendance found 🤧</p>
            <button
              className="btnFtrs bg-yellow-200 px-6 w-full mt-4 hover:bg-yellow-300"
              onClick={() => {
                send("CLOSE_VIEW_ATTENDANCE");
                send({
                  type: "ADD_ATTENDANCE",
                  currentEvent: currentEvent,
                });
              }}
            >
              Add Attendance
            </button>
          </div>
        )}
        {currentAttendance?.length !== 0 && filteredAttendance.length === 0 && (
          <div className="my-auto">
            <p className="text-center text-3xl">No one with that query 💀</p>
          </div>
        )}
        {filteredAttendance.map((a) => (
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
              <button className="bg-red-400 px-4 rounded-3xl capitalize outline-none"
              onClick={() => {
                send({type: "DELETE_ATTENDEE", currentAttendee:a.id})
              }}
              >
                delete
              </button>
              <select
                onChange={(e) => {
                  setAttendeeType(e.target.value as Attendee)
                  send({type: "EDIT_ATTENDEE", currentAttendee:a.id})
                }}
                className="bg-red-400 px-3 w-max rounded-3xl  outline-none   "
                defaultValue={a.attendee}
              >
                {Object.values(Attendee).map((o) => (
                  <option
                    value={o}
                    key={o}
                    // selected={o === a.attendee}
                    className="capitalize px-2"
                  >
                    {" "}
                    {o.toString()}
                  </option>
                ))}
              </select>
            </span>
          </span>
        ))}
      </div>
      {(
        <ModalWrapper
          isModalOpen={state.matches("DeleteAttendee")}
          loading={false}
          closeModal={() => send("DELETE_ATTENDEE.CLOSE")}
        >
          <Confirmation errorMsg={errorMsg} mainMsg={`Delete ${currentAttendee}`}
          loading={loading}
          subMsg={`This will delete attendance of this student for event ${currentEvent?.name}`}
          closeConfirm={() => send("DELETE_ATTENDEE.CLOSE")}
          submitConfirm={() => send({type: "DELETE_ATTENDEE.SUBMIT", deleteAttendeeId: currentAttendee } )}
          />
        </ModalWrapper>
      )}
      {(
        <ModalWrapper
          isModalOpen={state.matches("EditAttendee")}
          loading={false}
          closeModal={() => send("EDIT_ATTENDEE.CLOSE")}
        >
          <Confirmation errorMsg={errorMsg} mainMsg={`Make ${currentAttendee} ${attendeeType} `}
          loading={loading}
          subMsg={`This will mark the attendee as ${attendeeType} for event ${currentEvent?.name}`}
          closeConfirm={() => send("EDIT_ATTENDEE.CLOSE")}
          submitConfirm={() => send({type: "EDIT_ATTENDEE.SUBMIT", attendeeId: currentAttendee, attendeeType } )}
          />
        </ModalWrapper>
      )}
    </section>
  );
};

export default ViewAttendance;
