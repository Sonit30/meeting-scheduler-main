"use client";

import React, { useEffect, useState } from "react";
import DaysList from "@/app/_utils/DaysList";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "@/config/FirebaseConfig";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { toast } from "sonner";

function Availability() {
  const [daysAvailable, setDaysAvailable] = useState({
    Sunday: false,
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
  });

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const db = getFirestore(app);
  const { user } = useKindeBrowserClient();

  useEffect(() => {
    if (user?.email) {
      getBusinessInfo();
    }
  }, [user]);

  const getBusinessInfo = async () => {
    try {
      const docRef = doc(db, "Business", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const result = docSnap.data();

        setDaysAvailable(result?.daysAvailable || {});
        setStartTime(result?.startTime || "");
        setEndTime(result?.endTime || "");
      }
    } catch (error) {
      console.error("Error fetching business info:", error);
      toast.error("Failed to load availability data");
    }
  };

  const onHandleChange = (day, value) => {
    setDaysAvailable((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.email) return;

    try {
      const docRef = doc(db, "Business", user.email);

      await updateDoc(docRef, {
        daysAvailable,
        startTime,
        endTime,
      });

      toast.success("Changes Updated!");
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    }
  };

  return (
    <div className="p-10">
      <h2 className="font-bold text-2xl">Availability</h2>
      <hr className="my-7" />

      {/* Availability Days */}
      <div>
        <h2 className="font-bold">Availability Days</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 my-3">
          {DaysList?.map((item, index) => (
            <div key={index}>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={daysAvailable[item?.day] || false}
                  onCheckedChange={(value) =>
                    onHandleChange(item.day, value === true)
                  }
                />
                {item.day}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability Time */}
      <div>
        <h2 className="font-bold mt-10">Availability Time</h2>
        <div className="flex gap-10">
          <div className="mt-3">
            <h2>Start Time</h2>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="mt-3">
            <h2>End Time</h2>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button className="mt-10" onClick={handleSave}>
        Save
      </Button>
    </div>
  );
}

export default Availability;
