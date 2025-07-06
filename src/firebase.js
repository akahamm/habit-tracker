/** @format */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaXsyiN_5FNuxvKe9PM4_8TjyujEynKlU",
  authDomain: "time-tracker-222e5.firebaseapp.com",
  projectId: "time-tracker-222e5",
  storageBucket: "time-tracker-222e5.firebasestorage.app",
  messagingSenderId: "634463892917",
  appId: "1:634463892917:web:5a7d56e6ab1b7c7a9595fc",
  measurementId: "G-DCPPHS8MRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
const analytics = getAnalytics(app);
