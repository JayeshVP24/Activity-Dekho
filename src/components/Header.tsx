import Image from "next/image";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const router = useRouter();
  return (
    <header
      className=" px-5 py-3 flex justify-center rounded-3xl
         w-[95%] mx-auto mt-5  items-center"
    >
      <div className="flex items-center gap-x-4">
        <Image
          src="/logo.svg"
          height="1080"
          width="1080"
          alt="Activity Deko Logo"
          className="w-16 object-contain xl:w-20 cursor-pointer"
          onClick={() => router.push("/")}
        />
        <span
          className="text-3xl font-semibold tracking-wider xl:text-4xl cursor-pointer"
          onClick={() => router.push("/")}
        >
          Activity Dekho
        </span>
      </div>
    </header>
  );
};

export default Header;
