"use client";

import React from 'react';

export default function ReelsSection() {
  const videos = [
    {
      id: 1,
      src: "https://assets.mixkit.co/videos/preview/mixkit-singer-performing-on-stage-with-microphone-34374-large.mp4",
      text: ""
    },
    {
      id: 2,
      src: "https://assets.mixkit.co/videos/preview/mixkit-singer-performing-on-stage-with-microphone-34374-large.mp4",
      text: "Pov : you want that one person in your life"
    },
    {
      id: 3,
      src: "https://assets.mixkit.co/videos/preview/mixkit-singer-performing-on-stage-with-microphone-34374-large.mp4",
      text: ""
    }
  ];

  return (
    <section className="reels-section-wrapper">
      <div className="reels-container">
        <div className="reels-header">
          <button className="quick-book-btn">Quick Book</button>
          <h2 className="reels-title">Live singer for wedding</h2>
        </div>
        <div className="reels-grid">
          {videos.map((vid) => (
            <div key={vid.id} className="reel-card">
              <video 
                src={vid.src}
                controls
                className="reel-video"
                controlsList="nodownload"
                poster="/assets/lux-singer-session.webp"
              />
              {vid.text && (
                <div className="reel-overlay-text">
                  <p>{vid.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
