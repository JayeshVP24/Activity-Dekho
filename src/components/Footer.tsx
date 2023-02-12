import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

const Footer: React.FC = () => {
  const router = useRouter();

  return (
    <footer className="w-full bg-black text-white mt-20 lg:mt-36 py-5 lg:py-10 px-5 relative  z-10 lg:flex justify-center gap-x-20 items-center">
      <div>
        <span className="flex items-center gap-x-4 justify-center">
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
        </span>
        <p className="mx-auto w-max">© 2023 Activity Dekho</p>
      </div>
      <div>
      <div className="flex flex-wrap underline gap-x-6 justify-center my-4 lg:my-6 ">
        <a href="https://github.com/JayeshVP24/Activity-Dekho">Open Source</a>
        <a href="https://github.com/JayeshVP24/Activity-Dekho/blob/main/CONTRIBUTING.md">
          Contribute
        </a>
        <a href="https://github.com/JayeshVP24/Activity-Dekho/issues">
          Report Bug
        </a>
        <a href="https://github.com/JayeshVP24/Activity-Dekho/issues">
          Request Feature
        </a>
      </div>
      <div className="text-center mt-4 lg:mt-6">
        <p>Developed with 🤍 by yours truly 😊</p>
        <a
          href="https://twitter.com/jayeshvp24"
          className="font-bold underline"
        >
          Jayesh Potlabattini
        </a>
        <span className="flex flex-wrap gap-4 lg:gap-8 justify-center mt-4 lg:mt-6">
          <a href="https://twitter.com/jayeshvp24">
            <Image
              className=""
              src="/twitter.svg"
              width="50"
              height="50"
              alt="LinkedIn logo"
            />
          </a>
          <a href="https://www.linkedin.com/in/jayesh-potlabattini/">
            <Image
              className=""
              src="/linkedin.svg"
              width="50"
              height="50"
              alt="LinkedIn logo"
            />
          </a>
          <a href="https://github.com/JayeshVP24/">
            <Image
              className=""
              src="/github.svg"
              width="50"
              height="50"
              alt="LinkedIn logo"
            />
          </a>
          <a href="https://jayeshvp24.dev/">
            <Image
              className="" src="/www.svg" width="50" height="50" alt="LinkedIn logo" />
          </a>
        </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
