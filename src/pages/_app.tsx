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
import Footer from "../components/Footer";
import { auth } from "../firebase/config";
import { DefaultSeo } from "next-seo";
import Head from "next/head";
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
      <DefaultSeo
        title="Activity Dekho"
        description="TCET-AICTE Diary Automated, Online, and Secure Activity Attendance Management System for TCET-AICTE Clubs"
        openGraph={{
          type: "website",
          locale: "en_EN",
          url: "https://activitydekho.com/",
          siteName: "Activity Dekho",
          title: "Activity Dekho",
          description:
            "TCET-AICTE Diary Automated, Online, and Secure Activity Attendance Management System for TCET-AICTE Clubs",
        }}
        twitter={{
          handle: "@JayeshVP24",
          cardType: "summary_large_image",
        }}
      />
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#9f00a7" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <GlobalStateProvider>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </GlobalStateProvider>
    </div>
  );
}

export default MyApp;
