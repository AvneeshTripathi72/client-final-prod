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

  useEffect(() => {
    // Safety check for server rendering environment
    if (typeof window === 'undefined') return;

    // 1. Detect if the app is already running in standalone/installed mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return;
    }

    // 2. Check if the user has previously dismissed or accepted the install prompt
    const isDismissed = localStorage.getItem('magnevents-pwa-dismissed');
    if (isDismissed === 'true') {
      return;
    }

    // 3. Identify iOS users specifically
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);

    if (isAppleDevice) {
      setIsIOS(true);
      // Wait 3 seconds to show the premium iOS install hint elegantly on load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // 4. For Android/Desktop: Listen for native beforeinstallprompt
    const handleInstallable = () => {
      setShowPrompt(true);
    };

    // If deferredPrompt is already populated globally
    if (window.deferredPrompt) {
      setShowPrompt(true);
    } else {
      // Automatic fallback: show the banner anyway after 4 seconds to encourage first-time visitors!
      const fallbackTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
      
      window.addEventListener('pwa-installable', handleInstallable);
      return () => {
        clearTimeout(fallbackTimer);
        window.removeEventListener('pwa-installable', handleInstallable);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    const promptEvent = window.deferredPrompt;
    if (!promptEvent) {
      // If the browser hasn't fired the native event yet, show our premium instructions popup!
      setShowAndroidGuide(true);
      return;
    }

    try {
      // Show native installer popup
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('magnevents-pwa-dismissed', 'true');
        window.deferredPrompt = null;
        setShowPrompt(false);
      }
    } catch (err) {
      console.warn("PWA Prompt error, showing manual fallback guide:", err);
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
                <p>Enjoy offline bookings, rapid touch load times, and premium full-screen interface.</p>
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
              <div className="ios-modal-header">
                <h3>📲 Install App on iPhone</h3>
                <p>Run Magnevents as a native full-screen app in 3 quick steps:</p>
              </div>

              <div className="ios-steps-list">
                <div className="ios-step-row">
                  <span className="ios-step-badge">1</span>
                  <p>Tap the **Share** icon <code>📤</code> at the bottom of Safari.</p>
                </div>
                <div className="ios-step-row">
                  <span className="ios-step-badge">2</span>
                  <p>Scroll down the share list and select **"Add to Home Screen"** <code>➕</code>.</p>
                </div>
                <div className="ios-step-row">
                  <span className="ios-step-badge">3</span>
                  <p>Tap **"Add"** in the top right corner of your screen!</p>
                </div>
              </div>

              <button className="ios-modal-btn-close" onClick={() => { setShowIOSGuide(false); setShowPrompt(false); localStorage.setItem('magnevents-pwa-dismissed', 'true'); }}>
                Got It, Thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Android/Desktop Manual Installation Guide */}
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
              <div className="ios-modal-header">
                <h3>💻 Quick Install Guide</h3>
                <p>Add Magnevents to your home screen instantly:</p>
              </div>

              <div className="ios-steps-list">
                <div className="ios-step-row">
                  <span className="ios-step-badge">1</span>
                  <p>Tap the browser menu icon <code>⋮</code> or look at the address bar.</p>
                </div>
                <div className="ios-step-row">
                  <span className="ios-step-badge">2</span>
                  <p>Select **"Install app"** or **"Add to Home screen"**.</p>
                </div>
                <div className="ios-step-row">
                  <span className="ios-step-badge">3</span>
                  <p>Launch the standalone application from your home screen!</p>
                </div>
              </div>

              <button className="ios-modal-btn-close" onClick={() => { setShowAndroidGuide(false); setShowPrompt(false); localStorage.setItem('magnevents-pwa-dismissed', 'true'); }}>
                Got It, Let's Do It!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
