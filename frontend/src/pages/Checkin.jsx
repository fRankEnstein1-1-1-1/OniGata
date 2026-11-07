import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { uploadPhotos } from '../auth/photos';
import './Checkin.css';

// 🎬 Loading videos
import loadVid1 from '../assets/load 1.mp4';
import loadVid2 from '../assets/load2.mp4';
import loadVid3 from '../assets/load 3.mp4';
import loadVid4 from '../assets/load 4.mp4';
import loadVid5 from '../assets/load 5.mp4';

import frontIMG from '../assets/front.jpeg';
import back from '../assets/back.jpeg';

const LOADING_VIDEOS = [loadVid1, loadVid3, loadVid2, loadVid4, loadVid5];

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

const Checkin = () => {
    const [front, setFront] = useState(null);
    const [side, setSide] = useState(null);
    const [frontPreview, setFrontPreview] = useState(null);
    const [sidePreview, setSidePreview] = useState(null);
    const [comparison, setComparison] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDemo, setShowDemo] = useState(false);
    const [currentVidIndex, setCurrentVidIndex] = useState(0);
    const [quoteIndex, setQuoteIndex] = useState(0);

    const videoRef = useRef(null);
    const frontInputRef = useRef(null);
    const sideInputRef = useRef(null);

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

    useEffect(() => {
        if (loading && LOADING_VIDEOS.length > 0) {
            setCurrentVidIndex(Math.floor(Math.random() * LOADING_VIDEOS.length));
            setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
        }
    }, [loading]);

    useEffect(() => {
        if (!loading) return;
        const id = setInterval(() => {
            setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length);
        }, 3500);
        return () => clearInterval(id);
    }, [loading]);

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

    useEffect(() => {
        if (!loading || !videoRef.current) return;
        const v = videoRef.current;
        const playWithSound = async () => {
            try {
                v.muted = false;
                v.volume = 1;
                await v.play();
            } catch {
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
            const data = await uploadPhotos(front, side);
            localStorage.setItem('lastPhotoAt', Date.now().toString());
            setComparison(data.comparison || 'Photos saved.');
        } catch (err) {
            setError(err.message || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    // ─── LOADING SCREEN ─────────────────────────────────────
    if (loading) {
        return (
            <div
                className="ck-loading-root"
                onClick={() => {
                    const v = videoRef.current;
                    if (v) {
                        v.muted = false;
                        v.volume = 1;
                        v.play().catch(() => { });
                    }
                }}
            >
                <video
                    key={currentVidIndex}
                    ref={videoRef}
                    className="ck-loading-video"
                    src={LOADING_VIDEOS[currentVidIndex]}
                    autoPlay
                    playsInline
                    onEnded={handleVideoEnded}
                />
                <div className="ck-loading-overlay">
                    <div className="ck-loading-vignette" />
                    <div className="ck-loading-glass">
                        <div className="ck-loading-badge">
                            <span className="ck-loading-dot" />
                            COMPARING
                        </div>
                        <h2 className="ck-loading-title">Reading Your Progress</h2>
                        <p className="ck-loading-sub">
                            This can take a few minutes. Stay with us.
                        </p>
                        <p className="ck-loading-quote" key={quoteIndex}>
                            “{MOTIVATIONAL_QUOTES[quoteIndex]}”
                        </p>
                        <div className="ck-loading-bar">
                            <div className="ck-loading-bar-fill" />
                        </div>
                        <p className="ck-loading-tap">Tap for sound</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── RESULT ─────────────────────────────────────────────
    if (comparison) {
        return (
            <div className="ck-root">
                <header className="ck-topbar">
                    <Link to="/home" className="ck-brand" onClick={playSelect}>
                        <span className="ck-brand-kanji">鬼形</span>
                        <span className="ck-brand-sep" />
                        <span className="ck-brand-label">OniGata</span>
                    </Link>
                    <Link to="/home" className="ck-demo-btn" onClick={playSelect}>
                        ← Home
                    </Link>
                </header>

                <main className="ck-main">
                    <div className="ck-card-frame">
                        <div className="ck-border-stream" aria-hidden="true" />
                        <div className="ck-glass-card">
                            <div className="ck-header">
                                <span className="ck-badge">
                                    <span className="ck-badge-dot" />
                                    PROGRESS
                                </span>
                                <h1 className="ck-title">Your Progress Note</h1>
                                <p className="ck-subtitle">
                                    Generate your next week from Home so this feeds into it
                                </p>
                            </div>
                            <div className="ck-comparison">
                                <p>{comparison}</p>
                            </div>
                            <Link to="/home" className="ck-btn-primary" onClick={playSelect}>
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </main>

                <footer className="ck-bottombar">
                    <span>© 2026 OniGata Inc. All rights reserved.</span>
                    <span>Tokyo // Worldwide</span>
                </footer>
            </div>
        );
    }

    // ─── UPLOAD UI ──────────────────────────────────────────
    return (
        <div className="ck-root">
            <header className="ck-topbar">
                <Link to="/home" className="ck-brand" onClick={playSelect}>
                    <span className="ck-brand-kanji">鬼形</span>
                    <span className="ck-brand-sep" />
                    <span className="ck-brand-label">OniGata</span>
                </Link>
                <button
                    type="button"
                    className="ck-demo-btn"
                    onClick={() => {
                        playSelect();
                        setShowDemo(true);
                    }}
                >
                    How to shoot
                </button>
            </header>

            <main className="ck-main">
                <div className="ck-card-frame">
                    <div className="ck-border-stream" aria-hidden="true" />
                    <div className="ck-glass-card">
                        <div className="ck-header">
                            <span className="ck-badge">
                                <span className="ck-badge-dot" />
                                CHECK-IN
                            </span>
                            <h1 className="ck-title">14-Day Check-In</h1>
                            <p className="ck-subtitle">
                                Same angles · Same clothing · Same lighting
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="ck-form">
                            <div className="ck-upload-row">
                                <div
                                    className={`ck-upload-zone ${frontPreview ? 'has-image' : ''}`}
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
                                        <img src={frontPreview} alt="Front" className="ck-preview-img" />
                                    ) : (
                                        <div className="ck-zone-placeholder">
                                            <span className="ck-zone-icon">⬆</span>
                                            <span className="ck-zone-label">Front View</span>
                                            <span className="ck-zone-hint">Tap to select</span>
                                        </div>
                                    )}
                                    {frontPreview && <span className="ck-zone-tag">Front</span>}
                                </div>

                                <div
                                    className={`ck-upload-zone ${sidePreview ? 'has-image' : ''}`}
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
                                        <img src={sidePreview} alt="Side" className="ck-preview-img" />
                                    ) : (
                                        <div className="ck-zone-placeholder">
                                            <span className="ck-zone-icon">⬆</span>
                                            <span className="ck-zone-label">Side View</span>
                                            <span className="ck-zone-hint">Tap to select</span>
                                        </div>
                                    )}
                                    {sidePreview && <span className="ck-zone-tag">Side</span>}
                                </div>
                            </div>

                            {error && <div className="ck-error">{error}</div>}

                            <button
                                type="submit"
                                className="ck-btn-primary"
                                disabled={!front || !side}
                            >
                                Submit Check-In
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

            <footer className="ck-bottombar">
                <span>© 2026 OniGata Inc. All rights reserved.</span>
                <span>Tokyo // Worldwide</span>
            </footer>

            {showDemo && (
                <div
                    className="ck-demo-backdrop"
                    onClick={() => {
                        playSelect();
                        setShowDemo(false);
                    }}
                >
                    <div className="ck-demo-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="ck-demo-close"
                            onClick={() => {
                                playSelect();
                                setShowDemo(false);
                            }}
                        >
                            ×
                        </button>
                        <div className="ck-demo-header">
                            <span className="ck-badge">
                                <span className="ck-badge-dot" />
                                GUIDE
                            </span>
                            <h2 className="ck-demo-title">How to Shoot</h2>
                            <p className="ck-demo-sub">Two angles. Same pose every check-in.</p>
                        </div>
                        <div className="ck-demo-row">
                            <div className="ck-demo-card">
                                <div className="ck-demo-image">
                                    <img src={frontIMG} alt="Front example" />
                                </div>
                                <h3>Front View</h3>
                                <p>Face the camera straight on. Arms relaxed at sides. Full body in frame.</p>
                            </div>
                            <div className="ck-demo-card">
                                <div className="ck-demo-image">
                                    <img src={back} alt="Side example" />
                                </div>
                                <h3>Side View</h3>
                                <p>Turn 180°. Same stance. Keep posture natural and consistent.</p>
                            </div>
                        </div>
                        <ul className="ck-demo-tips">
                            <li>Light clothing (shirtless recommended)</li>
                            <li>Even, direct lighting — avoid harsh shadows</li>
                            <li>Same location & distance every time</li>
                        </ul>
                        <button
                            type="button"
                            className="ck-btn-primary"
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

export default Checkin;
