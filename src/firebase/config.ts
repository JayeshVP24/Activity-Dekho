// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvyg0ymLOqs181XfDZ2VxvuAEqDcvZrOI",
  authDomain: "aicte-diary.firebaseapp.com",
  projectId: "aicte-diary",
  storageBucket: "aicte-diary.appspot.com",
  messagingSenderId: "944319415450",
  appId: "1:944319415450:web:3e453ecb0786bde4f68b23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firedb = getFirestore(app)
export const auth = getAuth(app)