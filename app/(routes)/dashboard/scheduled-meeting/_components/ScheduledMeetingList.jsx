
"use client";

import React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  CalendarCheck,
  Clock,
  Timer,
  User,
  Mail,
  MapPin
} from "lucide-react";

import Link from "next/link";

import { Button } from "@/components/ui/button";


function ScheduledMeetingList({ meetingList = [] }) {

  // Empty state
  if (!meetingList || meetingList.length === 0) {

    return (

      <div className="text-center py-12">

        <CalendarCheck className="h-12 w-12 mx-auto text-gray-400 mb-3" />

        <h2 className="font-semibold text-lg">

          No Scheduled Meetings

        </h2>

        <p className="text-gray-500 text-sm mt-2">

          Your scheduled meetings will appear here.

        </p>

      </div>

    );

  }


  // Validate meeting URL
  const getValidMeetingUrl = (url) => {

    if (!url) return null;

    try {

      const parsedUrl = new URL(url);

      if (
        parsedUrl.protocol === "http:" ||
        parsedUrl.protocol === "https:"
      ) {

        return parsedUrl.href;

      }

      return null;

    } catch {

      return null;

    }

  };


  return (

    <div className="mt-5 flex flex-col gap-3">

      <Accordion type="multiple" className="w-full">

        {meetingList.map((meeting, index) => {

          const meetingDate =
            meeting?.formattedDate ||
            meeting?.formatedDate ||
            meeting?.selectedDate ||
            "Date not available";

          const meetingUrl = getValidMeetingUrl(
            meeting?.locationUrl
          );


          return (

            <AccordionItem

              value={String(meeting.id || index)}

              key={meeting.id || index}

              className="border rounded-lg px-4 mb-3"

            >

              {/* Meeting Header */}
              <AccordionTrigger>

                <div className="flex flex-col items-start gap-1">

                  <h2 className="font-semibold">

                    {meeting?.userName || "Meeting"}

                  </h2>

                  <p className="text-sm text-gray-500">

                    {meetingDate} · {meeting?.selectedTime || "Time not available"}

                  </p>

                </div>

              </AccordionTrigger>


              {/* Meeting Details */}
              <AccordionContent>

                <div className="mt-4 flex flex-col gap-4">


                  {/* Duration */}
                  <h2 className="flex items-center gap-2">

                    <Clock className="h-5 w-5 text-primary" />

                    {meeting?.duration || 30} Minutes

                  </h2>


                  {/* Date */}
                  <h2 className="flex items-center gap-2">

                    <CalendarCheck className="h-5 w-5 text-primary" />

                    {meetingDate}

                  </h2>


                  {/* Time */}
                  <h2 className="flex items-center gap-2">

                    <Timer className="h-5 w-5 text-primary" />

                    {meeting?.selectedTime || "Not specified"}

                  </h2>


                  {/* Participant */}
                  {meeting?.userName && (

                    <h2 className="flex items-center gap-2">

                      <User className="h-5 w-5 text-primary" />

                      {meeting.userName}

                    </h2>

                  )}


                  {/* Participant Email */}
                  {meeting?.userEmail && (

                    <h2 className="flex items-center gap-2 break-all">

                      <Mail className="h-5 w-5 text-primary shrink-0" />

                      {meeting.userEmail}

                    </h2>

                  )}


                  {/* Location */}
                  {meeting?.locationUrl && (

                    <div className="flex items-start gap-2">

                      <MapPin className="h-5 w-5 text-primary shrink-0" />

                      {meetingUrl ? (

                        <Link

                          href={meetingUrl}

                          target="_blank"

                          rel="noopener noreferrer"

                          className="text-primary underline break-all"

                        >

                          {meeting.locationUrl}

                        </Link>

                      ) : (

                        <span className="text-gray-500">

                          Invalid meeting URL

                        </span>

                      )}

                    </div>

                  )}


                  {/* Notes */}
                  {meeting?.userNote && (

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="font-medium text-sm">

                        Meeting Notes

                      </p>

                      <p className="text-sm text-gray-600 mt-1">

                        {meeting.userNote}

                      </p>

                    </div>

                  )}


                  {/* Join Meeting */}
                  {meetingUrl && (

                    <Link

                      href={meetingUrl}

                      target="_blank"

                      rel="noopener noreferrer"

                    >

                      <Button className="mt-3 w-full sm:w-auto">

                        Join Meeting

                      </Button>

                    </Link>

                  )}


                </div>

              </AccordionContent>

            </AccordionItem>

          );

        })}

      </Accordion>

    </div>

  );

}


export default ScheduledMeetingList;
