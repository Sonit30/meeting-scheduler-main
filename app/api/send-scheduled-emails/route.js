import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig, 'cron-service') : getApps().find(a => a.name === 'cron-service') || initializeApp(firebaseConfig, 'cron-service');
const db = getFirestore(app);

function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
}

function generateReminderHTML({ eventName, organizerName, duration, locationType, locationUrl, meetingDate, meetingTime, type }) {
    const reminderText = type === 'reminder_1day' ? 'Tomorrow' : 'In 1 Hour';
    const headerBg = '#FF6B35';

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:${headerBg};padding:40px 30px;text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">⏰</div>
                <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Reminder: Your Meeting is ${reminderText}!</h1>
                <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;">Don't forget — "${eventName}" is coming up.</p>
            </div>
            <div style="padding:32px 30px;">
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
                    <h2 style="margin:0 0 20px;color:#1e293b;font-size:20px;border-bottom:2px solid ${headerBg};padding-bottom:12px;">📋 Meeting Details</h2>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;width:140px;">🏷️ Title</td><td style="padding:10px 0;color:#1e293b;font-size:15px;font-weight:600;">${eventName}</td></tr>
                        <tr><td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;">👤 Organizer</td><td style="padding:10px 0;color:#1e293b;font-size:15px;">${organizerName}</td></tr>
                        <tr><td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;">📅 Date & Time</td><td style="padding:10px 0;color:#1e293b;font-size:15px;font-weight:600;">${meetingDate} • ${meetingTime}</td></tr>
                        <tr><td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;">⏱️ Duration</td><td style="padding:10px 0;color:#1e293b;font-size:15px;">${duration} minutes</td></tr>
                        <tr><td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;">📍 Location</td><td style="padding:10px 0;color:#1e293b;font-size:15px;">${locationType} Meeting</td></tr>
                    </table>
                </div>
                ${locationUrl ? `
                <div style="text-align:center;margin:24px 0;">
                    <a href="${locationUrl}" style="display:inline-block;background:${headerBg};color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;">🔗 Join Meeting</a>
                </div>
                <p style="text-align:center;color:#94a3b8;font-size:13px;">Or copy: <a href="${locationUrl}" style="color:${headerBg};">${locationUrl}</a></p>
                ` : ''}
            </div>
            <div style="background:#f8fafc;padding:20px 30px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">Automated reminder from Meeting Scheduler.</p>
                <p style="color:#cbd5e1;font-size:11px;margin:8px 0 0;">Made with 💙 by Meeting Scheduler</p>
            </div>
        </div>
    </body>
    </html>`;
}

// GET endpoint — can be called by a cron service or manually
export async function GET(request) {
    try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            return NextResponse.json({ success: false, error: 'Gmail not configured' }, { status: 500 });
        }

        const now = new Date().toISOString();

        // Query all unsent scheduled emails
        const q = query(
            collection(db, 'ScheduledEmails'),
            where('sent', '==', false)
        );

        const snapshot = await getDocs(q);
        const transporter = createTransporter();
        let sentCount = 0;
        let skippedCount = 0;

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();

            // Check if it's time to send
            if (data.sendAt && data.sendAt <= now) {
                const html = generateReminderHTML({
                    eventName: data.eventName,
                    organizerName: data.organizerName,
                    duration: data.duration,
                    locationType: data.locationType,
                    locationUrl: data.locationUrl,
                    meetingDate: data.meetingDate,
                    meetingTime: data.meetingTime,
                    type: data.type,
                });

                const subject = data.type === 'reminder_1day'
                    ? `⏰ Reminder: ${data.eventName} is Tomorrow!`
                    : `🔔 Starting Soon: ${data.eventName} in 1 Hour!`;

                // Send to all emails
                for (const email of data.emails) {
                    try {
                        await transporter.sendMail({
                            from: `"Meeting Scheduler" <${process.env.GMAIL_USER}>`,
                            to: email,
                            subject: subject,
                            html: html,
                        });
                    } catch (err) {
                        console.error(`Failed to send reminder to ${email}:`, err);
                    }
                }

                // Mark as sent
                await updateDoc(doc(db, 'ScheduledEmails', docSnap.id), {
                    sent: true,
                    sentAt: new Date().toISOString(),
                });
                sentCount++;
            } else {
                skippedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${sentCount} reminders, ${skippedCount} not yet due.`,
            checkedAt: now,
        });

    } catch (error) {
        console.error('Cron email error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
