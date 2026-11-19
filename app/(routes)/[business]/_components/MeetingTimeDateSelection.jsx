
"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  CalendarCheck,
  Clock,
  LoaderIcon,
  MapPin,
  Timer
} from "lucide-react";

import { format } from "date-fns";

import TimeDateSelection from "./TimeDateSelection";
import UserFormInfo from "./UserFormInfo";

import {
  ref,
  get,
  set,
  query,
  orderByChild,
  equalTo
} from "firebase/database";

import { database } from "@/config/FirebaseConfig";

import { toast } from "sonner";
import { useRouter } from "next/navigation";


function MeetingTimeDateSelection({ eventInfo, businessInfo }) {

  const [date, setDate] = useState(new Date());

  const [timeSlots, setTimeSlots] = useState([]);

  const [enableTimeSlot, setEnabledTimeSlot] = useState(false);

  const [selectedTime, setSelectedTime] = useState("");

  const [userName, setUserName] = useState("");

  const [userEmail, setUserEmail] = useState("");

  const [userNote, setUserNote] = useState("");

  const [prevBooking, setPrevBooking] = useState([]);

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const router = useRouter();


  // Generate meeting time slots
  useEffect(() => {

    if (eventInfo?.duration) {
      createTimeSlot(eventInfo.duration);
    }

  }, [eventInfo?.duration]);


  const createTimeSlot = (interval) => {

    if (!interval || interval <= 0) return;

    const startTime = 8 * 60;

    const endTime = 22 * 60;

    const totalSlots = Math.floor(
      (endTime - startTime) / interval
    );

    const slots = Array.from(
      { length: totalSlots },
      (_, i) => {

        const totalMinutes = startTime + i * interval;

        const hours = Math.floor(totalMinutes / 60);

        const minutes = totalMinutes % 60;

        const formattedHours =
          hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

        const period = hours >= 12 ? "PM" : "AM";

        return `${String(formattedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;

      }
    );

    setTimeSlots(slots);

  };


  // Fetch previous bookings for selected date
  const getPrevEventBooking = async (selectedDate) => {

    try {

      setPrevBooking([]);

      const dateKey = format(selectedDate, "yyyy-MM-dd");

      const bookingsQuery = query(
        ref(database, "ScheduledMeetings"),
        orderByChild("eventId"),
        equalTo(eventInfo.id)
      );

      const snapshot = await get(bookingsQuery);

      if (!snapshot.exists()) {

        setPrevBooking([]);

        return;
      }

      const bookingsData = snapshot.val();

      const bookings = Object.values(bookingsData).filter(
        booking => booking.selectedDate === dateKey
      );

      setPrevBooking(bookings);

    } catch (error) {

      console.error("Previous booking error:", error);

      toast.error("Unable to load existing bookings.");

    }

  };


  // Handle date change
  const handleDateChange = async (newDate) => {

    if (!newDate) return;

    setDate(newDate);

    setSelectedTime("");

    setPrevBooking([]);

    const day = format(newDate, "EEEE");

    if (businessInfo?.daysAvailable?.[day]) {

      setEnabledTimeSlot(true);

      await getPrevEventBooking(newDate);

    } else {

      setEnabledTimeSlot(false);

    }

  };


  // Schedule meeting
  const handleScheduleEvent = async () => {

    if (loading) return;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!userName.trim()) {

      toast.error("Enter your name");

      return;
    }

    if (!regex.test(userEmail.trim())) {

      toast.error("Enter a valid email address");

      return;
    }

    if (!selectedTime) {

      toast.error("Please select a meeting time");

      return;
    }

    if (!eventInfo?.id || !eventInfo?.duration) {

      toast.error("Meeting information is missing");

      return;
    }

    if (!businessInfo?.email) {

      toast.error("Business email is missing");

      return;
    }

    setLoading(true);

    const docId = Date.now().toString();

    const dateKey = format(date, "yyyy-MM-dd");

    const bookingData = {

      id: docId,

      businessName: businessInfo.businessName,

      businessEmail: businessInfo.email,

      selectedTime: selectedTime,

      // Store date as a consistent string
      selectedDate: dateKey,

      formattedDate: format(date, "PPP"),

      formattedTimeStamp: format(date, "t"),

      duration: eventInfo.duration,

      locationUrl: eventInfo.locationUrl,

      locationType: eventInfo.locationType || "",

      eventId: eventInfo.id,

      userName: userName.trim(),

      userEmail: userEmail.trim(),

      userNote: userNote.trim(),

      createdAt: new Date().toISOString()

    };


    try {

      // Save booking in Realtime Database
      await set(
        ref(database, `ScheduledMeetings/${docId}`),
        bookingData
      );


      toast.success("Meeting scheduled successfully!");


      // Send confirmation email through server API
      try {

        const response = await fetch("/api/schedule-email", {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            businessName: businessInfo.businessName,

            businessEmail: businessInfo.email,

            date: format(date, "PPP"),

            duration: eventInfo.duration,

            meetingTime: selectedTime,

            meetingUrl: eventInfo.locationUrl,

            userName: userName.trim(),

            userEmail: userEmail.trim(),

            userNote: userNote.trim(),

            eventId: eventInfo.id,

            bookingId: docId

          })

        });


        const result = await response.json();

        if (!response.ok || !result.success) {

          console.error("Email error:", result);

          toast.error(
            "Meeting scheduled, but confirmation email failed."
          );

        } else {

          toast.success("Confirmation email sent!");

        }

      } catch (emailError) {

        console.error("Email sending error:", emailError);

        toast.error(
          "Meeting scheduled, but email could not be sent."
        );

      }


      router.replace("/confirmation");


    } catch (error) {

      console.error("Meeting scheduling error:", error);

      toast.error("Failed to schedule meeting. Please try again.");

    } finally {

      setLoading(false);

    }

  };


  return (

    <div

      className="p-5 py-10 shadow-lg m-5 border-t-8 mx-10 md:mx-26 lg:mx-56 my-10"

      style={{
        borderTopColor: eventInfo?.themeColor
      }}

    >

      <Image

        src="/logo.svg"

        alt="logo"

        width={150}

        height={150}

      />


      <div className="grid grid-cols-1 md:grid-cols-3 mt-5">


        {/* Meeting Information */}
        <div className="p-4 border-r">

          <h2>
            {businessInfo?.businessName}
          </h2>

          <h2 className="font-bold text-3xl">

            {eventInfo?.eventName || "Meeting Name"}

          </h2>


          <div className="mt-5 flex flex-col gap-4">

            <h2 className="flex gap-2">

              <Clock />

              {eventInfo?.duration} Min

            </h2>


            <h2 className="flex gap-2">

              <MapPin />

              {eventInfo?.locationType} Meeting

            </h2>


            <h2 className="flex gap-2">

              <CalendarCheck />

              {format(date, "PPP")}

            </h2>


            {selectedTime && (

              <h2 className="flex gap-2">

                <Timer />

                {selectedTime}

              </h2>

            )}


            {eventInfo?.locationUrl && (

              <Link

                href={eventInfo.locationUrl}

                target="_blank"

                rel="noopener noreferrer"

                className="text-primary break-all"

              >

                {eventInfo.locationUrl}

              </Link>

            )}

          </div>

        </div>


        {/* Date and Time Selection */}
        {step === 1 ? (

          <TimeDateSelection

            date={date}

            enableTimeSlot={enableTimeSlot}

            handleDateChange={handleDateChange}

            setSelectedTime={setSelectedTime}

            timeSlots={timeSlots}

            selectedTime={selectedTime}

            prevBooking={prevBooking}

          />

        ) : (

          <UserFormInfo

            setUserName={setUserName}

            setUserEmail={setUserEmail}

            setUserNote={setUserNote}

          />

        )}


      </div>


      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-end">


        {step === 2 && (

          <Button

            variant="outline"

            onClick={() => setStep(1)}

            disabled={loading}

          >

            Back

          </Button>

        )}


        {step === 1 ? (

          <Button

            className="mt-10 float-right"

            disabled={!selectedTime || !date || !enableTimeSlot}

            onClick={() => setStep(2)}

          >

            Next

          </Button>

        ) : (

          <Button

            disabled={
              loading ||
              !userEmail.trim() ||
              !userName.trim()
            }

            onClick={handleScheduleEvent}

          >

            {loading ? (

              <LoaderIcon className="animate-spin" />

            ) : (

              "Schedule"

            )}

          </Button>

        )}

      </div>

    </div>

  );

}

export default MeetingTimeDateSelection;
