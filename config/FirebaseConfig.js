// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // authDomain: "meeting-schedular-7e82e.firebaseapp.com",
  // databaseURL: "https://meeting-schedular-7e82e-default-rtdb.firebaseio.com/",
  // projectId: "meeting-schedular-7e82e",
  // storageBucket: "meeting-schedular-7e82e.firebasestorage.app",
  // messagingSenderId: "1050346836100",
  // appId: "1:1050346836100:web:241d1cc206e560697372d1",
  // measurementId: "G-M6W4DQRPNE"

  apiKey: "AIzaSyBXaKQqrHCa0Y6Inn7YnxPdAA1oI-lHY78",
  databaseURL: "https://meeting-schedule-11497-default-rtdb.firebaseio.com/",
    authDomain: "meeting-schedule-11497.firebaseapp.com",
    projectId: "meeting-schedule-11497",
    storageBucket: "meeting-schedule-11497.firebasestorage.app",
    messagingSenderId: "21321449709",
    appId: "1:21321449709:web:2c9f42074a7d0317908ce4",
    measurementId: "G-5FX31H6LNL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
