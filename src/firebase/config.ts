// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// console.log("prod env ", process.env.NODE_ENV);
let firebaseConfig = {};
// if (process.env.NODE_ENV === "production") {
//   // console.log("here is the node env")
//   firebaseConfig = {
//     apiKey: process.env.FIREBASE_API_KEY,
//     authDomain: "aicte-diary.firebaseapp.com",
//     projectId: "aicte-diary",
//     storageBucket: "aicte-diary.appspot.com",
//     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.FIREBASE_APP_ID,
//   };
// } 
// if (process.env.NODE_ENV === "production") {
//   // console.log("here is the node env")
//   firebaseConfig = {
//     apiKey: "AIzaSyAXaqKx8APu7fsUZUA1A1T7UvsP-8UKwt4",
//     authDomain: "aicte-diary.firebaseapp.com",
//     projectId: "aicte-diary",
//     storageBucket: "aicte-diary.appspot.com",
//     messagingSenderId: "944319415450",
//     appId: "1:944319415450:web:7598324a715c03c1f68b23",
//   };
// } 
// else {
//   firebaseConfig = {
//     apiKey: "AIzaSyAXaqKx8APu7fsUZUA1A1T7UvsP-8UKwt4",
//     authDomain: "aicte-diary.firebaseapp.com",
//     projectId: "aicte-diary",
//     storageBucket: "aicte-diary.appspot.com",
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   };
// }

  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firedb = getFirestore(app);
export const auth = getAuth(app);
