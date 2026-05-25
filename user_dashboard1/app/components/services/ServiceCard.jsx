"use client"
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function ServiceCard({ service, index }) {
  return (
    <motion.article
      className="service-item-card fx-soft-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="service-media" style={{ position: 'relative', overflow: 'hidden' }}>
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
          loading="lazy"
        />
        <div className="service-overlay" />
      </div>
      <div className="service-content">
        <h3>{service.title}</h3>
        <p>{service.desc}</p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { 
            detail: { 
              type: 'booking', 
              service: {
                title: service.title,
                desc: service.desc
              } 
            } 
          }))} 
          className="service-action-btn"
        >
          Check Availability
        </button>
      </div>
    </motion.article>
  )
}
