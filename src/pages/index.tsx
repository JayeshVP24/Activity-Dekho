import { useActor, useSelector } from "@xstate/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useState, useRef, useEffect } from "react";
import ClubAuth from "../components/ClubAuth";
import { GlobalStateContext } from "../components/GlobalStateProvider";
import {
  displayAttendanceType,
  getStudentEvents,
  saveExcel,
} from "../firebase/firestore/Events";
const Index: NextPage = () => {
  // const [studentData, setStudentData] = useState<displayAttendanceType | {error: string}>()
  const [studentId, setStudentId] = useState<string>("");
  const [admissionYear, setAdmissionYear] = useState<string>("");
  const [error, setError] = useState<string | boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const YRref = useRef<HTMLInputElement>(null);
  const SRref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const getStudentData = async () => {
    // const regex = new RegExp("^\\d{2}-[A-Z]+\\d{2}-\\d{2}$", "s");
    setError(false);
    setLoading(true);
    const srNumber = Number(studentId)
    const admissionYr = Number(admissionYear)
    if (isNaN(srNumber) || isNaN(admissionYr) 
    || admissionYear.length !== 2 || studentId.length !== 4
    || srNumber < 0 || admissionYr < 0
    ) {
      setError("ERP Entered is not of correct format!");
      setLoading(false);
      return;
    }
    const studentData: {
      displayAttendance?: displayAttendanceType[];
      error?: string;
    } = await getStudentEvents("S1032" + admissionYear + studentId);
    if (studentData.error) {
      setError("You don't seem to have attended any events");
    } else {
      setError(false);
      saveExcel("S1032" + admissionYear + studentId, studentData.displayAttendance);
    }
    setLoading(false);
  };

  const globalServices = useContext(GlobalStateContext);
  // const [state, send] = useActor(globalServices.clubAuthService)
  const { send } = globalServices.clubAuthService;
  const { loggedIn } = useSelector(
    globalServices.clubAuthService,
    (state) => state.context
  );
  // const { loading } = useSelector(
  //   globalServices.clubEventService,
  //   (state) => state.context
  // );
  // const [erpId, setErpId] = useState<string>("S1032XXXXXX");
  // useEffect(() => {
  //   if(isNaN(Number(admissionYear)) || Number(admissionYear) < 0) return
  //   let erp = erpId
  //   erp[5] = admissionYear[0]
  //   erp[6] = admissionYear[1]
  //   setErpId(erp)
  // }, [admissionYear, studentId])
  // useEffect(() => {
  //   if(isNaN(Number(studentId)) || Number(studentId) < 0 ) return
  //   let erp = erpId    
  //   setErpId(erp)
  // }, [studentId, admissionYear])

  return (
    <main className="mx-10 xl:mx-20 2xl:mx-32 block lg:flex   ">
      <h1
        className="text-6xl mt-4 font-bold leading-[1.2] tracking-wide
      xl:w-2/4 xl:text-8xl xl:mr-4 xl:leading-[1.25] lg:w-2/4"
      >
        Generate Your AICTE Diary 🔖
      </h1>
      <form
        className="mt-6 block xl:mt-12 lg:w-2/4"
        onSubmit={(e) => {
          e.preventDefault();
          // // console.log(e.currentTarget["UID"].value);
          getStudentData();
        }}
      >
        <p className="text-2xl font-medium xl:text-4xl ">Enter your ERP ID 🪪</p>
        <div className="w-full grid  grid-cols-6 gap-x-6 gap-y-4 mt-4">
          <span className="flex flex-col col-span-3 xl:col-span-1 ">
            <label htmlFor="INSTITUTE_ID">Institute ID</label>
            <input
              name="INSTITUTE_ID"
              value="S1032"
              className=" border-2 bg-blue-200 border-blue-600 py-3 rounded-2xl mt-2 outline-none
            pl-3 text-slate-900 placeholder:text-slate-600 text-lg  font-semibold tracking-widest
               "
              disabled={true}
            />
          </span>
          <span className="flex flex-col col-span-4 xl:col-span-2">
            <label htmlFor="ADMISSION_YEAR">Admission Year {"20xx"} </label>
            <input
              name="ADMISSION_YEAR"
              value={admissionYear}
              ref={YRref}
              required
              onChange={(e) => {
                e.preventDefault();
                if(e.target.value.length > 2) {                  
                  if(studentId.length < 4) setStudentId(studentId + e.target.value.slice(2))
                  SRref.current.focus()
                  return                
                }
                setAdmissionYear(e.target.value);
                if(e.target.value.length === 2) SRref.current.focus()
              }}
              placeholder="XX"
              className=" border-2 bg-transparent border-blue-600 py-3 rounded-2xl mt-2 outline-none
              pl-4 text-slate-900 placeholder:text-slate-600 text-lg  font-semibold tracking-widest
              focus:bg-blue-200 transition-all "
            />
          </span>
          <span className="flex flex-col col-span-6 xl:col-span-3">
            <label htmlFor="SR_ID">Serial Number</label>

            <input
              name="SR_ID"
              ref={SRref}
              value={studentId}
              required
              onChange={(e) => {
                if(e.target.value.length === 0) YRref.current.focus()
                if(e.target.value.length <= 4) setStudentId(e.target.value);
              }}
              className=" border-2 bg-transparent border-blue-600 py-3 rounded-2xl mt-2 outline-none
              pl-4 text-slate-900 placeholder:text-slate-600 text-lg  font-semibold tracking-widest
              focus:bg-blue-200 transition-all
              "
              placeholder="XXXX"
            />
          </span>
        </div>
        {/* <span className="block bg-green-300 px-4 rounded-lg py-1 my-4" >Your ERP ID: {erpId} </span> */}
        {error && <span className="text-red-600 block mt-3" >{error}</span>}
        <span
          className="block tracking-wider bg-orange-200 rounded-2xl px-4 py-2 mt-3
        xl:mt-6 "
        >
          Format: [Institute Id][Admission Year(last two digits)][Serial Number]
        </span>
        <span
          className="block tracking-wider bg-yellow-200 rounded-xl px-4 py-2 mt-2 
        xl:mt-3 "
        >
          Example: 1032210047 - 1032 is Institute Id, 21 is Admission Year and 0047 is Serial Number
        </span>

        <button
          type="submit"
          className="bg-green-400 ring-4 ring-green-200  hover:ring-green-300 w-full mt-12 mb-8 btnFtrs
              "
          disabled={loading}
        >
          {loading ? "loading..." : "🚀 Generate 🚀"}
        </button>
        {!loggedIn && (
          <button
            className=" bg-red-400 w-full text-center py-2 rounded-2xl 
             font-medium ring-red-100 ring-4 hover:ring-red-300 transition-all
            active:scale-90"
            onClick={() => {
              send("OPEN_MODAL");
            }}
            type="button"
          >
            🥷 Are you a club admin? 🥷
          </button>
        )}
        {loggedIn && (
          <button
            type="button"
            className=" bg-blue-400 w-full text-center py-2 rounded-2xl 
             font-medium ring-blue-100 ring-4 hover:ring-blue-300 transition-all
            active:scale-90"
            onClick={() => {
              router.push("/events");
            }}
          >
            🥷 Go to club dashboard 🥷
          </button>
        )}
      </form>
      {/* {!loggedIn && <button
        className="fixed left-[50%] translate-x-[-50%] bottom-5 bg-red-400 w-4/5 text-center py-2 rounded-2xl 
            max-w-md xl:bottom-44 font-medium ring-red-100 ring-4 hover:ring-red-300 transition-all
            active:scale-90"
        onClick={() => {
          send("OPEN_MODAL");
        }}
      >
        🥷 Are you a club admin? 🥷
      </button>}
      {loggedIn && <button
        className="fixed left-[50%] translate-x-[-50%] bottom-5 bg-blue-400 w-4/5 text-center py-2 rounded-2xl 
            max-w-md xl:bottom-44 font-medium ring-blue-100 ring-4 hover:ring-blue-300 transition-all
            active:scale-90"
        onClick={() => {
          router.push("/events")
        }}
      >
        🥷 Go to club dashboard 🥷
      </button>} */}
    </main>
  );

  // return (
  //   <ClientOnly>
  //     <div>
  //       <div>
  //         <pre className="mb-8">
  //           {JSON.stringify(
  //             {
  //               value: state.value,
  //               context: state.context,
  //             },
  //             null,
  //             2
  //           )}
  //         </pre>
  //         <div className="flex gap-x-5">
  //           {state.nextEvents.map((event) => (
  //             <button key={event} onClick={() => send(event)}>{event}</button>
  //           ))}
  //         </div>
  //         <div className="flex gap-x-5 ">
  //           {state.matches("displayingClubsList") &&
  //             state.context.clubList.map((c) => (
  //               <span key={c.name} className="cursor-pointer" onClick={() =>
  //               send({ type: "SELECT_CLUB", club: c })}>
  //                 {c.name}
  //               </span>
  //             ))}
  //         </div>
  //         {state.matches("promtEnterPassword") && (
  //           <form onSubmit={(f) => {
  //             f.preventDefault()
  //             send({type: "VALIDATE_AUTH",password: f.currentTarget["PASSWORD"].value })
  //             }} >
  //           <input
  //             type="password"
  //             name="PASSWORD"
  //             placeholder="enter your password"
  //           />
  //           <button type="submit">Submit</button>
  //           </form>
  //         )}
  //       </div>
  //       {/* <div className="mt-10">
  //       <pre className="mb-8">
  //         {JSON.stringify(
  //           {
  //             value: state2.value,
  //             context: state2.context,
  //           },
  //           null,
  //           2
  //         )}
  //       </pre>
  //       <div className="flex gap-x-5" >
  //         {state2.nextEvents.map((event) => (
  //           <button onClick={() => send2(event)}>{event}</button>
  //         ))}
  //       </div>
  //     </div> */}
  //     </div>
  //   </ClientOnly>
  // );
};

export default Index;
