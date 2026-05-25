import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const data = await req.json();


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    const isRegister = data.type === 'register' || data.formType === 'register' || data.type === 'artist_registration';
    const isCallRequest = data.type === 'call_request';
    const artistName = typeof data.selectedArtist === 'object' && data.selectedArtist !== null ? data.selectedArtist.name : (data.selectedArtist || '');

    let subjectPrefix = "New Booking Inquiry";
    if (isRegister) subjectPrefix = "Artist Registration";
    else if (isCallRequest) subjectPrefix = "Call Request";

    let emailBody = '';

    if (isRegister) {
      emailBody = `
You have received a new Artist Registration from Magnevents!

========================================
👤 ARTIST DETAILS
========================================
Name:           ${data.name || 'N/A'}
Email:          ${data.email || 'N/A'}
Phone:          ${data.phone || 'N/A'}
Category:       ${data.category || 'N/A'}

========================================
🔗 PORTFOLIO & SOCIALS
========================================
Link:           ${data.portfolio || 'N/A'}

========================================
📝 BIO & EXPERIENCE
========================================
${data.bio || 'No bio provided.'}
      `;
    } else {
      let artistDetailsString = '';
      if (data.selectedArtist && typeof data.selectedArtist === 'object') {
        const a = data.selectedArtist;
        artistDetailsString = `
========================================
✨ REQUESTED ARTIST DETAILS
========================================
Artist Name:    ${a.name || 'N/A'}
Category:       ${a.subCategory || a.category || 'N/A'}
Location:       ${[a.city, a.state].filter(Boolean).join(', ') || a.location || 'N/A'}
Languages:      ${a.languages || 'N/A'}
Price Range:    ${a.priceMin && a.priceMax ? `₹${a.priceMin} - ₹${a.priceMax}` : (a.priceMin ? `Starting at ₹${a.priceMin}` : 'N/A')}
`;
      } else if (artistName) {
        artistDetailsString = `
========================================
✨ REQUESTED ARTIST DETAILS
========================================
Artist Name:    ${artistName}
`;
      }

      // Add Selected Package/Pricing Plan details block
      let planDetailsString = '';
      if (data.selectedPlan && typeof data.selectedPlan === 'object') {
        const p = data.selectedPlan;
        planDetailsString = `
========================================
📦 SELECTED PRICING PACKAGE
========================================
Package Name:   ${p.name || 'N/A'}
Starts From:    ${p.price || 'N/A'}
Tagline:        ${p.tagline || 'N/A'}
Features:       ${p.features && p.features.length > 0 ? p.features.join(', ') : 'N/A'}
`;
      }

      // Add Selected Service details block
      let serviceDetailsString = '';
      if (data.selectedService && typeof data.selectedService === 'object') {
        const s = data.selectedService;
        serviceDetailsString = `
========================================
🛠️ SELECTED SERVICE DETAILS
========================================
Service Title:  ${s.title || 'N/A'}
Description:    ${s.desc || 'N/A'}
`;
      }

      emailBody = `
You have received a new inquiry from Magnevents!

========================================
👤 USER & CONTACT DETAILS
========================================
Name:           ${data.name || 'N/A'}
Email:          ${data.email || 'N/A'}
Phone:          ${data.phone || 'N/A'}

========================================
📅 EVENT DETAILS
========================================
Event Type:     ${data.eventType || 'N/A'}
Event Date:     ${data.date || 'N/A'}
Location:       ${data.location || 'N/A'}
Requested Type: ${data.artistType && data.artistType.length > 0 ? data.artistType.join(', ') : 'N/A'}
Budget:         ${data.budget || 'N/A'}

========================================
📝 ADDITIONAL MESSAGE
========================================
${data.message || 'No additional message provided.'}
${artistDetailsString}${planDetailsString}${serviceDetailsString}
      `;
    }


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `${subjectPrefix} - ${data.name}`,
      text: emailBody,
    };


    transporter.sendMail(mailOptions).then(() => {
      console.log("Email dispatched successfully in background.");
    }).catch(err => {
      console.error("Background email sending error:", err);
    });

    return new Response(JSON.stringify({ success: true, message: 'Email request received!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
