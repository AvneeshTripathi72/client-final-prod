"use client";

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mic2, Music, Headphones, Smile, Megaphone, Sparkles, Wand2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'
import { ARTIST_CATEGORIES } from '@/app/constants'

const ModernGradients = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF2A8" />
        <stop offset="50%" stopColor="#FFE032" />
        <stop offset="100%" stopColor="#FF9D00" />
      </linearGradient>
      <linearGradient id="icon-grad-alt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFB3B3" />
        <stop offset="50%" stopColor="#FF4D4D" />
        <stop offset="100%" stopColor="#990000" />
      </linearGradient>
    </defs>
  </svg>
)

const getCategoryIcon = (label) => {
  const props = { size: 72, strokeWidth: 1.5, stroke: "url(#icon-grad)", style: { filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.6))' } }
  switch(label) {
    case 'Singers': return <Mic2 {...props} />;
    case 'Live Bands': return <Music {...props} />;
    case 'DJs': return <Headphones {...props} />;
    case 'Comedians': return <Smile {...props} />;
    case 'Anchors': return <Megaphone {...props} />;
    case 'Dancers': return <Sparkles {...props} />;
    case 'Magicians': return <Wand2 {...props} />;
    default: return <Sparkles {...props} />;
  }
}

function CategoriesSection() {
  const [catPage, setCatPage] = useState(0)
  const [catPerPage, setCatPerPage] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCatPerPage(1)
      } else {
        setCatPerPage(4)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalCatPages = Math.ceil(ARTIST_CATEGORIES.length / catPerPage)
  const moveCat = (dir) => setCatPage(p => (p + dir + totalCatPages) % totalCatPages)

  return (
    <FadeSection className="hp-shell hp-block">
      <ModernGradients />
      <div className="hp-cat-section">
        <div className="hp-cat-header">
          <h2 className="hp-cat-title">Artist Categories</h2>
          <p className="hp-cat-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
            Choose from our handpicked, premium categories of certified top talent.
          </p>
          <Link href="/artists" className="hp-cat-all-btn">
            View All Artists →
          </Link>
        </div>

        <div className="hp-cat-carousel-wrap">
          <button className="lux-arrow-btn is-left" onClick={() => moveCat(-1)} aria-label="Previous categories">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <div className="hp-cat-carousel">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={catPage}
                className="hp-cat-grid"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(event, info) => {
                  const swipeThreshold = 30;
                  if (info.offset.x < -swipeThreshold) {
                    moveCat(1);
                  } else if (info.offset.x > swipeThreshold) {
                    moveCat(-1);
                  }
                }}
                style={{ touchAction: 'pan-y' }}
              >
                {ARTIST_CATEGORIES.slice(catPage * catPerPage, catPage * catPerPage + catPerPage).map((cat, i) => (
                  <Link key={cat.label} href={`/artists?category=${cat.query}`} className="hp-cat-card-v2">
                    <div className="hp-cat-avatar-ring">
                      <div className="hp-cat-img-wrapper" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: 'linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(10,10,10,0.95) 100%)',
                        boxShadow: 'inset 0 2px 10px rgba(255,224,50,0.15), inset 0 -4px 15px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255, 224, 50, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-30%', left: '-30%',
                          width: '160%', height: '160%',
                          background: 'radial-gradient(circle at 30% 30%, rgba(255, 224, 50, 0.15) 0%, transparent 60%)',
                          zIndex: 0
                        }} />
                        <div style={{ zIndex: 1 }}>
                          {getCategoryIcon(cat.label)}
                        </div>
                      </div>
                      <div className="hp-cat-note-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                      </div>
                    </div>
                    <div className="hp-cat-info">
                      <span className="hp-cat-label-v2">{cat.label.toUpperCase()}</span>
                      <span className="hp-cat-sub-label">{cat.startingPrice || 'Top Talent'}</span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="lux-arrow-btn" onClick={() => moveCat(1)} aria-label="Next categories">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div className="hp-cat-dots">
          {Array.from({ length: totalCatPages }).map((_, i) => (
            <button
              key={i}
              className={`hp-cat-dot ${catPage === i ? 'is-active' : ''}`}
              onClick={() => setCatPage(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </FadeSection>
  )
}

export default React.memo(CategoriesSection);


