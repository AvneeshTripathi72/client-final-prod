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


    try {
      await transporter.sendMail(mailOptions);
      console.log("Email dispatched successfully.");
    } catch (err) {
      console.error("Email sending error:", err);
    }

    // Also save to Supabase bookings table for admin dashboard
    if (!isRegister && !isCallRequest) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
        
        let numericBudget = 0;
        if (data.budget) {
          // extract some numeric budget if possible
          if (data.budget.includes('5k_10k')) numericBudget = 10000;
          else if (data.budget.includes('10k_20k')) numericBudget = 20000;
          else if (data.budget.includes('20k_35k')) numericBudget = 35000;
          else if (data.budget.includes('35k_50k')) numericBudget = 50000;
          else if (data.budget.includes('50k_80k')) numericBudget = 80000;
          else if (data.budget.includes('80k_1.2L')) numericBudget = 120000;
          else if (data.budget.includes('1.2L_1.5L')) numericBudget = 150000;
          else if (data.budget.includes('1.5L_2L')) numericBudget = 200000;
          else if (data.budget.includes('2L_3L')) numericBudget = 300000;
          else if (data.budget.includes('3L_5L')) numericBudget = 500000;
          else if (data.budget.includes('5L_plus')) numericBudget = 500000;
          else numericBudget = 5000;
        }

        const bookingData = {
          client_name: data.name || 'Unknown',
          client_email: data.email || 'N/A',
          client_phone: data.phone || 'N/A',
          event_type: data.eventType || 'N/A',
          event_date: data.date || null,
          venue: data.location || 'TBD',
          budget: numericBudget,
          notes: data.message || (data.artistType ? `Requested Types: ${data.artistType.join(', ')}` : ''),
          status: 'pending',
          booking_source: 'client',
        };

        if (data.selectedArtist && data.selectedArtist.id) {
          bookingData.fk_artist_id = data.selectedArtist.id;
        }

        const { error } = await supabase.from('bookings').insert([bookingData]);
        if (error) console.error("Supabase insert error:", error);
        else console.log("Successfully saved booking to Supabase");
      } catch (dbErr) {
        console.error("Failed to connect to Supabase:", dbErr);
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Request processed successfully!' }), {
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
