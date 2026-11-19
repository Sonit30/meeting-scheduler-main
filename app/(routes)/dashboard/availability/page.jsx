
"use client";

import React, { useEffect, useState } from "react";

import DaysList from "@/app/_utils/DaysList";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  ref,
  get,
  update
} from "firebase/database";

import { database } from "@/config/FirebaseConfig";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import { toast } from "sonner";


function Availability() {

  const { user, isLoading } = useKindeBrowserClient();

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

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);


  // Get Business ID
  const businessId = user?.id || user?.email;


  /**
   * Fetch Business Availability
   */
  useEffect(() => {

    if (isLoading) return;

    if (!businessId) {

      setLoading(false);

      return;
    }

    let cancelled = false;


    const getBusinessInfo = async () => {

      try {

        setLoading(true);

        const businessRef = ref(
          database,
          `Business/${businessId}`
        );

        const snapshot = await get(businessRef);


        if (!snapshot.exists()) {

          toast.error("Business information not found");

          return;
        }


        const result = snapshot.val();


        if (!cancelled) {

          setDaysAvailable({

            Sunday: false,
            Monday: false,
            Tuesday: false,
            Wednesday: false,
            Thursday: false,
            Friday: false,
            Saturday: false,

            ...(result.daysAvailable || {})

          });

          setStartTime(result.startTime || "");

          setEndTime(result.endTime || "");

        }


      } catch (error) {

        console.error(
          "Error fetching availability:",
          error
        );

        if (!cancelled) {

          toast.error("Failed to load availability data");

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    };


    getBusinessInfo();


    return () => {

      cancelled = true;

    };

  }, [businessId, isLoading]);


  /**
   * Handle Availability Day Changes
   */
  const onHandleChange = (day, value) => {

    setDaysAvailable((prev) => ({

      ...prev,

      [day]: value === true

    }));

  };


  /**
   * Save Availability
   */
  const handleSave = async () => {

    if (!businessId) {

      toast.error("Please login first");

      return;
    }


    // Check selected days
    const hasAvailableDay = Object.values(
      daysAvailable
    ).some(Boolean);


    if (!hasAvailableDay) {

      toast.error("Please select at least one available day");

      return;
    }


    // Validate times
    if (!startTime || !endTime) {

      toast.error("Please select start and end times");

      return;
    }


    if (startTime >= endTime) {

      toast.error("End time must be later than start time");

      return;
    }


    try {

      setSaving(true);


      const businessRef = ref(
        database,
        `Business/${businessId}`
      );


      // Update only availability fields
      await update(businessRef, {

        daysAvailable,

        startTime,

        endTime

      });


      toast.success("Availability updated successfully!");


    } catch (error) {

      console.error(
        "Error updating availability:",
        error
      );

      toast.error("Failed to update availability");


    } finally {

      setSaving(false);

    }

  };


  // Loading Screen
  if (loading || isLoading) {

    return (

      <div className="p-10 text-center">

        Loading availability...

      </div>

    );

  }


  // Not logged in
  if (!user?.email) {

    return (

      <div className="p-10 text-center">

        Please login to manage availability.

      </div>

    );

  }


  return (

    <div className="p-10">

      <h2 className="font-bold text-2xl">

        Availability

      </h2>


      <hr className="my-7" />


      {/* Availability Days */}
      <div>

        <h2 className="font-bold">

          Availability Days

        </h2>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 my-3">

          {DaysList?.map((item) => (

            <div key={item.day}>

              <label className="flex items-center gap-2 cursor-pointer">

                <Checkbox

                  checked={daysAvailable[item.day] || false}

                  onCheckedChange={(value) =>

                    onHandleChange(item.day, value)

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

        <h2 className="font-bold mt-10">

          Availability Time

        </h2>


        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">

          <div className="mt-3">

            <h2 className="mb-2">

              Start Time

            </h2>


            <Input

              type="time"

              value={startTime}

              onChange={(e) =>

                setStartTime(e.target.value)

              }

            />

          </div>


          <div className="mt-3">

            <h2 className="mb-2">

              End Time

            </h2>


            <Input

              type="time"

              value={endTime}

              onChange={(e) =>

                setEndTime(e.target.value)

              }

            />

          </div>

        </div>

      </div>


      {/* Save Button */}
      <Button

        className="mt-10"

        onClick={handleSave}

        disabled={saving}

      >

        {saving ? "Saving..." : "Save Availability"}

      </Button>


    </div>

  );

}


export default Availability;
