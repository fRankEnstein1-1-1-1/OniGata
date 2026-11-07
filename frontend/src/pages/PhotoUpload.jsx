import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadPhotos } from '../auth/photos';
import './PhotoUpload.css';

// 🎬 Loading videos – put your files in src/assets/loading/ and update these imports
import loadVid1 from '../assets/load 1.mp4';
import loadVid2 from '../assets/load2.mp4';
import loadVid3 from '../assets/load 3.mp4';
import loadVid4 from "../assets/load 4.mp4";
import loadVid5 from "../assets/load 5.mp4"

import frontIMG from "../assets/front.jpeg";
import back from "../assets/back.jpeg";
// Add more as needed:
// import loadVid4 from '../assets/loading/load4.mp4';

const LOADING_VIDEOS = [loadVid1, loadVid3, loadVid2, loadVid4, loadVid5,];
// 🔊 Sound effects – put your files in src/assets/sounds/
import selectSfx from '../assets/sounds/transition.mp3';
import submitSfx from '../assets/sounds/profile.mp3';

const MOTIVATIONAL_QUOTES = [
    'Discipline is the bridge between goals and accomplishment.',
    'The body achieves what the mind believes.',
    'No one ever drowned in sweat.',
    'Suffer the pain of discipline or the pain of regret.',
    'Your only limit is you.',
    'Champions train. Losers complain.',
    'The pain you feel today will be the strength you feel tomorrow.',
    'Excuses don’t burn calories.',
    'Be stronger than your strongest excuse.',
    'Fall in love with the process and the results will come.',
];


const PhotoUpload = () => {
    const navigate = useNavigate();
    const [front, setFront] = useState(null);
    const [side, setSide] = useState(null);
    const [frontPreview, setFrontPreview] = useState(null);
    const [sidePreview, setSidePreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDemo, setShowDemo] = useState(false);
    const [currentVidIndex, setCurrentVidIndex] = useState(0);
    const [quoteIndex, setQuoteIndex] = useState(0);

    const videoRef = useRef(null);
    const frontInputRef = useRef(null);
    const sideInputRef = useRef(null);

    // Preload SFX
    const selectAudio = useRef(null);
    const submitAudio = useRef(null);

    if (!selectAudio.current) {
        selectAudio.current = new Audio(selectSfx);
        selectAudio.current.volume = 0.55;
    }
    if (!submitAudio.current) {
        submitAudio.current = new Audio(submitSfx);
        submitAudio.current.volume = 0.7;
    }

    const playSelect = useCallback(() => {
        const a = selectAudio.current;
        if (!a) return;
        a.currentTime = 0;
        a.play().catch(() => { });
    }, []);

    const playSubmit = useCallback(() => {
        const a = submitAudio.current;
        if (!a) return;
        a.currentTime = 0;
        a.play().catch(() => { });
    }, []);

    // Random start video when loading begins
    useEffect(() => {
        if (loading && LOADING_VIDEOS.length > 0) {
            setCurrentVidIndex(Math.floor(Math.random() * LOADING_VIDEOS.length));
            setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
        }
    }, [loading]);

    // Rotate motivational quotes every 3.5s while loading
    useEffect(() => {
        if (!loading) return;
        const id = setInterval(() => {
            setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length);
        }, 3500);
        return () => clearInterval(id);
    }, [loading]);

    // When a video ends → play another random one (with sound)
    const handleVideoEnded = useCallback(() => {
        if (LOADING_VIDEOS.length <= 1) {
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.muted = false;
                videoRef.current.play().catch(() => { });
            }
            return;
        }
        let next;
        do {
            next = Math.floor(Math.random() * LOADING_VIDEOS.length);
        } while (next === currentVidIndex);
        setCurrentVidIndex(next);
    }, [currentVidIndex]);

    // Autoplay WITH SOUND when index / loading changes
    useEffect(() => {
        if (!loading || !videoRef.current) return;
        const v = videoRef.current;

        const playWithSound = async () => {
            try {
                v.muted = false;
                v.volume = 1;
                await v.play();
            } catch {
                // Browser blocked unmuted – start muted, unlock on next tap
                try {
                    v.muted = true;
                    await v.play();
                    const unlock = () => {
                        v.muted = false;
                        v.volume = 1;
                        window.removeEventListener('click', unlock);
                        window.removeEventListener('touchstart', unlock);
                    };
                    window.addEventListener('click', unlock, { once: true, passive: true });
                    window.addEventListener('touchstart', unlock, { once: true, passive: true });
                } catch {
                    // ignore
                }
            }
        };

        v.load();
        const t = setTimeout(playWithSound, 100);
        return () => clearTimeout(t);
    }, [currentVidIndex, loading]);

    const handleFile = (file, type) => {
        if (!file || !file.type.startsWith('image/')) return;
        playSelect();
        const url = URL.createObjectURL(file);
        if (type === 'front') {
            setFront(file);
            setFrontPreview(url);
        } else {
            setSide(file);
            setSidePreview(url);
        }
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!front || !side) {
            setError('Please select both a front and a side photo');
            return;
        }
        playSubmit();
        setLoading(true);
        setError('');
        try {
            await uploadPhotos(front, side);
            localStorage.setItem('lastPhotoAt', Date.now().toString());
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Photo upload failed');
            setLoading(false);
        }
    };

    // ─── LOADING SCREEN ───────────────────────────────────────
    if (loading) {
        return (
            <div
                className="pu-loading-root"
                onClick={() => {
                    // Tap anywhere to force unmute if browser blocked audio
                    const v = videoRef.current;
                    if (v) {
                        v.muted = false;
                        v.volume = 1;
                        v.play().catch(() => { });
                    }
                }}
            >
                {/* Fullscreen background video WITH sound */}
                <video
                    key={currentVidIndex}
                    ref={videoRef}
                    className="pu-loading-video"
                    src={LOADING_VIDEOS[currentVidIndex]}
                    autoPlay
                    playsInline
                    onEnded={handleVideoEnded}
                />

                <div className="pu-loading-overlay">
                    <div className="pu-loading-vignette" />

                    {/* Thick crimson glass – video visible behind */}
                    <div className="pu-loading-glass">
                        <div className="pu-loading-badge">
                            <span className="pu-loading-dot" />
                            ANALYZING
                        </div>
                        <h2 className="pu-loading-title">Forging Your Baseline</h2>
                        <p className="pu-loading-sub">
                            This can take a few minutes. Stay with us.
                        </p>
                        <p className="pu-loading-quote" key={quoteIndex}>
                            “{MOTIVATIONAL_QUOTES[quoteIndex]}”
                        </p>
                        <div className="pu-loading-bar">
                            <div className="pu-loading-bar-fill" />
                        </div>
                        <p className="pu-loading-tap">Tap for sound</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── MAIN UPLOAD UI ───────────────────────────────────────
    return (
        <div className="pu-root">
            <header className="pu-topbar">
                <Link to="/" className="pu-brand">
                    <span className="pu-brand-kanji">鬼形</span>
                    <span className="pu-brand-sep" />
                    <span className="pu-brand-label">OniGata</span>
                </Link>
                <button
                    type="button"
                    className="pu-demo-btn"
                    onClick={() => {
                        playSelect();
                        setShowDemo(true);
                    }}
                >
                    How to shoot
                </button>
            </header>

            <main className="pu-main">
                <div className="pu-card-frame">
                    <div className="pu-border-stream" aria-hidden="true" />
                    <div className="pu-glass-card">
                        <div className="pu-header">
                            <span className="pu-badge">
                                <span className="pu-badge-dot" />
                                BASELINE
                            </span>
                            <h1 className="pu-title">Upload Your Photos</h1>
                            <p className="pu-subtitle">
                                Fitted clothing · Clear lighting · Same angles every time
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="pu-form">
                            <div className="pu-upload-row">
                                {/* FRONT */}
                                <div
                                    className={`pu-upload-zone ${frontPreview ? 'has-image' : ''}`}
                                    onClick={() => {
                                        playSelect();
                                        frontInputRef.current?.click();
                                    }}
                                >
                                    <input
                                        ref={frontInputRef}
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => handleFile(e.target.files?.[0], 'front')}
                                    />
                                    {frontPreview ? (
                                        <img src={frontPreview} alt="Front preview" className="pu-preview-img" />
                                    ) : (
                                        <div className="pu-zone-placeholder">
                                            <span className="pu-zone-icon">⬆</span>
                                            <span className="pu-zone-label">Front View</span>
                                            <span className="pu-zone-hint">Tap to select</span>
                                        </div>
                                    )}
                                    {frontPreview && <span className="pu-zone-tag">Front</span>}
                                </div>

                                {/* SIDE */}
                                <div
                                    className={`pu-upload-zone ${sidePreview ? 'has-image' : ''}`}
                                    onClick={() => {
                                        playSelect();
                                        sideInputRef.current?.click();
                                    }}
                                >
                                    <input
                                        ref={sideInputRef}
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => handleFile(e.target.files?.[0], 'side')}
                                    />
                                    {sidePreview ? (
                                        <img src={sidePreview} alt="Side preview" className="pu-preview-img" />
                                    ) : (
                                        <div className="pu-zone-placeholder">
                                            <span className="pu-zone-icon">⬆</span>
                                            <span className="pu-zone-label">Side View</span>
                                            <span className="pu-zone-hint">Tap to select</span>
                                        </div>
                                    )}
                                    {sidePreview && <span className="pu-zone-tag">Side</span>}
                                </div>
                            </div>

                            {error && <div className="pu-error">{error}</div>}

                            <button
                                type="submit"
                                className="pu-btn-primary"
                                disabled={!front || !side}
                            >
                                Upload Baseline
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <footer className="pu-bottombar">
                <span>© 2026 OniGata Inc. All rights reserved.</span>
                <span>Tokyo // Worldwide</span>
            </footer>

            {/* ─── DEMO MODAL ─────────────────────────────────────── */}
            {showDemo && (
                <div
                    className="pu-demo-backdrop"
                    onClick={() => {
                        playSelect();
                        setShowDemo(false);
                    }}
                >
                    <div className="pu-demo-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="pu-demo-close"
                            onClick={() => {
                                playSelect();
                                setShowDemo(false);
                            }}
                        >
                            ×
                        </button>

                        <div className="pu-demo-header">
                            <span className="pu-badge">
                                <span className="pu-badge-dot" />
                                GUIDE
                            </span>
                            <h2 className="pu-demo-title">How to Shoot</h2>
                            <p className="pu-demo-sub">
                                Two angles. Same pose every check-in.
                            </p>
                        </div>

                        <div className="pu-demo-row">
                            <div className="pu-demo-card">
                                <div className="pu-demo-image">
                                    <div className="pu-demo-placeholder"></div>
                                    {<img src={frontIMG} alt="Front example" />}
                                </div>
                                <h3>Front View</h3>
                                <p>Face the camera straight on. Arms relaxed at sides. Full body in frame.</p>
                            </div>

                            <div className="pu-demo-card">
                                <div className="pu-demo-image">
                                    <div className="pu-demo-placeholder"></div>
                                    {<img src={back} alt="Side example" />}
                                </div>
                                <h3>Side View</h3>
                                <p>Turn 180°. Same stance. Keep posture natural and consistent.</p>
                            </div>
                        </div>

                        <ul className="pu-demo-tips">
                            <li>Light clothing ( Shirtless Recomended )</li>
                            <li>Even, direct lighting — avoid harsh shadows</li>
                            <li>Same location & distance every time</li>
                        </ul>

                        <button
                            type="button"
                            className="pu-btn-primary"
                            onClick={() => {
                                playSelect();
                                setShowDemo(false);
                            }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoUpload;