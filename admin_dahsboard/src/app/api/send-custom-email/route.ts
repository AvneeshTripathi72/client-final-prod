import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { bookingId, to, subject, message } = await req.json();

    if (!bookingId || !to || !subject || !message) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Fetch booking details for context
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*, artists(name)')
      .eq('id', bookingId)
      .single();

    // Update booking status to pending as we are starting a dialogue
    const { error: err } = await supabase
      .from('bookings')
      .update({ status: 'pending' })
      .eq('id', bookingId);

    if (err) throw err;

    // Send custom email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let contextHtml = '';
    if (booking) {
      const createdDate = new Date(booking.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      contextHtml = `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-family: sans-serif;">
          <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">On ${createdDate}, you submitted the following request:</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; font-size: 13px; color: #475569; border-left: 3px solid #cbd5e1;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;"><strong>Client Details:</strong></p>
            <p style="margin: 0 0 4px 0;"><strong>Name:</strong> ${booking.client_name || 'N/A'}</p>
            <p style="margin: 0 0 4px 0;"><strong>Email:</strong> ${booking.client_email || 'N/A'}</p>
            <p style="margin: 0 0 12px 0;"><strong>Phone:</strong> ${booking.client_phone || 'N/A'}</p>
            
            <p style="margin: 12px 0 8px 0; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #0f172a;"><strong>Request Details:</strong></p>
            <p style="margin: 0 0 4px 0;"><strong>Event Type:</strong> ${booking.event_type || 'N/A'}</p>
            ${booking.artists?.name ? `<p style="margin: 0 0 4px 0;"><strong>Requested Artist:</strong> ${booking.artists.name}</p>` : ''}
            ${booking.event_date ? `<p style="margin: 0 0 4px 0;"><strong>Event Date & Time:</strong> ${booking.event_date} ${booking.event_time ? `at ${booking.event_time}` : ''}</p>` : ''}
            ${booking.venue ? `<p style="margin: 0 0 4px 0;"><strong>Venue:</strong> ${booking.venue}</p>` : ''}
            ${booking.budget ? `<p style="margin: 0 0 4px 0;"><strong>Budget:</strong> ${booking.budget}</p>` : ''}
            ${booking.notes ? `<p style="margin: 12px 0 0 0; padding-top: 12px; border-top: 1px solid #e2e8f0;"><strong>Client Message:</strong><br/>${booking.notes}</p>` : ''}
          </div>
        </div>
      `;
    }

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p style="font-size: 16px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        <br/>
        <p style="font-size: 14px; color: #64748b;">Best regards,<br/><strong>The Magnevents Team</strong></p>
        ${contextHtml}
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Custom email error:", err);
    return new NextResponse('Failed to send email', { status: 500 });
  }
}
