import { useActor, useSelector } from "@xstate/react";
import {
  ChangeEvent,
  FormEvent,
  HTMLInputTypeAttribute,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { GlobalStateContext } from "./GlobalStateProvider";
import XLSX from "xlsx";
import Image from "next/image";
import { Attendee } from "../utils/enums";
const AddAttendanceForm: React.FC = () => {
  const globalServices = useContext(GlobalStateContext);
  const [state, send] = useActor(globalServices.clubEventService);
  const {currentEvent, errorMsg} = useSelector(
    globalServices.clubEventService,
    (state) => state.context
  );
  const parseUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.files[0]);
    // console.log("file parsing onw");
    const file = e.target.files[0];
    // setExcelFileName(file.name);
    const data = await file?.arrayBuffer();
    if (!data) return;
    const workbook = XLSX.read(data);
    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );
    // console.log(jsonData);
    const participants: string[] = [];
    const organizers: string[] = [];
    const volunteers: string[] = [];
    Object.values(jsonData).forEach((e) => {
      // // console.log(e);
      // console.log(e["STUDENTS"]);
      e[Attendee.participant + "S"] &&
        participants.push(e[Attendee.participant + "S"].trim());
      e[Attendee.organizer + "S"] &&
        participants.push(e[Attendee.organizer + "S"].trim());
      e[Attendee.organizer + "S"] &&
        organizers.push(e[Attendee.organizer + "S"].trim());
      e[Attendee.volunteer + "S"] &&
        participants.push(e[Attendee.volunteer + "S"].trim());
      e[Attendee.volunteer + "S"] &&
        volunteers.push(e[Attendee.volunteer + "S"].trim());
    });
    // setExcelStringArray(students);
    // console.log({ coordinatorsArr: organizers });
    // console.log({ participants, organizers, volunteers });
    send({
      type: "ADD_ATTENDANCE.UPLOAD_EXCEL",
      excelFileName: file.name,
      excelStringArray: {
        participants: Array.from(new Set(participants)),
        organizers,
        volunteers,
      },
    });
  };
  useEffect(() => {
    // console.log({ currentEvent });
  }, []);
  return (
    <section className="max-h-[38rem] overflow-x-hidden overflow-y-scroll p-2 customScrollbar">
      <div className="">
        <h2 className="text-2xl font-medium ">Add Attendance</h2>
        <h3 className="text-4xl font-semibold mt-2">
          {currentEvent?.name}

        </h3>
      </div>
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          send({ type: "ADD_ATTENDANCE.SUBMIT" });
        }}
      >
        <input
          type="file"
          name="FILE"
          onChange={parseUpload}
          onClick={(e) => (e.currentTarget.value = "")}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
        <span className="bg-yellow-300 text-sm block px-4 py-1 rounded-3xl my-4">
          Note: Please refere the sample below
          <br />
          Please keep ROW 1 as Column Titles with exact same titles as shown in
          sample below
        </span>
        <Image
          src="/excelSample.png"
          width="600"
          height="300"
          priority
          loading="eager"
          alt="Example Excel Sample for attendance"
          className="w-full lg:w-[80%] mx-auto"
        />
        {errorMsg && (
          <span
            className="bg-red-400 px-4 py-1 rounded-3xl
          block my-6"
          >
            {errorMsg}
          </span>
        )}
        {state.matches("addAttendance.displayingValidExcel") && (
          <>
            <span
              className="bg-green-300 px-4 py-1 rounded-full text-sm
            block mt-4"
            >
              Your Excel is Valid, go ahead and submit it
            </span>
            <button
              type="submit"
              className="btnFtrs bg-cyan-300 
            hover:ring-4 ring-cyan-200 ring-opacity-60 w-full
            mt-8"
            >
              Submit
            </button>
          </>
        )}
      </form>
    </section>
  );
};
export default AddAttendanceForm;
