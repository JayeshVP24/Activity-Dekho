// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

console.log("prod env ", process.env.NODE_ENV);
let firebaseConfig = {};
if (process.env.NODE_ENV === "production") {
  console.log("here is the node env")
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "aicte-diary.firebaseapp.com",
    projectId: "aicte-diary",
    storageBucket: "aicte-diary.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
} else {
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "aicte-diary.firebaseapp.com",
    projectId: "aicte-diary",
    storageBucket: "aicte-diary.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firedb = getFirestore(app);
export const auth = getAuth(app);
