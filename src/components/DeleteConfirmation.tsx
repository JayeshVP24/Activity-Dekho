import { useActor } from "@xstate/react";
import Image from "next/image";
import { useContext, useEffect } from "react";
import AvatarGenerator from "./AvatarGenerator";
import { GlobalStateContext } from "./GlobalStateProvider";

const DeleteConfirmation: React.FC<{
  loading: boolean,
  name: string,
  msg: string,
  submitConfirm: () => void,
  closeConfirm: () => void
}> = ({loading, name ,msg, submitConfirm, closeConfirm}) => {
  // const globalService = useContext(GlobalStateContext);
  // const [state, send] = useActor(globalService.clubEventService!);

  //   useEffect(() => {
  //     console.log(state.context.currentClub)
  //   },[state.context.currentClub])
  
  useEffect(() => {
    console.log("opened confirmationcajfeaofib ")
  }, [])
  
  return (
    <section>
      <div className="max-h-[40rem] overflow-y-scroll p-2 customScrollbar overflow-x-hidden ">
        <h3 className="text-4xl font-semibold mt-2">Delete {name} </h3>
        <p className="text-xl font-semibold mt-2">Are you sure? <br />{msg}</p>
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
            console.log("clickafaefboaiebgbfi")
            submitConfirm()
          }}
          >
            {loading ? "Loading..." : "Delete Club"}
          </button>
        </span>
      </div>
    </section>
  );
};

export default DeleteConfirmation;
