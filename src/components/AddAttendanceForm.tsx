import { useActor } from "@xstate/react";
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
const AddAttendanceForm: React.FC = () => {
  const globalServices = useContext(GlobalStateContext);
  const [state, send] = useActor(globalServices.clubEventService);
  const [excelFileName, setExcelFileName] = useState<string>("");
  const [excelStringArray, setExcelStringArray] = useState<string[]>([""]);
  //   const [fileName, setFileName] = useS
  const parseUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files[0]);
    const file = e.target.files[0];
    setExcelFileName(file.name);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );
    console.log(jsonData);
    const arr: string[] = [];
    Object.values(jsonData).forEach((e) => {
      console.log(e["UIDS"]);
      arr.push(e["UIDS"].trim());
    });
    setExcelStringArray(arr);
    console.log(excelStringArray);
    send({
      type: "ADD_ATTENDANCE.UPLOAD_EXCEL",
      excelFileName: file.name,
      excelStringArray: arr,
    });
  };
  useEffect(() => {
    console.log({"currentEvent": state.context.currentEvent})
  }, [])
  return (
    <section>
      <div className="">
        <h2 className="text-2xl font-medium ">Add Attendance</h2>
        <h3 className="text-4xl font-semibold mt-2">
          {state.context.currentEvent?.name}
        </h3>
      </div>
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          send({type: "ADD_ATTENDANCE.SUBMIT"});
        }}
      >
        <input
          type="file"
          name="FILE"
          onChange={parseUpload}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
        <span className="bg-yellow-300 text-sm block px-4 py-1 rounded-3xl my-4">
          Note: Excel should only consist of UIDs and the first ROW should be
          named UIDS <br />
          Check the sample below
        </span>
        <Image
          src="/excelSample.png"
          width="248"
          height="282"
          alt="Example Excel Sample for attendance"
          className="w-48 mx-auto"
        />
        {state.context.errorMsg && (
          <span
            className="bg-red-400 px-4 py-1 rounded-3xl
          block my-6"
          >
            {state.context.errorMsg}
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
