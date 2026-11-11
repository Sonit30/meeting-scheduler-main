"use client";

import { app } from "@/config/FirebaseConfig";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { Clock, Copy, MapPin, Pen, Settings, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function MeetingEventList() {
  const db = getFirestore(app);
  const { user } = useKindeBrowserClient();

  const [businessInfo, setBusinessInfo] = useState(null);
  const [eventList, setEventList] = useState([]);

  useEffect(() => {
    if (user?.email) {
      getEventList();
      BusinessInfo();
    }
  }, [user]);

  // ✅ GET EVENTS (no index issue)
  const getEventList = async () => {
    try {
      setEventList([]);

      const q = query(
        collection(db, "MeetingEvent"),
        where("createdBy", "==", user.email)
      );

      const snapshot = await getDocs(q);

      let events = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // ✅ frontend sorting (no Firestore index needed)
      events.sort((a, b) => (b.id > a.id ? 1 : -1));

      setEventList(events);
    } catch (error) {
      console.error("Error loading events:", error);
      toast("Error loading events");
    }
  };

  // ✅ BUSINESS INFO
  const BusinessInfo = async () => {
    try {
      const docRef = doc(db, "Business", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setBusinessInfo(docSnap.data());
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ DELETE EVENT
  const onDeleteMeetingEvent = async (event) => {
    try {
      await deleteDoc(doc(db, "MeetingEvent", event.id));
      toast("Meeting Event Deleted!");
      getEventList();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ COPY LINK - copies the actual meeting URL (Zoom/Meet/Phone link)
  const onCopyClickHandler = (event) => {
    const url = event.locationUrl;
    if (!url) {
      toast("No meeting link available");
      return;
    }
    navigator.clipboard.writeText(url);
    toast("Meeting link copied to clipboard!");
  };

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">

      {eventList.length > 0 ? (
        eventList.map((event) => (
          <div
            key={event.id}
            className="border shadow-md border-t-8 rounded-lg p-5 flex flex-col gap-3"
            style={{ borderTopColor: event?.themeColor }}
          >

            {/* SETTINGS */}
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Settings className="cursor-pointer" />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuItem className="flex gap-2">
                    <Pen /> Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex gap-2"
                    onClick={() => onDeleteMeetingEvent(event)}
                  >
                    <Trash /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* EVENT NAME */}
            <h2 className="font-medium text-xl">{event?.eventName}</h2>

            {/* INFO */}
            <div className="flex justify-between">
              <h2 className="flex gap-2 text-gray-500">
                <Clock /> {event.duration} Min
              </h2>

              <h2 className="flex gap-2 text-gray-500">
                <MapPin /> {event.locationType} Meeting
              </h2>
            </div>

            <hr />

            {/* ACTIONS */}
            <div className="flex justify-between">
              <h2
                className="flex gap-2 text-sm text-primary items-center cursor-pointer"
                onClick={() => onCopyClickHandler(event)}
              >
                <Copy className="h-4 w-4" /> Copy Link
              </h2>

              <button className="border px-3 py-1 rounded-full text-primary border-primary">
                Share
              </button>
            </div>
          </div>
        ))
      ) : (
        <h2>Loading...</h2>
      )}

    </div>
  );
}

export default MeetingEventList;