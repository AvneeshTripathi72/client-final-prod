"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import '@/app/styles/components/PWAInstallPrompt.css';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detect if the app is already running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return;
    }

    // 2. Check if the user dismissed it previously
    const isDismissed = localStorage.getItem('magnevents-pwa-dismissed');
    if (isDismissed === 'true') {
      return;
    }

    // 3. Detect iOS platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isAppleDevice) {
      setIsIOS(true);
    }

    // 4. Capture native beforeinstallprompt event reactively
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    // 5. Automatically display the install invitation card 2.5 seconds after page entry
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // Direct native browser prompt trigger
    const promptEvent = deferredPrompt || window.deferredPrompt;

    if (promptEvent) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          localStorage.setItem('magnevents-pwa-dismissed', 'true');
          setDeferredPrompt(null);
          window.deferredPrompt = null;
          setShowPrompt(false);
        }
      } catch (err) {
        console.error("Error triggering native install prompt:", err);
        setShowAndroidGuide(true);
      }
    } else {
      // Direct simple guidance fallback if the browser blocks direct installation triggers
      setShowAndroidGuide(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('magnevents-pwa-dismissed', 'true');
    setShowPrompt(false);
  };

  return (
    <>
      <AnimatePresence>
        {showPrompt && !showIOSGuide && !showAndroidGuide && (
          <motion.div 
            className="pwa-floating-card"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            <div className="pwa-card-glow" />
            <div className="pwa-card-content">
              <div className="pwa-app-logo" style={{ overflow: 'hidden', position: 'relative' }}>
                <Image 
                  src="/assets/magnevents-logo.jpg" 
                  alt="Magnevents Logo" 
                  fill
                  sizes="48px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="pwa-text-block">
                <h4>Install Magnevents App</h4>
                <p>Book live artists instantly. Enjoy faster load times and native app experiences.</p>
              </div>
            </div>
            
            <div className="pwa-action-buttons">
              <button className="pwa-btn-dismiss" onClick={handleDismiss}>
                Maybe Later
              </button>
              <button className="pwa-btn-install" onClick={handleInstallClick}>
                Install App
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Step-by-Step Interactive Guide */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div 
            className="pwa-ios-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div 
              className="pwa-ios-modal-card"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ios-modal-indicator" />
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
                  <Image 
                    src="/assets/magnevents-logo.jpg" 
                    alt="Magnevents Logo" 
                    fill
                    sizes="64px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: '20px', fontWeight: '700' }}>Install Magnevents</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '13.5px', textAlign: 'center' }}>
                  Add to your home screen in 3 quick steps:
                </p>
              </div>

              <div className="ios-steps-list">
                <div className="ios-step-row">
                  <span className="ios-step-badge">1</span>
                  <p>Tap the **Share** button <code>📤</code> at the bottom of Safari.</p>
                </div>
                <div className="ios-step-row">
                  <span className="ios-step-badge">2</span>
                  <p>Scroll down the list and tap **"Add to Home Screen"** <code>➕</code>.</p>
                </div>
                <div className="ios-step-row">
                  <span className="ios-step-badge">3</span>
                  <p>Tap **"Add"** in the top right corner!</p>
                </div>
              </div>

              <button className="ios-modal-btn-close" onClick={() => { setShowIOSGuide(false); setShowPrompt(false); localStorage.setItem('magnevents-pwa-dismissed', 'true'); }}>
                Got It, Thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Android/Desktop Step-by-Step Interactive Guide */}
      <AnimatePresence>
        {showAndroidGuide && (
          <motion.div 
            className="pwa-ios-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAndroidGuide(false)}
          >
            <motion.div 
              className="pwa-ios-modal-card"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ios-modal-indicator" />
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
                  <Image 
                    src="/assets/magnevents-logo.jpg" 
                    alt="Magnevents Logo" 
                    fill
                    sizes="64px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: '20px', fontWeight: '700' }}>Install Magnevents</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '13.5px', textAlign: 'center' }}>
                  Install standard application in 3 quick steps:
                </p>
              </div>

              <div className="ios-steps-list">
                <div className="ios-step-row">
                  <span className="ios-step-badge">1</span>
                  <p>Tap the browser menu button <code>⋮</code> (top-right of Chrome) or click the **install icon** <code>⊕</code> in the address bar.</p>
                </div>
                <div className="ios-step-row">
                  <span className="ios-step-badge">2</span>
                  <p>Select **"Install App"** or **"Add to Home Screen"** from the list.</p>
                </div>
                <div className="ios-step-row">
                  <span className="ios-step-badge">3</span>
                  <p>Tap **"Install"** to confirm!</p>
                </div>
              </div>

              <button className="ios-modal-btn-close" onClick={() => { setShowAndroidGuide(false); setShowPrompt(false); localStorage.setItem('magnevents-pwa-dismissed', 'true'); }}>
                Got It, Thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
