
"use client";

import React, { useEffect, useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

import ScheduledMeetingList from "./_components/ScheduledMeetingList";

import {
  ref,
  get
} from "firebase/database";

import { database } from "@/config/FirebaseConfig";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import { format } from "date-fns";


function ScheduledMeeting() {

  const { user, isLoading } = useKindeBrowserClient();

  const [meetingList, setMeetingList] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /**
   * Fetch Scheduled Meetings
   */
  useEffect(() => {

    if (isLoading) return;

    if (!user?.email) {

      setLoading(false);

      return;
    }

    let cancelled = false;


    const getScheduledMeetings = async () => {

      try {

        setLoading(true);

        setError("");

        const meetingsRef = ref(
          database,
          "ScheduledMeetings"
        );

        const snapshot = await get(meetingsRef);


        if (!snapshot.exists()) {

          if (!cancelled) {
            setMeetingList([]);
          }

          return;
        }


        const meetingsData = snapshot.val();


        // Filter meetings belonging to current business
        const meetings = Object.entries(meetingsData)

          .map(([id, data]) => ({
            ...data,
            id: data.id || id
          }))

          .filter(
            item => item.businessEmail === user.email
          )

          .sort((a, b) => {

            const dateA = new Date(
              `${a.selectedDate} ${a.selectedTime}`
            ).getTime();

            const dateB = new Date(
              `${b.selectedDate} ${b.selectedTime}`
            ).getTime();

            return dateA - dateB;

          });


        if (!cancelled) {

          setMeetingList(meetings);

        }


      } catch (error) {

        console.error(
          "Error fetching scheduled meetings:",
          error
        );

        if (!cancelled) {

          setError(
            "Unable to load scheduled meetings. Please try again."
          );

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    };


    getScheduledMeetings();


    return () => {

      cancelled = true;

    };

  }, [user?.email, isLoading]);


  /**
   * Convert meeting date and time to timestamp
   */
  const getMeetingTimestamp = (meeting) => {

    if (!meeting.selectedDate || !meeting.selectedTime) {
      return NaN;
    }

    const date = String(meeting.selectedDate);

    // Supports YYYY-MM-DD and ISO date strings
    const datePart = date.includes("T")
      ? date.split("T")[0]
      : date;

    const time = String(meeting.selectedTime);

    const match = time.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

    if (!match) {

      const parsed = new Date(
        `${datePart}T${time}`
      );

      return parsed.getTime();

    }

    let hours = Number(match[1]);

    const minutes = Number(match[2]);

    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    const [year, month, day] = datePart
      .split("-")
      .map(Number);

    return new Date(
      year,
      month - 1,
      day,
      hours,
      minutes
    ).getTime();

  };


  /**
   * Filter Upcoming / Expired Meetings
   */
  const filterMeetingList = (type) => {

    const now = Date.now();

    if (type === "upcoming") {

      return meetingList.filter(item => {

        const meetingTime = getMeetingTimestamp(item);

        return Number.isFinite(meetingTime) &&
          meetingTime >= now;

      });

    }

    return meetingList.filter(item => {

      const meetingTime = getMeetingTimestamp(item);

      return Number.isFinite(meetingTime) &&
        meetingTime < now;

    });

  };


  // Loading
  if (loading || isLoading) {

    return (

      <div className="p-10 text-center">

        Loading scheduled meetings...

      </div>

    );

  }


  // Not logged in
  if (!user?.email) {

    return (

      <div className="p-10 text-center">

        Please login to view scheduled meetings.

      </div>

    );

  }


  // Error
  if (error) {

    return (

      <div className="p-10 text-center">

        <p className="text-red-500">
          {error}
        </p>

        <button

          className="mt-4 px-4 py-2 bg-primary text-white rounded"

          onClick={() => window.location.reload()}

        >

          Retry

        </button>

      </div>

    );

  }


  return (

    <div className="p-10">

      <h2 className="font-bold text-2xl">

        Scheduled Meetings

      </h2>


      <hr className="my-5" />


      <Tabs defaultValue="upcoming" className="w-full">

        <TabsList>

          <TabsTrigger value="upcoming">

            Upcoming ({filterMeetingList("upcoming").length})

          </TabsTrigger>


          <TabsTrigger value="expired">

            Expired ({filterMeetingList("expired").length})

          </TabsTrigger>

        </TabsList>


        <TabsContent value="upcoming">

          <ScheduledMeetingList

            meetingList={filterMeetingList("upcoming")}

          />

        </TabsContent>


        <TabsContent value="expired">

          <ScheduledMeetingList

            meetingList={filterMeetingList("expired")}

          />

        </TabsContent>


      </Tabs>

    </div>

  );

}


export default ScheduledMeeting;
