import { AppProps } from "next/app";
import Header from "../components/Header";
import { Raleway } from "@next/font/google";

import "../globals.css";
import { createContext, useContext, useEffect } from "react";
import { useActor, useInterpret } from "@xstate/react";
import ClubAuth from "../components/ClubAuth";
import ClubAuthMachine from "../machines/clubAuth";
import {
  getClubsListQuery,
  validateAuthQuery,
} from "../firebase/firestore/Club";
import { useRouter } from "next/router";
import GlobalStateProvider, {
  GlobalStateContext,
} from "../components/GlobalStateProvider";
import ModalWrapper from "../components/ModalWrapper";
import { auth } from "../firebase/config";
const poppins = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["300", "400", "500", "600", "700", "800"],
});

function MyApp({ Component, pageProps }: AppProps) {
  // const globalServices = useContext(GlobalStateContext);
  // const [state, send] = useActor(globalServices.clubAuthService);
  // useEffect(() => {
  //   if(auth.currentUser) {
  //     state.context.loggedIn = true
  //   }
  // },[])

  return (
    // <span>AICTE Diary</span>
    // <span className='' >Are you a club admin?</span>
    <div className={`${poppins.variable} font-sans`}>
      <GlobalStateProvider>
        
        <Header />
        <Component {...pageProps} />
      </GlobalStateProvider>
    </div>
  );
}

export default MyApp;
