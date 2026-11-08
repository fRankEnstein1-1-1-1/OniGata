import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../auth/auth';
import signupVideo from '../assets/signup.mp4';   // ← your local video
import './Signup.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Force autoplay + loop + soundtrack (auto-unlocks on first user gesture if browser blocks initial sound)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startPlay = async () => {
      try {
        video.muted = false;
        await video.play();
      } catch (err) {
        // Browser blocked unmuted autoplay -> play muted, then unlock sound on first gesture
        try {
          video.muted = true;
          await video.play();
        } catch (e) { }
      }
    };

    startPlay();

    const unlockSound = () => {
      if (video) {
        video.muted = false;
        video.play().catch(() => { });
      }
    };

    window.addEventListener('click', unlockSound, { once: true, passive: true });
    window.addEventListener('touchstart', unlockSound, { once: true, passive: true });
    window.addEventListener('keydown', unlockSound, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', unlockSound);
      window.removeEventListener('touchstart', unlockSound);
      window.removeEventListener('keydown', unlockSound);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signup(name, email, password);
      navigate('/profile-setup');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-root">
      {/* Top Bar */}
      <header className="signup-topbar">
        <Link to="/" className="signup-brand">
          <span className="signup-brand-kanji">鬼形</span>
          <span className="signup-brand-sep" />
          <span className="signup-brand-label">OniGata</span>
        </Link>
      </header>

      {/* Main Split Layout */}
      <div className="signup-split">
        {/* LEFT PANEL - Form */}
        <div className="signup-left">
          <div className="signup-card-frame">
            <div className="signup-crimson-border-stream" aria-hidden="true" />

            <div className="signup-glass-card">
              <div className="signup-card-badge">
                <span className="signup-badge-indicator" />
                <span>FORGED IN SHADOW</span>
              </div>

              <div className="signup-oni-mark" aria-hidden="true">
                <span className="signup-oni-line" />
                <span className="signup-oni-kanji">鬼</span>
                <span className="signup-oni-line" />
              </div>

              <h1 className="signup-title">
                Join <span className="signup-title-bold">OniGata</span>
              </h1>

              <p className="signup-subtitle">Create your path. Unleash the beast.</p>

              <form onSubmit={handleSubmit} className="signup-form" noValidate>
                {error && (
                  <div className="signup-error" role="alert">
                    {error}
                  </div>
                )}

                <div className="signup-input-group">
                  <label htmlFor="name" className="signup-label">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="signup-input"
                    placeholder="Your name"
                    required
                    autoComplete="name"
                    disabled={isLoading}
                  />
                </div>

                <div className="signup-input-group">
                  <label htmlFor="email" className="signup-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="signup-input"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <div className="signup-input-group">
                  <label htmlFor="password" className="signup-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="signup-input"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                </div>

                <button type="submit" className="signup-btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <span className="signup-btn-loading">Forging...</span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <p className="signup-footer-text">
                Already have an account?{' '}
                <Link to="/login" className="signup-link">Log In</Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Video */}
        <div className="signup-right">
          <div className="signup-video-stage">
            <video
              ref={videoRef}
              className="signup-bg-video"
              autoPlay
              loop
              muted
              playsInline
              webkit-playsinline="true"
              preload="auto"
            >
              <source src={signupVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Soft gradient overlays */}
            <div className="signup-video-vignette" />
            <div className="signup-video-tint" />

            {/* Click shield – blocks all interaction with the video */}
            <div className="signup-click-shield" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <footer className="signup-bottombar">
        <span>© 2026 OniGata Inc. All rights reserved.</span>
        <span>Tokyo // Worldwide</span>
      </footer>
    </div>
  );
};

export default Signup;