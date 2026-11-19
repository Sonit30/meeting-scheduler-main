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

  apiKey: "AIzaSyBD8NgmIJmBZMQZgRVYFSX8PVRKOvLPsDk",
  databaseURL: "https://meeting-d78d1-default-rtdb.firebaseio.com/",
  authDomain: "meeting-d78d1.firebaseapp.com",
  projectId: "meeting-d78d1",
  storageBucket: "meeting-d78d1.firebasestorage.app",
  messagingSenderId: "813905051066",
  appId: "1:813905051066:web:edb6f6ee55b7044d13f183",
  measurementId: "G-BQMX5SG8J7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
