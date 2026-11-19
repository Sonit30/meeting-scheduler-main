
"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ChevronLeft,
  Plus,
  X,
  CalendarIcon
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import LocationOption from "@/app/_utils/LocationOption";
import ThemeOptions from "@/app/_utils/ThemeOptions";

import { ref, set } from "firebase/database";
import { database } from "@/config/FirebaseConfig";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

import Image from "next/image";
import Link from "next/link";


function MeetingForm({ setFormValue }) {

  const [themeColor, setThemeColor] = useState("");
  const [eventName, setEventName] = useState("");
  const [duration, setDuration] = useState(30);

  const [locationType, setLocationType] = useState("");
  const [locationUrl, setLocationUrl] = useState("");

  const [inviteeEmails, setInviteeEmails] = useState([""]);

  const [meetingDate, setMeetingDate] = useState(null);
  const [meetingTime, setMeetingTime] = useState("");

  const [showCalendar, setShowCalendar] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useKindeBrowserClient();

  const router = useRouter();


  // Generate time slots
  const timeSlots = [];

  for (let h = 8; h <= 21; h++) {
    for (let m = 0; m < 60; m += 30) {

      const hour12 = h > 12 ? h - 12 : h;
      const period = h >= 12 ? "PM" : "AM";

      timeSlots.push(
        `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`
      );
    }
  }


  // Update preview form data
  useEffect(() => {

    setFormValue({
      eventName,
      duration,
      locationType,
      locationUrl,
      themeColor,

      inviteeEmails: inviteeEmails.filter(
        email => email.trim() !== ""
      ),

      meetingDate,
      meetingTime
    });

  }, [
    eventName,
    duration,
    locationType,
    locationUrl,
    themeColor,
    inviteeEmails,
    meetingDate,
    meetingTime,
    setFormValue
  ]);


  // Email handlers
  const handleEmailChange = (index, value) => {

    const updated = [...inviteeEmails];

    updated[index] = value;

    setInviteeEmails(updated);
  };


  const addEmailField = () => {

    setInviteeEmails([...inviteeEmails, ""]);
  };


  const removeEmailField = (index) => {

    if (inviteeEmails.length === 1) return;

    setInviteeEmails(
      inviteeEmails.filter((_, i) => i !== index)
    );
  };


  // Validate emails
  const validateEmails = () => {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validEmails = inviteeEmails
      .map(email => email.trim())
      .filter(Boolean);

    for (const email of validEmails) {

      if (!regex.test(email)) {

        toast.error(`Invalid email: ${email}`);

        return false;
      }
    }

    return true;
  };


  // Create meeting
  const onCreateClick = async () => {

    if (isCreating) return;

    if (!eventName.trim()) {
      toast.error("Please enter meeting name");
      return;
    }

    if (!locationType || !locationUrl.trim()) {
      toast.error("Please select meeting location and add URL");
      return;
    }

    if (!user?.email) {
      toast.error("Please login before creating a meeting");
      return;
    }

    if (!validateEmails()) return;


    setIsCreating(true);

    const id = Date.now().toString();

    const validEmails = inviteeEmails
      .map(email => email.trim())
      .filter(Boolean);


    // Realtime Database data
    const eventData = {

      id,

      eventName: eventName.trim(),

      duration,

      locationType,

      locationUrl: locationUrl.trim(),

      themeColor: themeColor || "#2563eb",

      // Store Kinde user ID as a string
      businessId: user.id || user.email,

      createdBy: user.email,

      inviteeEmails: validEmails,

      meetingDate: meetingDate
        ? meetingDate.toISOString()
        : null,

      meetingTime: meetingTime || null,

      createdAt: new Date().toISOString()
    };


    try {

      // Save meeting in Firebase Realtime Database
      await set(
        ref(database, `MeetingEvent/${id}`),
        eventData
      );


      toast.success("New Meeting Event Created!");


      // Send confirmation emails
      if (
        validEmails.length > 0 &&
        meetingDate &&
        meetingTime
      ) {

        try {

          const response = await fetch("/api/send-email", {

            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({

              emails: validEmails,

              eventName: eventName.trim(),

              duration,

              locationUrl: locationUrl.trim(),

              locationType,

              meetingDate: format(meetingDate, "PPP"),

              meetingDateISO: meetingDate.toISOString(),

              meetingTime,

              organizerEmail: user.email,

              organizerName:
                user.given_name || user.email,

              type: "confirmation",

              eventId: id

            })

          });


          const result = await response.json();

          if (response.ok && result.success) {

            toast.success(
              "Invitation emails sent to all participants!"
            );

          } else {

            toast.error(
              "Meeting created, but emails failed to send."
            );

            console.error("Email API error:", result);
          }

        } catch (emailError) {

          console.error("Email sending error:", emailError);

          toast.error(
            "Meeting created, but emails could not be sent."
          );
        }
      }


      // Redirect
      router.replace("/dashboard/meeting-type");


    } catch (error) {

      console.error("Meeting creation error:", error);

      toast.error(
        "Failed to create meeting. Please try again."
      );

    } finally {

      setIsCreating(false);
    }
  };


  return (

    <div
      className="p-8 overflow-y-auto"
      style={{ maxHeight: "100vh" }}
    >

      {/* Cancel */}
      <Link href="/dashboard">

        <h2 className="flex gap-2">

          <ChevronLeft />

          Cancel

        </h2>

      </Link>


      <div className="mt-4">

        <h2 className="font-bold text-2xl my-4">
          Create New Event
        </h2>

        <hr />

      </div>


      <div className="flex flex-col gap-3 my-4">


        {/* Event Name */}
        <h2 className="font-bold">
          Event Name *
        </h2>

        <Input

          placeholder="Name of your meeting event"

          value={eventName}

          onChange={(event) =>
            setEventName(event.target.value)
          }

        />


        {/* Duration */}
        <h2 className="font-bold">
          Duration *
        </h2>

        <DropdownMenu>

          <DropdownMenuTrigger asChild>

            <Button
              variant="outline"
              className="max-w-40"
            >
              {duration} Min
            </Button>

          </DropdownMenuTrigger>


          <DropdownMenuContent>

            {[15, 30, 45, 60].map((time) => (

              <DropdownMenuItem

                key={time}

                onClick={() => setDuration(time)}

              >
                {time} Min

              </DropdownMenuItem>

            ))}

          </DropdownMenuContent>

        </DropdownMenu>


        {/* Location */}
        <h2 className="font-bold">
          Location *
        </h2>


        <div className="grid grid-cols-4 gap-3">

          {LocationOption.map((option, index) => (

            <div

              key={index}

              className={`border flex flex-col justify-center items-center p-3 rounded-lg cursor-pointer hover:bg-blue-100 hover:border-primary ${
                locationType === option.name
                  ? "bg-blue-100 border-primary"
                  : ""
              }`}

              onClick={() => setLocationType(option.name)}

            >

              <Image

                src={option.icon}

                width={30}

                height={30}

                alt={option.name}

              />

              <h2>{option.name}</h2>

            </div>

          ))}

        </div>


        {locationType && (

          <>

            <h2 className="font-bold">
              Add {locationType} URL *
            </h2>

            <Input

              placeholder="Add URL"

              value={locationUrl}

              onChange={(event) =>
                setLocationUrl(event.target.value)
              }

            />

          </>

        )}


        {/* Meeting Date & Time */}
        <h2 className="font-bold mt-2">
          Meeting Date & Time
        </h2>

        <p className="text-xs text-gray-500 -mt-2">

          Set the date and time for your meeting
          (required for sending invites)

        </p>


        <div className="flex gap-3 items-start">


          {/* Date Picker */}
          <div className="relative flex-1">

            <Button

              variant="outline"

              className="w-full justify-start text-left font-normal"

              onClick={() =>
                setShowCalendar(!showCalendar)
              }

            >

              <CalendarIcon className="mr-2 h-4 w-4" />

              {meetingDate
                ? format(meetingDate, "PPP")
                : "Pick a date"}

            </Button>


            {showCalendar && (

              <div className="absolute z-50 bg-white border rounded-lg shadow-lg mt-1">

                <Calendar

                  mode="single"

                  selected={meetingDate || undefined}

                  onSelect={(date) => {

                    setMeetingDate(date || null);

                    setShowCalendar(false);

                  }}

                  disabled={(date) => {

                    const today = new Date();

                    today.setHours(0, 0, 0, 0);

                    return date < today;

                  }}

                  className="rounded-md"

                />

              </div>

            )}

          </div>


          {/* Time Picker */}
          <DropdownMenu>

            <DropdownMenuTrigger asChild>

              <Button variant="outline" className="min-w-[130px]">

                {meetingTime || "Pick time"}

              </Button>

            </DropdownMenuTrigger>


            <DropdownMenuContent className="max-h-60 overflow-y-auto">

              {timeSlots.map((time, index) => (

                <DropdownMenuItem

                  key={index}

                  onClick={() => setMeetingTime(time)}

                >

                  {time}

                </DropdownMenuItem>

              ))}

            </DropdownMenuContent>

          </DropdownMenu>

        </div>


        {/* Invite Participants */}
        <h2 className="font-bold mt-2">
          Invite Participants
        </h2>

        <p className="text-xs text-gray-500 -mt-2">

          Add email addresses of people to invite

        </p>


        <div className="flex flex-col gap-2">

          {inviteeEmails.map((email, index) => (

            <div

              key={index}

              className="flex gap-2 items-center"

            >

              <Input

                type="email"

                placeholder={`participant${index + 1}@email.com`}

                value={email}

                onChange={(event) =>
                  handleEmailChange(index, event.target.value)
                }

                className="flex-1"

              />


              {inviteeEmails.length > 1 && (

                <Button

                  variant="ghost"

                  size="icon"

                  className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"

                  onClick={() =>
                    removeEmailField(index)
                  }

                >

                  <X className="h-4 w-4" />

                </Button>

              )}

            </div>

          ))}


          <Button

            variant="outline"

            className="w-fit flex gap-2 text-primary border-primary hover:bg-blue-50 mt-1"

            onClick={addEmailField}

          >

            <Plus className="h-4 w-4" />

            Add Email

          </Button>

        </div>


        {/* Theme Color */}
        <h2 className="font-bold">
          Select Theme Color
        </h2>


        <div className="flex justify-evenly">

          {ThemeOptions.map((color, index) => (

            <div

              key={index}

              className={`h-7 w-7 rounded-full cursor-pointer ${
                themeColor === color
                  ? "border-4 border-black"
                  : ""
              }`}

              style={{
                backgroundColor: color
              }}

              onClick={() => setThemeColor(color)}

            />

          ))}

        </div>


      </div>


      {/* Create Button */}
      <Button

        className="w-full mt-9"

        disabled={
          isCreating ||
          !eventName.trim() ||
          !locationType ||
          !locationUrl.trim()
        }

        onClick={onCreateClick}

      >

        {isCreating
          ? "Creating Meeting..."
          : "Create"}

      </Button>


    </div>

  );

}

export default MeetingForm;
