import { Button } from '@/components/ui/button'
import { Clock, MapPin, Users, CalendarCheck, Timer } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { format } from 'date-fns'

function PreviewMeeting({ formValue }) {

    const validEmails = formValue?.inviteeEmails?.filter(e => e && e.trim() !== '') || [];

    return (
        <div className='p-5 py-10 shadow-lg m-5 border-t-8'
            style={{ borderTopColor: formValue?.themeColor }}
        >
            <Image src='/logo.svg' alt='logo'
                width={150}
                height={150} />
            <div className='mt-5'>
                {/* Meeting Info  */}
                <div className='p-4'>
                    <h2 className='text-gray-500'>Business Name</h2>
                    <h2
                        className='font-bold text-3xl mt-1'
                    >{formValue?.eventName ? formValue?.eventName : 'Meeting Name'}</h2>
                    <div className='mt-5 flex flex-col gap-4'>
                        <h2 className='flex gap-2 text-gray-600'><Clock className='h-5 w-5' />{formValue?.duration} Min </h2>
                        <h2 className='flex gap-2 text-gray-600'><MapPin className='h-5 w-5' />{formValue?.locationType || 'Select'} Meeting </h2>

                        {/* Show selected date & time */}
                        {formValue?.meetingDate && (
                            <h2 className='flex gap-2 text-gray-600'>
                                <CalendarCheck className='h-5 w-5' />
                                {format(new Date(formValue.meetingDate), 'PPP')}
                            </h2>
                        )}
                        {formValue?.meetingTime && (
                            <h2 className='flex gap-2 text-gray-600'>
                                <Timer className='h-5 w-5' />
                                {formValue.meetingTime}
                            </h2>
                        )}

                        {formValue?.locationUrl && (
                            <Link href={'#'}
                                className='text-primary text-sm break-all'
                            >{formValue?.locationUrl}</Link>
                        )}

                        {/* Show invited participants */}
                        {validEmails.length > 0 && (
                            <div className='mt-3 p-4 bg-blue-50 rounded-lg'>
                                <h2 className='flex gap-2 font-medium text-sm text-gray-700 mb-3'>
                                    <Users className='h-5 w-5' /> Invited Participants ({validEmails.length})
                                </h2>
                                <div className='flex flex-col gap-2 ml-7'>
                                    {validEmails.map((email, index) => (
                                        <span key={index} className='text-sm text-gray-600 bg-white px-3 py-1.5 rounded-md w-fit shadow-sm'>
                                            {email}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PreviewMeeting