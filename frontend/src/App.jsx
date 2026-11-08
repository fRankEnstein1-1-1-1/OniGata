import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import homieVideo from './assets/homie.mp4';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ProfileSetup from './pages/ProfileSetup';
import PhotoUpload from './pages/PhotoUpload';
import Settings from './pages/Settings';
import Checkin from './pages/Checkin';
import './App.css';

function Homie() {
  const iframeRef = useRef(null);

  // Automatically ensure soundtrack is playing and unlocked on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage('unmute', '*');
      } catch (err) {
        // Cross-window messaging safe-guard
      }
    };

    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  return (
    <div className="homie-root">
      <style>{`
        /* Viewport Reset & Fullpage Isolation */
        .homie-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          overflow-y: auto;
          background-color: #060608;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #f5f5f7;
          z-index: 999;
          user-select: none;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
        }

        /* Fullscreen Cinematic Iframe Stage - 100vw x 100vh Fixed True Background */
        .homie-bg-stage {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          z-index: 1;
          pointer-events: none !important;
          user-select: none;
          margin: 0;
          padding: 0;
          border: none;
        }

        .homie-bg-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          border: 0 none;
          outline: none;
          padding: 0;
          margin: 0;
          scrolling: no;
          overflow: hidden;
          background: #060608;
          pointer-events: none !important;
          user-select: none;
        }

        /* Cinematic Atmospheric Grading Overlays */
        .homie-vignette {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(6, 6, 9, 0.25) 0%,
            rgba(6, 6, 9, 0.6) 65%,
            rgba(3, 3, 5, 0.94) 100%
          );
        }

        .homie-cinematic-tint {
          position: fixed;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(5, 5, 8, 0.8) 0%,
            rgba(5, 5, 8, 0.15) 25%,
            rgba(5, 5, 8, 0.15) 70%,
            rgba(4, 4, 6, 0.9) 100%
          );
        }

        /* Click Interceptor Shield: Absorbs all background clicks so user cannot touch the video */
        .homie-click-shield {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 5;
          pointer-events: auto;
          cursor: default;
        }

        /* Foreground UI Layer */
        .homie-ui-layer {
          position: relative;
          z-index: 10;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 44px;
          box-sizing: border-box;
          pointer-events: none;
        }

        /* Top Bar */
        .homie-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          pointer-events: auto;
          gap: 16px;
        }

        .homie-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .homie-brand-kanji {
          font-size: 19px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #ffffff;
          opacity: 0.95;
          text-shadow: 0 0 12px rgba(220, 38, 38, 0.45);
        }

        .homie-brand-sep {
          width: 1px;
          height: 16px;
          background: rgba(220, 38, 38, 0.35);
        }

        .homie-brand-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.32em;
          color: rgba(255, 255, 255, 0.85);
          text-transform: uppercase;
        }

        /* Center Content Area */
        .homie-center-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          flex: 1;
          pointer-events: none;
          margin: 20px 0;
        }

        /* Animated Crimson Border Stream */
        @keyframes crimsonBorderRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Card Outer Frame with Tight, Contained Crimson Border (No Outer Spreading Aura) */
        .homie-card-frame {
          position: relative;
          width: 100%;
          max-width: 540px;
          border-radius: 22px;
          padding: 1.5px;
          overflow: hidden;
          box-shadow:
            0 0 14px rgba(220, 38, 38, 0.32),
            0 32px 85px -18px rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        /* Subtle, Elegant Deep Crimson Stream Running along Border */
        .homie-crimson-border-stream {
          position: absolute;
          top: -120%;
          left: -60%;
          width: 220%;
          height: 340%;
          background: conic-gradient(
            from 0deg,
            #1c0303 0deg,
            #7f1d1d 30deg,
            #dc2626 65deg,
            #ef4444 90deg,
            #f87171 110deg,
            #dc2626 130deg,
            #7f1d1d 165deg,
            #0d0202 205deg,
            #991b1b 245deg,
            #dc2626 280deg,
            #ef4444 305deg,
            #991b1b 335deg,
            #1c0303 360deg
          );
          animation: crimsonBorderRotate 8s linear infinite;
          pointer-events: none;
          will-change: transform;
        }

        /* Ceremonial Temple Plate Card (Refined & Cold Luxury) */
        .homie-glass-card {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 48px 46px;
          border-radius: 20.5px;
          background: linear-gradient(
            165deg,
            rgba(16, 17, 23, 0.86) 0%,
            rgba(9, 10, 14, 0.93) 100%
          );
          backdrop-filter: blur(32px) saturate(160%);
          -webkit-backdrop-filter: blur(32px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 0 14px 0 rgba(220, 38, 38, 0.08);
          text-align: center;
          pointer-events: auto;
          box-sizing: border-box;
          animation: cardFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Ceremonial Corner Brackets (Ritual Altar Aesthetic) */
        .homie-glass-card::before,
        .homie-glass-card::after {
          content: '';
          position: absolute;
          width: 14px;
          height: 14px;
          pointer-events: none;
          border-color: rgba(220, 38, 38, 0.5);
          border-style: solid;
        }

        .homie-glass-card::before {
          top: 10px;
          left: 10px;
          border-width: 1px 0 0 1px;
        }

        .homie-glass-card::after {
          bottom: 10px;
          right: 10px;
          border-width: 0 1px 1px 0;
        }

        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Ritual Badge: FORGED IN SHADOW (Crimson Red Theme) */
        .homie-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px;
          border-radius: 9999px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.35);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(255, 235, 235, 0.9);
          margin-bottom: 20px;
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.18);
        }

        .homie-badge-indicator {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #dc2626;
          box-shadow: 0 0 8px #ef4444;
        }

        /* Subtle Japanese “鬼” Shrine Mark (Crimson Red Theme) */
        .homie-oni-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin: 0 auto 10px auto;
        }

        .homie-oni-line {
          width: 28px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.55), transparent);
        }

        .homie-oni-kanji {
          font-size: 20px;
          font-weight: 700;
          line-height: 1;
          color: #fff1f2;
          text-shadow: 0 0 14px rgba(220, 38, 38, 0.65);
          letter-spacing: 0;
        }

        /* Main Headline: Welcome to OniGata */
        .homie-title {
          font-size: clamp(2.3rem, 4.3vw, 3.4rem);
          font-weight: 300;
          line-height: 1.15;
          margin: 0 0 14px 0;
          color: #f8fafc;
          letter-spacing: 0.01em;
          text-shadow:
            0 2px 20px rgba(0, 0, 0, 0.95),
            0 0 35px rgba(255, 255, 255, 0.15);
        }

        /* Tighter letter-spacing on OniGata with cold titanium & subtle crimson glow */
        .homie-title-bold {
          font-weight: 700;
          letter-spacing: -0.038em;
          background: linear-gradient(180deg, #ffffff 20%, #e2e8f0 65%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 18px rgba(220, 38, 38, 0.35));
        }

        /* Tagline: Exactly “Unleash your inner beast” */
        .homie-subtitle {
          font-size: 15px;
          line-height: 1.5;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(241, 245, 249, 0.82);
          max-width: 440px;
          margin: 0 auto 34px auto;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.85);
        }

        /* Button Group */
        .homie-btn-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          width: 100%;
        }

        .homie-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 48px;
          padding: 0 34px;
          border-radius: 9999px;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          cursor: pointer;
        }

        /* Primary Signup Pill: Cold Platinum with Crimson Hover Underglow */
        .homie-btn-primary {
          background: linear-gradient(135deg, #ffffff 0%, #edf0f5 100%);
          color: #07070a;
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            0 4px 18px rgba(0, 0, 0, 0.4),
            0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .homie-btn-primary:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow:
            0 8px 28px rgba(220, 38, 38, 0.38),
            0 0 16px rgba(255, 255, 255, 0.4);
        }

        .homie-btn-primary:active {
          transform: translateY(0);
        }

        /* Secondary Login Pill: Smoked Obsidian Glass with Hairline & Crimson Aura */
        .homie-btn-secondary {
          background: rgba(18, 19, 26, 0.65);
          color: #f1f5f9;
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .homie-btn-secondary:hover {
          background: rgba(220, 38, 38, 0.12);
          border-color: rgba(220, 38, 38, 0.45);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.6),
            0 0 16px rgba(220, 38, 38, 0.25);
        }

        .homie-btn-secondary:active {
          transform: translateY(0);
        }

        /* Bottom Status Bar */
        .homie-bottombar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          font-size: 11px;
          letter-spacing: 0.22em;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          pointer-events: auto;
        }

        /* Mobile Optimization & Responsiveness */
        @media (max-width: 680px) {
          .homie-ui-layer {
            padding: 24px 20px;
          }
          .homie-card-frame {
            border-radius: 19px;
            padding: 1.5px;
            max-width: 100%;
          }
          .homie-glass-card {
            padding: 34px 18px;
            border-radius: 17.5px;
            max-width: 100%;
          }
          .homie-title {
            font-size: clamp(1.85rem, 7vw, 2.4rem);
          }
          .homie-subtitle {
            font-size: 13.5px;
            letter-spacing: 0.1em;
            margin-bottom: 26px;
          }
          .homie-btn-group {
            flex-direction: column;
            gap: 12px;
          }
          .homie-btn {
            width: 100%;
            height: 46px;
          }
          .homie-bottombar {
            flex-direction: column;
            gap: 8px;
            text-align: center;
            font-size: 10px;
          }
          .homie-topbar {
            flex-wrap: wrap;
          }
        }
      `}</style>

      {/* Fullscreen Fixed Background Stage - 100vw x 100vh with Clean Seamless Video Player inside Iframe */}
      <div className="homie-bg-stage" aria-hidden="true">
        <iframe
          ref={iframeRef}
          className="homie-bg-iframe"
          title="OniGata Visual Stream"
          tabIndex="-1"
          aria-hidden="true"
          frameBorder="0"
          scrolling="no"
          allow="autoplay; encrypted-media; fullscreen"
          srcDoc={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #060608;
      pointer-events: none;
      user-select: none;
    }
    video {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100vw;
      height: 100vh;
      min-width: 100%;
      min-height: 100%;
      object-fit: cover;
      pointer-events: none;
      user-select: none;
      background: #060608;
    }
  </style>
</head>
<body>
  <video
    id="bg-video"
    autoplay
    loop
    muted
    playsinline
    webkit-playsinline
    preload="auto"
  >
    <source src="${homieVideo}" type="video/mp4">
    <source src="https://v1.pinimg.com/videos/iht/expMp4/ae/30/89/ae30893f4a73d1dba042dced467dfbc7_720w.mp4" type="video/mp4">
  </video>
  <script>
    const vid = document.getElementById('bg-video');

    // Autoplay immediately without waiting for any interaction
    const playVideo = () => {
      vid.play().then(() => {
        // Try unmuting if permitted
        vid.muted = false;
        vid.play().catch(() => {
          vid.muted = true;
          vid.play();
        });
      }).catch(() => {
        vid.muted = true;
        vid.play();
      });
    };

    playVideo();

    function unmuteSound() {
      vid.muted = false;
      vid.play().catch(() => {});
    }

    window.addEventListener('message', (event) => {
      if (event.data === 'unmute') {
        unmuteSound();
      }
    });

    ['click', 'touchstart', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unmuteSound, { once: true, passive: true });
      document.addEventListener(evt, unmuteSound, { once: true, passive: true });
    });
  </script>
</body>
</html>`}
        />
      </div>

      {/* Atmospheric Overlays for Depth, Contrast & Luxury Grading */}
      <div className="homie-vignette" />
      <div className="homie-cinematic-tint" />

      {/* Click Shield to absorb all background clicks and block all user interaction with the video */}
      <div className="homie-click-shield" aria-hidden="true" />

      {/* Foreground UI Layer */}
      <div className="homie-ui-layer">
        {/* Top Header */}
        <header className="homie-topbar">
          <div className="homie-brand">
            <span className="homie-brand-kanji">鬼形</span>
            <span className="homie-brand-sep" />
            <span className="homie-brand-label">OniGata</span>
          </div>
        </header>

        {/* Central Ceremonial Temple Plate Card with Subtle Glowing Crimson Border */}
        <main className="homie-center-stage">
          <div className="homie-card-frame">
            {/* Subtle Animated Crimson Border Stream (Contained, No Outer Spreading Aura) */}
            <div className="homie-crimson-border-stream" aria-hidden="true" />

            {/* Inner Dark Glass Temple Plate Card */}
            <div className="homie-glass-card">
                {/* Ritual Path Badge */}
                <div className="homie-card-badge">
                  <span className="homie-badge-indicator" />
                  <span>FORGED IN SHADOW</span>
                </div>

                {/* Subtle Ceremonial Kanji Mark */}
                <div className="homie-oni-mark" aria-hidden="true">
                  <span className="homie-oni-line" />
                  <span className="homie-oni-kanji">鬼</span>
                  <span className="homie-oni-line" />
                </div>

                {/* Main Title with Tighter Letter-Spacing on OniGata */}
                <h1 className="homie-title">
                  Welcome to <span className="homie-title-bold">OniGata</span>
                </h1>

                {/* Disciplined Mantra Tagline */}
                <p className="homie-subtitle">
                  Unleash your inner beast
                </p>

                {/* Cold Luxury CTA Buttons with Crimson Underglow */}
                <div className="homie-btn-group">
                  <Link to="/signup" className="homie-btn homie-btn-primary">
                    <span>Sign Up</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                  <Link to="/login" className="homie-btn homie-btn-secondary">
                    <span>Log In</span>
                  </Link>
                </div>
              </div>
            </div>
          </main>

        {/* Bottom Bar */}
        <footer className="homie-bottombar">
          <span>© 2026 OniGata Inc. All rights reserved.</span>
          <span>Tokyo // Worldwide</span>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Homie />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/photo-upload" element={<PhotoUpload />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/check-in" element={<Checkin />} />
      </Routes>
    </Router>
  );
}

export default App;
