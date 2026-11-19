
"use client";

import React, { useEffect, useState } from "react";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import { ref, get } from "firebase/database";

import { database } from "@/config/FirebaseConfig";

import { useRouter } from "next/navigation";

import { LoaderIcon } from "lucide-react";

import MeetingType from "./meeting-type/page";


function Dashboard() {

  const {
    user,
    isLoading: userLoading
  } = useKindeBrowserClient();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const router = useRouter();


  useEffect(() => {

    if (userLoading) return;

    let cancelled = false;


    const checkBusinessRegistration = async () => {

      if (!user?.email) {

        router.replace("/");

        return;
      }


      try {

        setLoading(true);

        setError("");


        // Same business ID used in CreateBusiness.jsx
        const businessId = user.id || user.email;


        // Realtime Database reference
        const businessRef = ref(
          database,
          `Business/${businessId}`
        );


        // Check business existence
        const snapshot = await get(businessRef);


        if (cancelled) return;


        if (snapshot.exists()) {

          // Business exists
          setLoading(false);

        } else {

          // Business does not exist
          router.replace("/create-business");

        }


      } catch (error) {

        console.error(
          "Realtime Database error:",
          error
        );

        if (!cancelled) {

          setError(
            "Unable to verify your business. Please check your connection and try again."
          );

          setLoading(false);

        }

      }

    };


    checkBusinessRegistration();


    return () => {
      cancelled = true;
    };


  }, [user, userLoading, router]);


  // Loading screen
  if (loading || userLoading) {

    return (

      <div className="flex items-center justify-center min-h-screen">

        <div className="flex flex-col items-center gap-3">

          <LoaderIcon className="animate-spin h-8 w-8 text-primary" />

          <p className="text-gray-500">
            Loading Dashboard...
          </p>

        </div>

      </div>

    );

  }


  // Error screen
  if (error) {

    return (

      <div className="flex flex-col items-center justify-center min-h-screen gap-4">

        <p className="text-red-500 text-center">
          {error}
        </p>

        <button

          className="px-4 py-2 bg-primary text-white rounded-md"

          onClick={() => window.location.reload()}

        >
          Retry

        </button>

      </div>

    );

  }


  return (

    <div>

      <MeetingType />

    </div>

  );

}


export default Dashboard;
