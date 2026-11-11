"use client";

import React, { useEffect, useState } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "@/config/FirebaseConfig";
import { useRouter } from "next/navigation";
import MeetingType from "./meeting-type/page";

function Dashboard() {
  const db = getFirestore(app);
  const { user, isLoading: userLoading } = useKindeBrowserClient();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only run after user loading is done
    if (!userLoading) {
      if (user?.email) {
        checkBusinessRegistration();
      } else {
        setLoading(false);
      }
    }
  }, [user, userLoading]);

  const checkBusinessRegistration = async () => {
    try {
      const docRef = doc(db, "Business", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Business exists
        setLoading(false);
      } else {
        // Business not found, redirect
        router.replace("/create-business");
      }
    } catch (error) {
      console.error("Firestore error:", error);
      // Show a user-friendly message if desired
      setLoading(false);
    }
  };

  if (loading || userLoading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <MeetingType />
    </div>
  );
}

export default Dashboard;
