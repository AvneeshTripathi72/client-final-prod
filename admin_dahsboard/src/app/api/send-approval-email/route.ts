import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize resend ONLY if API key exists to prevent crashing if user hasn't set it yet.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { title, description, submittedBy, approvalLink } = await req.json();

    if (!resend) {
      console.warn("MOCK EMAIL SENT: No RESEND_API_KEY found in .env.local");
      console.log(`To: Super Admin\nTitle: ${title}\nDesc: ${description}\nLink: ${approvalLink}`);
      return NextResponse.json({ success: true, mock: true });
    }

    const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!superAdminEmail) {
      return NextResponse.json({ error: "No super admin email configured." }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Admin System <onboarding@resend.dev>', // You should verify a domain in Resend for production
      to: [superAdminEmail],
      subject: `New Approval Request: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Action Required: New Admin Approval</h2>
          <p><strong>${submittedBy}</strong> has submitted a new request that requires your approval.</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${title}</p>
            <p style="margin: 0;"><strong>Description:</strong> ${description}</p>
          </div>
          <a href="${approvalLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">Review & Approve</a>
          <p style="color: #64748b; font-size: 12px; margin-top: 32px;">This is an automated notification from Magnevents Admin Portal.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
