import { useActor } from "@xstate/react";
import Image from "next/image";
import { useContext, useEffect } from "react";
import AvatarGenerator from "./AvatarGenerator";
import { GlobalStateContext } from "./GlobalStateProvider";

const Confirmation: React.FC<{
  loading: boolean,
  subMsg: string,
  mainMsg: string,
  confirmMsg: string,
  submitConfirm: () => void,
  closeConfirm: () => void,
  errorMsg: string,
}> = ({loading,subMsg, mainMsg, confirmMsg, submitConfirm, closeConfirm, errorMsg}) => {
  // const globalService = useContext(GlobalStateContext);
  // const [state, send] = useActor(globalService.clubEventService!);

  //   useEffect(() => {
  //     // console.log(state.context.currentClub)
  //   },[state.context.currentClub])
  
  useEffect(() => {
    // console.log("opened confirmationcajfeaofib ")
  }, [])
  
  return (
    <section>
      <div className="max-h-[40rem] overflow-y-scroll p-2 customScrollbar overflow-x-hidden ">
        {errorMsg && <p className="text-red-600 text-xl font-semibold">{errorMsg}</p>}
        <h3 className="text-4xl font-semibold mt-2">{mainMsg} </h3>
        <p className="text-xl font-semibold mt-2">Are you sure? <br />{subMsg}</p>
        <span className="flex gap-8 mt-4">
          <button className="bg-green-400 ring-4 ring-green-200  hover:ring-green-300 w-full mt-4  btnFtrs "
          onClick={() => {
            closeConfirm()
          }}
          >
            Cancel
          </button>
          <button className="bg-red-400 ring-4 ring-red-200  hover:ring-red-300 w-full mt-4  btnFtrs"
          onClick={() => {
            // console.log("clickafaefboaiebgbfi")
            submitConfirm()
          }}
          >
            {loading ? "Loading..." : confirmMsg}
          </button>
        </span>
      </div>
    </section>
  );
};

export default Confirmation;
