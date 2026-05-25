"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submissionData = {
      name: nameRef.current?.value || '',
      email: emailRef.current?.value || '',
      phone: phoneRef.current?.value || ''
    };
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...submissionData, type: 'call_request' }),
      });
      if (response.ok) {
        setSubmitted(true);
        if (nameRef.current) nameRef.current.value = '';
        if (emailRef.current) emailRef.current.value = '';
        if (phoneRef.current) phoneRef.current.value = '';
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Failed to send contact inquiry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FadeSection className="hp-shell hp-block hp-contact" id="contact">
      <div className="hp-section-head">
        <p className="hp-eyebrow">✉️ Quick Contact</p>
        <h2>Get in Touch</h2>
      </div>
      <div className="hp-contact-inner">
        <div className="hp-contact-info">

          <div className="hp-contact-channels">
            <a href="tel:+918076515257" className="hp-channel-card">
              <span className="hp-channel-icon">📱</span>
              <div>
                <strong>Phone</strong>
                <span>+91 8076515257</span>
              </div>
            </a>
            <a href="mailto:magneventsdotin@gmail.com" className="hp-channel-card">
              <span className="hp-channel-icon">✉️</span>
              <div>
                <strong>Email</strong>
                <span>magneventsdotin@gmail.com</span>
              </div>
            </a>
            <a href="https://wa.me/918076515257" target="_blank" rel="noreferrer" className="hp-channel-card">
              <span className="hp-channel-icon">💬</span>
              <div>
                <strong>Connect on WhatsApp</strong>
                <span>WhatsApp</span>
              </div>
            </a>
          </div>

          <div className="hp-contact-social">
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hp-social-link">YouTube</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hp-social-link">Instagram</a>
          </div>
        </div>

        <div className="hp-quote-form">
          <h3 className="hp-quote-title">Request a call</h3>
          <form className="hp-contact-form" onSubmit={handleSubmit}>
            <div className="hp-form-field">
              <label>Name *</label>
              <input 
                ref={nameRef}
                type="text" 
                placeholder="Your full name" 
                defaultValue=""
                required 
              />
            </div>
            <div className="hp-form-field">
              <label>Email *</label>
              <input 
                ref={emailRef}
                type="email" 
                placeholder="your@email.com" 
                defaultValue=""
                required 
              />
            </div>
            <div className="hp-form-field">
              <label>Phone *</label>
              <input 
                ref={phoneRef}
                type="tel" 
                placeholder="Your phone number" 
                defaultValue=""
                required 
              />
            </div>
            <motion.button
              type="submit"
              className="hp-btn hp-btn-primary hp-form-submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : (submitted ? 'Request Sent!' : 'Send Inquiry')}
            </motion.button>
          </form>
        </div>
      </div>
    </FadeSection>
  )
}
