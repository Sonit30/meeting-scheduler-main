
"use client";

import React, { useEffect, useState } from "react";

import MeetingTimeDateSelection from "../_components/MeetingTimeDateSelection";

import {
  ref,
  get,
  query,
  orderByChild,
  equalTo
} from "firebase/database";

import { database } from "@/config/FirebaseConfig";

import { useParams } from "next/navigation";

import { LoaderIcon } from "lucide-react";


function SharedMeetingEvent() {

  const params = useParams();

  const [businessInfo, setBusinessInfo] = useState(null);

  const [eventInfo, setEventInfo] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    if (!params?.business || !params?.meetingEventId) {
      return;
    }

    let cancelled = false;

    const getMeetingBusinessAndEventDetails = async () => {

      try {

        setLoading(true);

        setError("");

        // Fetch Business Information
        const businessQuery = query(
          ref(database, "Business"),
          orderByChild("businessName"),
          equalTo(params.business)
        );

        const businessSnapshot = await get(businessQuery);

        if (!businessSnapshot.exists()) {

          throw new Error("Business not found");

        }

        const businessData = businessSnapshot.val();

        const business = Object.values(businessData)[0];


        // Fetch Meeting Event
        const eventRef = ref(
          database,
          `MeetingEvent/${params.meetingEventId}`
        );

        const eventSnapshot = await get(eventRef);

        if (!eventSnapshot.exists()) {

          throw new Error("Meeting event not found");

        }

        const event = eventSnapshot.val();


        // Ensure component is still mounted
        if (cancelled) return;


        setBusinessInfo(business);

        setEventInfo(event);


      } catch (err) {

        console.error(
          "Meeting details fetching error:",
          err
        );

        if (!cancelled) {

          setError(
            err.message || "Unable to load meeting details"
          );

        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    };


    getMeetingBusinessAndEventDetails();


    return () => {
      cancelled = true;
    };

  }, [params?.business, params?.meetingEventId]);


  // Loading
  if (loading) {

    return (

      <div className="flex items-center justify-center min-h-screen">

        <div className="flex flex-col items-center gap-3">

          <LoaderIcon className="animate-spin h-8 w-8 text-primary" />

          <p className="text-gray-500">
            Loading meeting details...
          </p>

        </div>

      </div>

    );

  }


  // Error
  if (error || !businessInfo || !eventInfo) {

    return (

      <div className="flex flex-col items-center justify-center min-h-screen gap-3">

        <h2 className="text-xl font-bold">
          Meeting Not Found
        </h2>

        <p className="text-gray-500 text-center">
          {error || "This meeting link may be invalid or expired."}
        </p>

      </div>

    );

  }


  // Meeting Details
  return (

    <div>

      <MeetingTimeDateSelection

        eventInfo={eventInfo}

        businessInfo={businessInfo}

      />

    </div>

  );

}


export default SharedMeetingEvent;
