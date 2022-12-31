import { AppProps } from "next/app";
import Header from "../components/Header";
import { Raleway } from '@next/font/google'

import "../globals.css";
import { createContext } from "react";
import { useInterpret } from "@xstate/react";
import ClubAuth from "../components/ClubAuth";
import ClubAuthMachine from "../machines/clubAuth";
import { getClubsListQuery, validateAuthQuery } from "../firebase/Club";
import { useRouter } from "next/router";
import GlobalStateProvider from "../components/GlobalStateProvider";
const poppins = Raleway({
  subsets: ['latin'],
  variable: "--font-raleway",
  weight: ["300", "400", "500", "600", "700", "800"]
})


function MyApp({ Component, pageProps }: AppProps) {
 
  
 
  return (
    // <span>AICTE Diary</span>
    // <span className='' >Are you a club admin?</span>
    <div className={`${poppins.variable} font-sans`} >
      <GlobalStateProvider>
        <Header />
        <Component {...pageProps} />
      </GlobalStateProvider>
    </div>
  );
}

export default MyApp;
