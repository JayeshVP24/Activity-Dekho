import { HTMLAttributes } from "react";

const AvatarGenerator: React.FC<{ name: string; className?: string; big?: boolean }> = ({
  name,
  className,
  big
}) => {
  // // console.log(name.split(" ")[0][0]);
  return (
    <span className={` bg-black text-white rounded-full  flex items-center justify-center
    ${big ? "w-24 h-24 text-2xl xl:w-32 xl:h-32 xl:text-6xl  " : "w-12 h-12 text-lg"} ` + className}>
      {name.split(" ")[0][0]}
    </span>
  );
};

export default AvatarGenerator;
