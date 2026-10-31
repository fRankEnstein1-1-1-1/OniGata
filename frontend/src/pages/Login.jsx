import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../auth/auth';
import loginVideo from '../assets/login.mp4';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Force autoplay + loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        video.muted = true;
        await video.play();
      } catch (err) { }
    };

    tryPlay();

    const handleInteraction = () => {
      tryPlay();
    };

    window.addEventListener('click', handleInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const toggleSoundtrack = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextState = !isAudioActive;
    setIsAudioActive(nextState);
    video.muted = !nextState;

    if (nextState) {
      video.play().catch(() => { });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Top Bar */}
      <header className="login-topbar">
        <Link to="/" className="login-brand">
          <span className="login-brand-kanji">鬼形</span>
          <span className="login-brand-sep" />
          <span className="login-brand-label">OniGata</span>
        </Link>

        <button
          type="button"
          className="login-audio-pill"
          onClick={toggleSoundtrack}
          title={isAudioActive ? 'Soundtrack Active (Click to Mute)' : 'Click to Unmute Soundtrack'}
          aria-label="Toggle audio"
        >
          <div className="login-wave-bars">
            <span className="login-wave-bar" />
            <span className="login-wave-bar" />
            <span className="login-wave-bar" />
          </div>
          <span>{isAudioActive ? 'Audio Active' : 'Soundtrack On'}</span>
        </button>
      </header>

      {/* Main Split Layout */}
      <div className="login-split">
        {/* LEFT PANEL - Form */}
        <div className="login-left">
          <div className="login-card-frame">
            <div className="login-crimson-border-stream" aria-hidden="true" />

            <div className="login-glass-card">
              <div className="login-card-badge">
                <span className="login-badge-indicator" />
                <span>FORGED IN SHADOW</span>
              </div>

              <div className="login-oni-mark" aria-hidden="true">
                <span className="login-oni-line" />
                <span className="login-oni-kanji">鬼</span>
                <span className="login-oni-line" />
              </div>

              <h1 className="login-title">
                Welcome <span className="login-title-bold">Back</span>
              </h1>

              <p className="login-subtitle">Enter the path. Unleash the beast.</p>

              <form onSubmit={handleSubmit} className="login-form" noValidate>
                {error && (
                  <div className="login-error" role="alert">
                    {error}
                  </div>
                )}

                <div className="login-input-group">
                  <label htmlFor="email" className="login-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <div className="login-input-group">
                  <label htmlFor="password" className="login-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </div>

                <button type="submit" className="login-btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <span className="login-btn-loading">Entering...</span>
                  ) : (
                    <>
                      <span>Log In</span>
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

              <p className="login-footer-text">
                Don't have an account?{' '}
                <Link to="/signup" className="login-link">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Video */}
        <div className="login-right">
          <div className="login-video-stage">
            <video
              ref={videoRef}
              className="login-bg-video"
              autoPlay
              loop
              muted
              playsInline
              webkit-playsinline="true"
              preload="auto"
            >
              <source src={loginVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="login-video-vignette" />
            <div className="login-video-tint" />
            <div className="login-click-shield" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <footer className="login-bottombar">
        <span>© 2026 OniGata Inc. All rights reserved.</span>
        <span>Tokyo // Worldwide</span>
      </footer>
    </div>
  );
};

export default Login;