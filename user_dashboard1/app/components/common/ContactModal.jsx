"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingService } from '@/app/services/bookingService'
import '@/app/styles/components/ContactModal.css'

export default function ContactModal({ isOpen, onClose, initialType = 'booking', initialArtist = null }) {
  const [formType, setFormType] = useState(initialType) // 'booking' | 'contact' | 'register'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    date: '',
    location: '',
    artistType: [],
    budget: '',
    budget: '',
    message: '',
    selectedArtist: initialArtist
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Sync with initial props when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormType(initialType)
      setSubmitted(false)
      setFormData(prev => ({ ...prev, selectedArtist: initialArtist }))
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialType, initialArtist])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await bookingService.submitRequest({ ...formData, formType })
      setIsSubmitting(false)
      setSubmitted(true)
      
      // Auto close after success
      setTimeout(() => {
        onClose()
        setFormData({ 
          name: '', email: '', phone: '', eventType: '', 
          date: '', location: '', artistType: [], budget: '', message: '', selectedArtist: null
        })
      }, 2500)
    } catch (error) {
      console.error("Booking error:", error)
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="lux-modal-root">
        <motion.div 
          className="lux-modal-backdrop" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        <motion.div 
          className={`lux-modal-content ${formType}`}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
        >
          <div className="modal-glow-bg" />
          
          <button className="lux-modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          <div className="lux-modal-header">
            <div className="header-badge">
              {formType === 'register' ? 'JOIN OUR ROSTER' : 'DIRECT SUPPORT'}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '32px' }}>
              {formType === 'register' ? 'Artist Registration' : 'Booking form'}
            </h3>
            {formData.selectedArtist ? (
              <div style={{ marginTop: '12px', padding: '10px 16px', background: 'rgba(255,224,50,0.1)', border: '1px solid rgba(255,224,50,0.2)', borderRadius: '8px', display: 'inline-block' }}>
                <span style={{ color: '#FFE032', fontSize: '14px', fontWeight: '500' }}>
                  Booking Inquiry for: {typeof formData.selectedArtist === 'string' ? formData.selectedArtist : formData.selectedArtist?.name || 'Artist'}
                </span>
              </div>
            ) : (
              <p>
                {formType === 'register' ? 'Showcase your talent to the world. Join Magnevents and perform at premium venues.' :
                 'Tell us your vision, and we will find the perfect stage presence for you.'}
              </p>
            )}
          </div>

          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lux-modal-success"
            >
              <div className="lux-success-ring">
                 <div className="lux-success-check">✓</div>
              </div>
              <h4>Submission Received!</h4>
              <p>Your details have been securely sent. A booking concierge will reach out to you within 24 hours.</p>
            </motion.div>
          ) : (
            <form className="lux-modal-form" onSubmit={handleSubmit}>
              <div className="lux-form-row">
                <div className="lux-form-group">
                  <label>Name</label>
                  <input 
                    type="text" required placeholder="e.g. Arjun Sharma"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="lux-form-group">
                  <label>Phone no.</label>
                  <input 
                    type="tel" required placeholder="+91 9XXX-XXXXXX"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="lux-form-row">
                <div className="lux-form-group">
                  <label>Email ID</label>
                  <input 
                    type="email" required placeholder="name@email.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="lux-form-group">
                  <label>Event Type</label>
                  <input 
                    type="text" required placeholder="Wedding, Sangeet, Corporate..."
                    value={formData.eventType}
                    onChange={e => setFormData({...formData, eventType: e.target.value})}
                  />
                </div>
              </div>

              <div className="lux-form-row">
                <div className="lux-form-group">
                  <label>Event Date</label>
                  <input 
                    type="date" required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="lux-form-group">
                  <label>Location</label>
                  <input 
                    type="text" required placeholder="Delhi, Mumbai, Lucknow..."
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="lux-form-row">
                <div className="lux-form-group full-width">
                  <label>Artist Type (Multiple allowed)</label>
                  <div className="artist-type-grid">
                    {['Singer', 'Music Band', 'DJ', 'Musician', 'Comedian', 'Anchor', 'Dancer', 'Magician'].map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`artist-chip ${formData.artistType.includes(type) ? 'active' : ''}`}
                        onClick={() => {
                          const newTypes = formData.artistType.includes(type)
                            ? formData.artistType.filter(t => t !== type)
                            : [...formData.artistType, type];
                          setFormData({...formData, artistType: newTypes});
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lux-form-group">
                  <label>Budget range</label>
                  <select 
                    required
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                  >
                    <option value="" disabled>Select Budget</option>
                    <option value="below_5k">below 5000</option>
                    <option value="5k_10k">5000-10000</option>
                    <option value="10k_20k">10000-20000</option>
                    <option value="20k_35k">20000-35000</option>
                    <option value="35k_50k">35000-50000</option>
                    <option value="50k_80k">50000-80000</option>
                    <option value="80k_1.2L">80000-1.2L</option>
                    <option value="1.2L_1.5L">1.2L-1.5L</option>
                    <option value="1.5L_2L">1.5L-2L</option>
                    <option value="2L_3L">2L-3L</option>
                    <option value="3L_5L">3L-5L</option>
                    <option value="5L_plus">5L+</option>
                  </select>
                </div>
              </div>

              <div className="lux-modal-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button type="submit" className="btn-submit-premium" disabled={isSubmitting}>
                  <span className="btn-text">
                    {isSubmitting ? 'Processing...' : (
                      formType === 'register' ? 'Register as Artist' : 'Request Booking'
                    )}
                  </span>
                  <div className="btn-glow" />
                </button>

                <a 
                  href={`https://wa.me/918076515257?text=Hi%20Magnevents,%20I'm%20interested%20in%20booking%20an%20artist!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-premium"
                >
                  <span className="whatsapp-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.437 0 9.857-4.403 9.86-9.809.001-2.618-1.01-5.08-2.858-6.93C16.528 2.015 14.07 1.006 11.453 1.006c-5.434 0-9.852 4.403-9.855 9.81-.001 2.062.54 4.079 1.566 5.86l-.99 3.613 3.712-.977zm11.304-6.816c-.302-.15-1.788-.882-2.066-.983-.277-.101-.478-.15-.678.15-.2.3-.775.983-.95 1.185-.175.201-.35.227-.652.076-.302-.15-1.274-.469-2.427-1.498-.897-.8-1.502-1.788-1.678-2.09-.175-.302-.019-.465.132-.615.136-.135.302-.35.454-.526.15-.176.2-.302.302-.503.101-.2.05-.376-.026-.526-.075-.15-.678-1.636-.93-2.243-.244-.59-.493-.51-.678-.518-.176-.008-.377-.01-.578-.01-.2 0-.527.075-.803.376-.277.301-1.055 1.031-1.055 2.516 0 1.485 1.079 2.921 1.229 3.122.15.2 2.125 3.245 5.148 4.549.719.311 1.28.497 1.717.637.722.23 1.38.197 1.901.12.58-.087 1.788-.73 2.04-1.435.252-.703.252-1.306.176-1.435-.076-.13-.277-.201-.578-.352z"/>
                    </svg>
                  </span>
                  <span className="btn-text">Or Chat on WhatsApp</span>
                </a>
              </div>


            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
