import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBD8NgmIJmBZMQZgRVYFSX8PVRKOvLPsDk",
  authDomain: "meeting-d78d1.firebaseapp.com",
  databaseURL: "https://meeting-d78d1-default-rtdb.firebaseio.com",
  projectId: "meeting-d78d1",
  storageBucket: "meeting-d78d1.firebasestorage.app",
  messagingSenderId: "813905051066",
  appId: "1:813905051066:web:edb6f6ee55b7044d13f183",
  measurementId: "G-BQMX5SG8J7"
};

export const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const database = getDatabase(app);
