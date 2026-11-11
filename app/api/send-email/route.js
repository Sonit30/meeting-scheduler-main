import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

// Initialize Firebase for server-side
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBAROUpW8bofgXcU77GFuitI6fptW-wpWs",
    databaseURL: "https://meeting-schedular-a4329-default-rtdb.firebaseio.com/",
    authDomain: "meeting-schedular-a4329.firebaseapp.com",
    projectId: "meeting-schedular-a4329",
    storageBucket: "meeting-schedular-a4329.firebasestorage.app",
    messagingSenderId: "286679771621",
    appId: "1:286679771621:web:10b6a50d9266c13f4e270c",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig, 'email-service') : getApps().find(a => a.name === 'email-service') || initializeApp(firebaseConfig, 'email-service');
const db = getFirestore(app);

// Create Nodemailer transporter using Gmail SMTP
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
}

// Beautiful HTML email template
function generateEmailHTML({ eventName, organizerName, duration, locationType, locationUrl, meetingDate, meetingTime, type }) {
    const isReminder = type === 'reminder_1day' || type === 'reminder_1hour';
    const reminderText = type === 'reminder_1day' ? 'Tomorrow' : 'In 1 Hour';

    const headerBg = isReminder ? '#FF6B35' : '#4F75FE';
    const headerEmoji = isReminder ? '⏰' : '✅';
    const headerTitle = isReminder
        ? `Reminder: Your Meeting is ${reminderText}!`
        : 'You\'re Invited to a Meeting!';
    const subTitle = isReminder
        ? `Don't forget — your meeting "${eventName}" is coming up ${reminderText.toLowerCase()}.`
        : `${organizerName} has invited you to a meeting.`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background:${headerBg};padding:40px 30px;text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">${headerEmoji}</div>
                <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">${headerTitle}</h1>
                <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;">${subTitle}</p>
            </div>

            <!-- Meeting Details Card -->
            <div style="padding:32px 30px;">
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
                    <h2 style="margin:0 0 20px;color:#1e293b;font-size:20px;border-bottom:2px solid ${headerBg};padding-bottom:12px;">
                        📋 Meeting Details
                    </h2>
                    
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;width:140px;vertical-align:top;">
                                🏷️ Meeting Title
                            </td>
                            <td style="padding:10px 0;color:#1e293b;font-size:15px;font-weight:600;">
                                ${eventName}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;vertical-align:top;">
                                👤 Organized By
                            </td>
                            <td style="padding:10px 0;color:#1e293b;font-size:15px;">
                                ${organizerName}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;vertical-align:top;">
                                📅 Date & Time
                            </td>
                            <td style="padding:10px 0;color:#1e293b;font-size:15px;font-weight:600;">
                                ${meetingDate} • ${meetingTime}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;vertical-align:top;">
                                ⏱️ Duration
                            </td>
                            <td style="padding:10px 0;color:#1e293b;font-size:15px;">
                                ${duration} minutes
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;vertical-align:top;">
                                📍 Location
                            </td>
                            <td style="padding:10px 0;color:#1e293b;font-size:15px;">
                                ${locationType} Meeting
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Join Button -->
                ${locationUrl ? `
                <div style="text-align:center;margin:24px 0;">
                    <a href="${locationUrl}" 
                       style="display:inline-block;background:${headerBg};color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                        🔗 Join Meeting
                    </a>
                </div>
                <p style="text-align:center;color:#94a3b8;font-size:13px;margin:8px 0 0;">
                    Or copy this link: <a href="${locationUrl}" style="color:${headerBg};">${locationUrl}</a>
                </p>
                ` : ''}
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;padding:20px 30px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">
                    This is an automated message from Meeting Scheduler.
                    <br>If you have questions, please contact the meeting organizer.
                </p>
                <p style="color:#cbd5e1;font-size:11px;margin:8px 0 0;">
                    Made with 💙 by Meeting Scheduler
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            emails,
            eventName,
            duration,
            locationUrl,
            locationType,
            meetingDate,
            meetingDateISO,
            meetingTime,
            organizerEmail,
            organizerName,
            type = 'confirmation',
            eventId,
        } = body;

        if (!emails || emails.length === 0) {
            return NextResponse.json({ success: false, error: 'No emails provided' }, { status: 400 });
        }

        // Check if Gmail credentials are configured
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            return NextResponse.json({
                success: false,
                error: 'Gmail credentials not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env'
            }, { status: 500 });
        }

        const transporter = createTransporter();

        // Generate email HTML
        const html = generateEmailHTML({
            eventName,
            organizerName,
            duration,
            locationType,
            locationUrl,
            meetingDate,
            meetingTime,
            type,
        });

        // Determine subject line
        let subject = '';
        switch (type) {
            case 'confirmation':
                subject = `✅ You're Invited: ${eventName}`;
                break;
            case 'reminder_1day':
                subject = `⏰ Reminder: ${eventName} is Tomorrow!`;
                break;
            case 'reminder_1hour':
                subject = `🔔 Starting Soon: ${eventName} in 1 Hour!`;
                break;
            default:
                subject = `Meeting: ${eventName}`;
        }

        // Send email to each recipient
        const results = [];
        for (const email of emails) {
            try {
                await transporter.sendMail({
                    from: `"Meeting Scheduler" <${process.env.GMAIL_USER}>`,
                    to: email,
                    subject: subject,
                    html: html,
                });
                results.push({ email, sent: true });
            } catch (err) {
                console.error(`Failed to send to ${email}:`, err);
                results.push({ email, sent: false, error: err.message });
            }
        }

        // If confirmation type and we have a meeting date/time, schedule reminders
        if (type === 'confirmation' && meetingDate && meetingTime && eventId) {
            try {
                await scheduleReminders({
                    emails,
                    eventName,
                    duration,
                    locationUrl,
                    locationType,
                    meetingDate,
                    meetingDateISO,
                    meetingTime,
                    organizerEmail,
                    organizerName,
                    eventId,
                });
            } catch (err) {
                console.error('Failed to schedule reminders:', err);
            }
        }

        return NextResponse.json({
            success: true,
            results,
            message: `Sent ${results.filter(r => r.sent).length}/${emails.length} emails`
        });

    } catch (error) {
        console.error('Email API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Schedule reminder emails in Firestore
async function scheduleReminders({ emails, eventName, duration, locationUrl, locationType, meetingDate, meetingDateISO, meetingTime, organizerEmail, organizerName, eventId }) {
    // Parse the meeting datetime using the ISO date
    let meetingDateTime;

    if (meetingDateISO) {
        // Use the reliable ISO date
        meetingDateTime = new Date(meetingDateISO);
    } else {
        // Fallback: strip ordinal suffixes (1st, 2nd, 3rd, 4th, etc.) from formatted date
        const cleanDate = meetingDate.replace(/(\d+)(st|nd|rd|th)/, '$1');
        meetingDateTime = new Date(cleanDate);
    }

    if (isNaN(meetingDateTime.getTime())) {
        console.error('Could not parse meeting date:', meetingDate, meetingDateISO);
        return;
    }

    // Parse time like "10:00 AM" and set it on the date
    const timeMatch = meetingTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        meetingDateTime.setHours(hours, minutes, 0, 0);
    }

    // Calculate reminder times
    const oneDayBefore = new Date(meetingDateTime.getTime() - 24 * 60 * 60 * 1000);
    const oneHourBefore = new Date(meetingDateTime.getTime() - 60 * 60 * 1000);

    const emailData = {
        emails,
        eventName,
        duration,
        locationUrl,
        locationType,
        meetingDate,
        meetingTime,
        organizerEmail,
        organizerName,
        eventId,
    };

    // Store 1-day-before reminder
    if (oneDayBefore > new Date()) {
        const id1 = `${eventId}_1day`;
        await setDoc(doc(db, 'ScheduledEmails', id1), {
            ...emailData,
            type: 'reminder_1day',
            sendAt: oneDayBefore.toISOString(),
            sent: false,
            createdAt: new Date().toISOString(),
        });
    }

    // Store 1-hour-before reminder
    if (oneHourBefore > new Date()) {
        const id2 = `${eventId}_1hour`;
        await setDoc(doc(db, 'ScheduledEmails', id2), {
            ...emailData,
            type: 'reminder_1hour',
            sendAt: oneHourBefore.toISOString(),
            sent: false,
            createdAt: new Date().toISOString(),
        });
    }
}
