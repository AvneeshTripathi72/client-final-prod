"use client";

import { useState, useEffect, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import TiltCard from '@/app/components/common/TiltCard'
import Stars from '@/app/components/common/Stars'
import '@/app/styles/pages/HomePage.css'

const ArtistCard = forwardRef(({ artist, onBook }, ref) => {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [bookings, setBookings] = useState(0)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    
    if (artist.successful_bookings && artist.successful_bookings > 0) {
      setBookings(artist.successful_bookings)
    } else {
      // random between 10 and 250
      setBookings(Math.floor(Math.random() * 241) + 10)
    }
    
    return () => window.removeEventListener('resize', handleResize)
  }, [artist.successful_bookings])

  let genres = []
  if (Array.isArray(artist.sub_categories)) {
    genres = artist.sub_categories.filter(Boolean)
  } else if (typeof artist.sub_category === 'string') {
    genres = artist.sub_category.split(',').map(g => g.trim()).filter(Boolean)
  }
  if (genres.length === 0) {
    const rawGenre = artist.subCategory || artist.category || 'Performer'
    genres = rawGenre.split(',').map(g => g.trim()).filter(Boolean)
  }

  let languages = []
  if (Array.isArray(artist.languages)) {
    languages = artist.languages.filter(Boolean)
  } else if (typeof artist.performing_language === 'string') {
    languages = artist.performing_language.split(',').map(l => l.trim()).filter(Boolean)
  }

  const location = [artist.city, artist.state].filter(Boolean).join(', ') || 'Jaipur'
  const rating = artist.rating || '4.9'
  
  const imgSrc = (!artist.img || imageError) 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name || 'A')}&background=1A1A1A&color=FFE032&size=400&font-size=0.33&bold=true`
    : artist.img

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', width: '100%', height: '100%' }}
    >
      <Link href={`/artist/${encodeURIComponent(artist.name)}`} target={isMobile ? '_self' : '_blank'} style={{ textDecoration: 'none', display: 'flex', width: '100%', height: '100%' }}>
        <TiltCard 
          className="modern-artist-card"
        >
        <div className="modern-img-wrap relative">
          <Image
            src={imgSrc}
            alt={artist.name}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            style={{ objectFit: 'cover' }}
            unoptimized
            onError={() => setImageError(true)}
          />
          <div className="modern-overlay-gradient"></div>
        </div>
        <div className="modern-info-overlay">
          <div className="modern-badges-container" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
            {genres.length > 0 && (
              <div className="modern-genres-wrapper" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {genres.slice(0, 2).map((g, idx) => (
                  <span key={`g-${idx}`} className="modern-genre-badge">{g}</span>
                ))}
                {genres.length > 2 && <span className="modern-genre-badge outline">+{genres.length - 2}</span>}
              </div>
            )}
            {languages.length > 0 && (
              <div className="modern-langs-wrapper" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {languages.slice(0, 2).map((l, idx) => (
                  <span key={`l-${idx}`} className="modern-genre-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#eee' }}>🗣️ {l}</span>
                ))}
                {languages.length > 2 && <span className="modern-genre-badge outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#eee' }}>+{languages.length - 2}</span>}
              </div>
            )}
          </div>
          <h3 className="modern-artist-name">{artist.name}</h3>
          <span className="modern-artist-loc">{location}</span>

          <div className="modern-artist-rating flex items-center">
            <Stars count={Math.round(Number(rating))} />
            <span className="modern-score-text">{rating}</span>
            {mounted && bookings > 0 && (
              <>
                <span className="text-white/20 mx-2 text-xs">•</span>
                <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{bookings} Bookings</span>
              </>
            )}
          </div>
        </div>
      </TiltCard>
      </Link>
    </motion.div>
  )
})

ArtistCard.displayName = 'ArtistCard';

export default ArtistCard;
