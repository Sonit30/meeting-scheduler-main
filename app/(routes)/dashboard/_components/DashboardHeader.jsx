
"use client";

import React, { useEffect, useState } from "react";

import {
  LogoutLink,
  useKindeBrowserClient
} from "@kinde-oss/kinde-auth-nextjs";

import { ChevronDown, Building2, User, Settings, LogOut } from "lucide-react";

import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ref,
  get
} from "firebase/database";

import { database } from "@/config/FirebaseConfig";


function DashboardHeader() {

  const { user, isLoading } = useKindeBrowserClient();

  const [businessInfo, setBusinessInfo] = useState(null);

  const [loading, setLoading] = useState(true);


  // User name
  const userName = [
    user?.given_name,
    user?.family_name
  ].filter(Boolean).join(" ") || "User";


  // Fetch business information
  useEffect(() => {

    if (isLoading) return;

    if (!user?.email) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const getBusinessInfo = async () => {

      try {

        const businessId = user.id || user.email;

        const businessRef = ref(
          database,
          `Business/${businessId}`
        );

        const snapshot = await get(businessRef);

        if (!cancelled && snapshot.exists()) {

          setBusinessInfo(snapshot.val());

        }

      } catch (error) {

        console.error(
          "Business information error:",
          error
        );

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

  }, [user?.id, user?.email, isLoading]);


  if (isLoading || !user) return null;


  return (

    <div className="w-full border-b bg-white">

      <div className="p-4 px-5 md:px-10 flex items-center justify-between gap-4">

        {/* LEFT SIDE - BUSINESS NAME */}
        <div className="flex items-center gap-3 min-w-0">

          <div className="bg-primary/10 p-2 rounded-lg">

            <Building2 className="h-6 w-6 text-primary" />

          </div>

          <div className="min-w-0">

            <h2 className="font-bold text-lg truncate">

              {loading
                ? "Loading..."
                : businessInfo?.businessName?.replace(/_/g, " ") || "My Business"}

            </h2>

            <p className="text-xs text-gray-500">

              Meeting Dashboard

            </p>

          </div>

        </div>


        {/* RIGHT SIDE - USER PROFILE DROPDOWN */}
        <DropdownMenu>

          <DropdownMenuTrigger asChild>

            <button className="flex items-center gap-2 md:gap-3 rounded-lg p-2 hover:bg-gray-100 transition">

              {user.picture ? (

                <Image

                  src={user.picture}

                  alt="Profile"

                  width={40}

                  height={40}

                  className="rounded-full object-cover"

                />

              ) : (

                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">

                  <User className="text-primary" />

                </div>

              )}


              {/* USER NAME */}
              <div className="hidden sm:block text-left">

                <h2 className="font-semibold text-sm">

                  {userName}

                </h2>

                <p className="text-xs text-gray-500">

                  {user.email}

                </p>

              </div>


              <ChevronDown className="h-4 w-4 text-gray-500" />

            </button>

          </DropdownMenuTrigger>


          <DropdownMenuContent

            align="end"

            className="w-64"

          >

            {/* ACCOUNT INFORMATION */}
            <DropdownMenuLabel>

              <div className="flex flex-col gap-1">

                <span className="font-semibold">

                  {userName}

                </span>

                <span className="text-xs font-normal text-gray-500 break-all">

                  {user.email}

                </span>

              </div>

            </DropdownMenuLabel>


            <DropdownMenuSeparator />


            {/* BUSINESS INFORMATION */}
            <DropdownMenuLabel className="text-xs text-gray-500">

              BUSINESS

            </DropdownMenuLabel>

            <DropdownMenuItem disabled>

              <Building2 className="mr-2 h-4 w-4" />

              {businessInfo?.businessName?.replace(/_/g, " ") || "My Business"}

            </DropdownMenuItem>


            <DropdownMenuSeparator />


            {/* PROFILE */}
            <DropdownMenuItem

              onSelect={() => {
                window.location.href = "/dashboard/profile";
              }}

            >

              <User className="mr-2 h-4 w-4" />

              Profile

            </DropdownMenuItem>


            {/* SETTINGS */}
            <DropdownMenuItem

              onSelect={() => {
                window.location.href = "/dashboard/settings";
              }}

            >

              <Settings className="mr-2 h-4 w-4" />

              Settings

            </DropdownMenuItem>


            <DropdownMenuSeparator />


            {/* LOGOUT */}
            <DropdownMenuItem className="text-red-500 focus:text-red-500">

              <LogOut className="mr-2 h-4 w-4" />

              <LogoutLink>

                Logout

              </LogoutLink>

            </DropdownMenuItem>


          </DropdownMenuContent>

        </DropdownMenu>

      </div>

    </div>

  );

}


export default DashboardHeader;
