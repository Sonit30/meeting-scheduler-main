
"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { database } from "@/config/FirebaseConfig";

import { ref, set, get } from "firebase/database";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { toast } from "sonner";


function CreateBusiness() {

    const [businessName, setBusinessName] = useState("");

    const [loading, setLoading] = useState(false);

    const { user } = useKindeBrowserClient();

    const router = useRouter();


    /**
     * Create Business and Save in Firebase Realtime Database
     */
    const onCreateBusiness = async () => {

        if (loading) return;

        if (!businessName.trim()) {

            toast.error("Please enter your business name");

            return;
        }

        if (!user?.email) {

            toast.error("Please login before creating a business");

            return;
        }


        setLoading(true);


        try {

            // Generate business ID
            const businessId = user.id || user.email;

            // Reference to business
            const businessRef = ref(
                database,
                `Business/${businessId}`
            );


            // Check whether business already exists
            const snapshot = await get(businessRef);

            if (snapshot.exists()) {

                toast.error("Business already exists!");

                router.replace("/dashboard");

                return;
            }


            // Business data
            const businessData = {

                businessName: businessName.trim().replace(/\s+/g, "_"),

                email: user.email,

                userName: [
                    user.given_name,
                    user.family_name
                ].filter(Boolean).join(" "),

                businessId: businessId,

                createdAt: new Date().toISOString()

            };


            // Save business in Realtime Database
            await set(businessRef, businessData);


            toast.success("New Business Created!");

            router.replace("/dashboard");


        } catch (error) {

            console.error("Create business error:", error);

            toast.error(
                "Failed to create business. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="p-14 items-center flex flex-col gap-20 my-10">

            <Image
                src="/logo.svg"
                width={200}
                height={200}
                alt="Logo"
                priority
            />


            <div className="flex flex-col items-center gap-4 max-w-3xl w-full">

                <h2 className="text-4xl font-bold text-center">

                    What should we call your business?

                </h2>


                <p className="text-slate-500">

                    You can always change this later from settings.

                </p>


                <div className="w-full">

                    <label className="text-slate-400">

                        Team Name

                    </label>


                    <Input

                        placeholder="Ex. TubeGuruji"

                        className="mt-2"

                        value={businessName}

                        onChange={(event) =>
                            setBusinessName(event.target.value)
                        }

                    />

                </div>


                <Button

                    className="w-full"

                    disabled={
                        !businessName.trim() ||
                        loading ||
                        !user?.email
                    }

                    onClick={onCreateBusiness}

                >

                    {loading
                        ? "Creating Business..."
                        : "Create Business"}

                </Button>

            </div>

        </div>

    );

}

export default CreateBusiness;
