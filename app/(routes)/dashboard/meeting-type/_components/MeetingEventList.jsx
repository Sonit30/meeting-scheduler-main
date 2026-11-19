
"use client";

import React, { useEffect, useState, useCallback } from "react";

import { database } from "@/config/FirebaseConfig";

import {
  ref,
  get,
  remove
} from "firebase/database";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import {
  Clock,
  Copy,
  MapPin,
  Pen,
  Settings,
  Trash
} from "lucide-react";

import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


function MeetingEventList() {

  const { user, isLoading } = useKindeBrowserClient();

  const [businessInfo, setBusinessInfo] = useState(null);

  const [eventList, setEventList] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);


  // Get meetings created by current user
  const getEventList = useCallback(async () => {

    if (!user?.email) return;

    try {

      setLoading(true);

      const eventsRef = ref(database, "MeetingEvent");

      const snapshot = await get(eventsRef);

      if (!snapshot.exists()) {

        setEventList([]);

        return;
      }

      const eventsData = snapshot.val();

      const events = Object.entries(eventsData)

        .map(([id, data]) => ({
          ...data,
          id
        }))

        .filter(event =>
          event.createdBy === user.email
        )

        .sort((a, b) =>
          b.id.localeCompare(a.id)
        );


      setEventList(events);


    } catch (error) {

      console.error("Error loading events:", error);

      toast.error("Error loading meeting events");

    } finally {

      setLoading(false);

    }

  }, [user?.email]);


  // Get business information
  const getBusinessInfo = useCallback(async () => {

    if (!user?.email) return;

    try {

      const businessId = user.id || user.email;

      const businessRef = ref(
        database,
        `Business/${businessId}`
      );

      const snapshot = await get(businessRef);

      if (snapshot.exists()) {

        setBusinessInfo(snapshot.val());

      } else {

        setBusinessInfo(null);

      }

    } catch (error) {

      console.error("Business information error:", error);

    }

  }, [user?.id, user?.email]);


  // Load data
  useEffect(() => {

    if (isLoading) return;

    if (!user?.email) {

      setLoading(false);

      return;
    }

    getEventList();

    getBusinessInfo();

  }, [
    user,
    isLoading,
    getEventList,
    getBusinessInfo
  ]);


  // Delete meeting event
  const onDeleteMeetingEvent = async (event) => {

    if (deletingId) return;

    try {

      setDeletingId(event.id);

      const eventRef = ref(
        database,
        `MeetingEvent/${event.id}`
      );

      await remove(eventRef);


      setEventList(prev =>
        prev.filter(item => item.id !== event.id)
      );


      toast.success("Meeting Event Deleted!");

    } catch (error) {

      console.error("Delete meeting error:", error);

      toast.error("Failed to delete meeting event");

    } finally {

      setDeletingId(null);

    }

  };


  // Copy meeting link
  const onCopyClickHandler = async (event) => {

    try {

      const url = event.locationUrl;

      if (!url) {

        toast.error("No meeting link available");

        return;
      }

      await navigator.clipboard.writeText(url);

      toast.success("Meeting link copied!");

    } catch (error) {

      console.error("Copy error:", error);

      toast.error("Unable to copy meeting link");

    }

  };


  // Loading
  if (isLoading || loading) {

    return (

      <div className="mt-10 flex justify-center">

        <p className="text-gray-500">
          Loading meetings...
        </p>

      </div>

    );

  }


  // Not logged in
  if (!user?.email) {

    return (

      <div className="mt-10 text-center">

        Please login to view your meetings.

      </div>

    );

  }


  return (

    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">


      {eventList.length > 0 ? (

        eventList.map((event) => (

          <div

            key={event.id}

            className="border shadow-md border-t-8 rounded-lg p-5 flex flex-col gap-3"

            style={{
              borderTopColor: event?.themeColor || "#2563eb"
            }}

          >


            {/* SETTINGS */}
            <div className="flex justify-end">

              <DropdownMenu>

                <DropdownMenuTrigger asChild>

                  <button
                    type="button"
                    aria-label="Meeting settings"
                    className="cursor-pointer"
                  >

                    <Settings />

                  </button>

                </DropdownMenuTrigger>


                <DropdownMenuContent>

                  <DropdownMenuItem
                    disabled
                    className="flex gap-2"
                  >

                    <Pen />

                    Edit

                  </DropdownMenuItem>


                  <DropdownMenuItem

                    className="flex gap-2 text-red-500"

                    disabled={deletingId === event.id}

                    onClick={() =>
                      onDeleteMeetingEvent(event)
                    }

                  >

                    <Trash />

                    {deletingId === event.id
                      ? "Deleting..."
                      : "Delete"}

                  </DropdownMenuItem>

                </DropdownMenuContent>

              </DropdownMenu>

            </div>


            {/* EVENT NAME */}
            <h2 className="font-medium text-xl">

              {event?.eventName}

            </h2>


            {/* EVENT INFORMATION */}
            <div className="flex justify-between gap-2">

              <h2 className="flex gap-2 text-gray-500">

                <Clock />

                {event.duration} Min

              </h2>


              <h2 className="flex gap-2 text-gray-500">

                <MapPin />

                {event.locationType} Meeting

              </h2>

            </div>


            <hr />


            {/* ACTIONS */}
            <div className="flex justify-between items-center">


              <button

                type="button"

                className="flex gap-2 text-sm text-primary items-center cursor-pointer"

                onClick={() =>
                  onCopyClickHandler(event)
                }

              >

                <Copy className="h-4 w-4" />

                Copy Link

              </button>


              <button

                type="button"

                className="border px-3 py-1 rounded-full text-primary border-primary"

                onClick={() =>
                  onCopyClickHandler(event)
                }

              >

                Share

              </button>


            </div>

          </div>

        ))

      ) : (

        <div className="col-span-full text-center py-10">

          <h2 className="text-lg font-medium">

            No Meeting Events Found

          </h2>

          <p className="text-gray-500 mt-2">

            Create your first meeting event to get started.

          </p>

        </div>

      )}

    </div>

  );

}


export default MeetingEventList;
