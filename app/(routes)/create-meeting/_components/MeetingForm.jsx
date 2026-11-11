"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Plus, X, CalendarIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LocationOption from '@/app/_utils/LocationOption'
import Image from 'next/image'
import Link from 'next/link'
import ThemeOptions from '@/app/_utils/ThemeOptions'
import { doc, getFirestore, setDoc } from 'firebase/firestore'
import { app } from '@/config/FirebaseConfig'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'

function MeetingForm({ setFormValue }) {

    const [location, setLocation] = useState();
    const [themeColor, setThemeColor] = useState('');
    const [eventName, setEventName] = useState();
    const [duration, setDuration] = useState(30);
    const [locationType, setLocationType] = useState();
    const [locationUrl, setLocationUrl] = useState();
    const [inviteeEmails, setInviteeEmails] = useState(['']);
    const [meetingDate, setMeetingDate] = useState(null);
    const [meetingTime, setMeetingTime] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const { user } = useKindeBrowserClient();
    const db = getFirestore(app);
    const router = useRouter();

    // Generate time slots
    const timeSlots = [];
    for (let h = 8; h <= 21; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hour12 = h > 12 ? h - 12 : h;
            const period = h >= 12 ? 'PM' : 'AM';
            timeSlots.push(`${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`);
        }
    }

    useEffect(() => {
        setFormValue({
            eventName: eventName,
            duration: duration,
            locationType: locationType,
            locationUrl: locationUrl,
            themeColor: themeColor,
            inviteeEmails: inviteeEmails.filter(e => e.trim() !== ''),
            meetingDate: meetingDate,
            meetingTime: meetingTime
        })
    }, [eventName, duration, locationType, locationUrl, themeColor, inviteeEmails, meetingDate, meetingTime])

    // Email field handlers
    const handleEmailChange = (index, value) => {
        const updated = [...inviteeEmails];
        updated[index] = value;
        setInviteeEmails(updated);
    };

    const addEmailField = () => {
        setInviteeEmails([...inviteeEmails, '']);
    };

    const removeEmailField = (index) => {
        if (inviteeEmails.length === 1) return;
        const updated = inviteeEmails.filter((_, i) => i !== index);
        setInviteeEmails(updated);
    };

    // Validate emails
    const validateEmails = () => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        const validEmails = inviteeEmails.filter(e => e.trim() !== '');
        if (validEmails.length === 0) return true; // emails are optional
        for (const email of validEmails) {
            if (!regex.test(email)) {
                toast(`Invalid email: ${email}`);
                return false;
            }
        }
        return true;
    };

    /**
     * On Create Click Handler
     */
    const onCreateClick = async () => {
        if (!validateEmails()) return;

        const id = Date.now().toString();
        const validEmails = inviteeEmails.filter(e => e.trim() !== '');

        const eventData = {
            id: id,
            eventName: eventName,
            duration: duration,
            locationType: locationType,
            locationUrl: locationUrl,
            themeColor: themeColor,
            businessId: doc(db, 'Business', user?.email),
            createdBy: user?.email,
            inviteeEmails: validEmails,
            meetingDate: meetingDate ? meetingDate.toISOString() : null,
            meetingTime: meetingTime || null,
        };

        await setDoc(doc(db, 'MeetingEvent', id), eventData);

        // Send confirmation emails to all invitees
        if (validEmails.length > 0 && meetingDate && meetingTime) {
            try {
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emails: validEmails,
                        eventName: eventName,
                        duration: duration,
                        locationUrl: locationUrl,
                        locationType: locationType,
                        meetingDate: format(meetingDate, 'PPP'),
                        meetingDateISO: meetingDate.toISOString(),
                        meetingTime: meetingTime,
                        organizerEmail: user?.email,
                        organizerName: user?.given_name || user?.email,
                        type: 'confirmation',
                        eventId: id,
                    }),
                });
                const result = await response.json();
                if (result.success) {
                    toast('Invitation emails sent to all participants!');
                } else {
                    toast('Event created but emails failed to send. Check email config.');
                }
            } catch (error) {
                console.error('Email sending error:', error);
                toast('Event created but emails could not be sent.');
            }
        }

        toast('New Meeting Event Created!');
        router.replace('/dashboard/meeting-type');
    };

    return (
        <div className='p-8 overflow-y-auto' style={{ maxHeight: '100vh' }}>
            <Link href={'/dashboard'}>
                <h2 className='flex gap-2'>
                    <ChevronLeft /> Cancel</h2>
            </Link>
            <div className='mt-4'>
                <h2 className='font-bold text-2xl my-4'>Create New Event</h2>
                <hr></hr>
            </div>
            <div className='flex flex-col gap-3 my-4'>
                <h2 className='font-bold'>Event Name *</h2>
                <Input placeholder="Name of your meeting event"
                    onChange={(event) => setEventName(event.target.value)}
                />

                <h2 className='font-bold'>Duration *</h2>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="max-w-40">{duration} Min</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setDuration(15)}>15 Min</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDuration(30)}>30 Min</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDuration(45)}>45 Min</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDuration(60)}>60 Min</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <h2 className='font-bold'>Location *</h2>
                <div className='grid grid-cols-4 gap-3'>
                    {LocationOption.map((option, index) => (
                        <div key={index} className={`border flex flex-col
                     justify-center items-center 
                     p-3 rounded-lg cursor-pointer
                     hover:bg-blue-100 hover:border-primary
                     ${locationType == option.name && 'bg-blue-100 border-primary'}`}
                            onClick={() => setLocationType(option.name)}
                        >
                            <Image src={option.icon} width={30} height={30}
                                alt={option.name} />
                            <h2>{option.name}</h2>
                        </div>
                    ))}
                </div>
                {locationType && <>
                    <h2 className='font-bold'>Add {locationType} Url *</h2>
                    <Input placeholder='Add Url'
                        onChange={(event) => setLocationUrl(event.target.value)}
                    />
                </>}

                {/* ========== MEETING DATE & TIME ========== */}
                <h2 className='font-bold mt-2'>Meeting Date & Time</h2>
                <p className='text-xs text-gray-500 -mt-2'>Set the date and time for your meeting (required for sending invites)</p>

                <div className='flex gap-3 items-start'>
                    {/* Date Picker */}
                    <div className='relative flex-1'>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            onClick={() => setShowCalendar(!showCalendar)}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {meetingDate ? format(meetingDate, 'PPP') : 'Pick a date'}
                        </Button>
                        {showCalendar && (
                            <div className='absolute z-50 bg-white border rounded-lg shadow-lg mt-1'>
                                <Calendar
                                    mode="single"
                                    selected={meetingDate}
                                    onSelect={(d) => { setMeetingDate(d); setShowCalendar(false); }}
                                    disabled={(d) => d < new Date()}
                                    className="rounded-md"
                                />
                            </div>
                        )}
                    </div>

                    {/* Time Picker */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="min-w-[130px]">
                                {meetingTime || 'Pick time'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-60 overflow-y-auto">
                            {timeSlots.map((time, index) => (
                                <DropdownMenuItem key={index} onClick={() => setMeetingTime(time)}>
                                    {time}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* ========== INVITE PARTICIPANTS ========== */}
                <h2 className='font-bold mt-2'>Invite Participants</h2>
                <p className='text-xs text-gray-500 -mt-2'>Add email addresses of people to invite</p>

                <div className='flex flex-col gap-2'>
                    {inviteeEmails.map((email, index) => (
                        <div key={index} className='flex gap-2 items-center'>
                            <Input
                                type="email"
                                placeholder={`participant${index + 1}@email.com`}
                                value={email}
                                onChange={(e) => handleEmailChange(index, e.target.value)}
                                className="flex-1"
                            />
                            {inviteeEmails.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                                    onClick={() => removeEmailField(index)}
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
                        <Plus className="h-4 w-4" /> Add Email
                    </Button>
                </div>

                {/* ========== THEME COLOR ========== */}
                <h2 className='font-bold'>Select Theme Color</h2>
                <div className='flex justify-evenly'>
                    {ThemeOptions.map((color, index) => (
                        <div key={index} className={`h-7 w-7 rounded-full cursor-pointer
                    ${themeColor == color && ' border-4 border-black'}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setThemeColor(color)}
                        >
                        </div>
                    ))}
                </div>
            </div>

            <Button className="w-full mt-9"
                disabled={(!eventName || !duration || !locationType || !locationUrl)}
                onClick={() => onCreateClick()}
            >Create</Button>
        </div>
    )
}

export default MeetingForm