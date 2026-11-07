import { useEffect, useRef, useState, useCallback } from 'react';
import { generatePlan, getCurrentPlan, toggleLog } from '../auth/workout';
import { Link } from 'react-router-dom';
import './Home.css';

// 🔊 Sound effects
import selectSfx from '../assets/sounds/transition.mp3';
import submitSfx from '../assets/sounds/profile.mp3';

// 🎬 Loading videos – put files in src/assets/loading/ (can reuse photo-upload vids)
import loadVid1 from '../assets/solo1.mp4';
import loadVid2 from '../assets/vegeta1.mp4';
import loadVid3 from '../assets/vegeta2.mp4';

const LOADING_VIDEOS = [loadVid1, loadVid2, loadVid3];

const MOTIVATIONAL_QUOTES = [
    'Discipline is the bridge between goals and accomplishment.',
    'The body achieves what the mind believes.',
    'Suffer the pain of discipline or the pain of regret.',
    'Your only limit is you.',
    'Champions train. Losers complain.',
    'Be stronger than your strongest excuse.',
    'Fall in love with the process and the results will come.',
];

const TEST_MODE = true;
const DAY_MS = 24 * 60 * 60 * 1000;

const getOffsets = (n) => {
    if (n <= 3) return Array.from({ length: n }, (_, i) => i * 2);
    if (n === 6) return [0, 1, 2, 3, 4, 5];
    return Array.from({ length: n }, (_, i) => i + Math.floor(i / 2));
};

const Home = () => {
    const [plan, setPlan] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedDay, setExpandedDay] = useState(null);
    const [currentVidIndex, setCurrentVidIndex] = useState(0);
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [tierUp, setTierUp] = useState(null); // { from, to } when promoted
    const started = useRef(false);
    const videoRef = useRef(null);

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

    const checkTierPromotion = (newPlan) => {
        if (!newPlan?.tier) return;
        const prev = Number(localStorage.getItem('lastKnownTier') || 0);
        const current = Number(newPlan.tier);
        if (prev > 0 && current > prev) {
            setTierUp({ from: prev, to: current });
            playSubmit();
        }
        localStorage.setItem('lastKnownTier', String(current));
    };

    const loadPlan = async () => {
        const data = await getCurrentPlan();
        if (data) {
            setPlan(data.plan);
            setLogs(data.logs);
            checkTierPromotion(data.plan);
        }
        return data;
    };

    const createNewWeek = async () => {
        playSubmit();
        setLoading(true);
        setError('');
        try {
            await generatePlan();
            localStorage.setItem('lastPlanAt', Date.now().toString());
            await loadPlan();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        (async () => {
            try {
                const data = await loadPlan();
                if (!data) {
                    await createNewWeek();
                    return;
                }
                if (!localStorage.getItem('lastPlanAt')) {
                    localStorage.setItem('lastPlanAt', Date.now().toString());
                }
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        })();
    }, []);

    // Loading video: random start
    useEffect(() => {
        if (loading && LOADING_VIDEOS.length > 0) {
            setCurrentVidIndex(Math.floor(Math.random() * LOADING_VIDEOS.length));
            setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
        }
    }, [loading]);

    // Rotate quotes while loading
    useEffect(() => {
        if (!loading) return;
        const id = setInterval(() => {
            setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length);
        }, 3500);
        return () => clearInterval(id);
    }, [loading]);

    // Video ended → next random
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

    // Play with sound
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

    const handleToggle = async (log, completed) => {
        playSelect();
        setLogs((prev) =>
            prev.map((l) => (l._id === log._id ? { ...l, completed } : l))
        );
        try {
            await toggleLog(log._id, completed);
        } catch (err) {
            setError(err.message);
        }
    };

    // ─── LOADING SCREEN ─────────────────────────────────────
    if (loading) {
        return (
            <div
                className="hm-loading-root"
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
                    className="hm-loading-video"
                    src={LOADING_VIDEOS[currentVidIndex]}
                    autoPlay
                    playsInline
                    onEnded={handleVideoEnded}
                />
                <div className="hm-loading-overlay">
                    <div className="hm-loading-vignette" />
                    <div className="hm-loading-glass">
                        <div className="hm-loading-badge">
                            <span className="hm-loading-dot" />
                            FORGING
                        </div>
                        <h2 className="hm-loading-title">Building Your Week</h2>
                        <p className="hm-loading-sub">This can take a few seconds. Stay locked in.</p>
                        <p className="hm-loading-quote" key={quoteIndex}>
                            “{MOTIVATIONAL_QUOTES[quoteIndex]}”
                        </p>
                        <div className="hm-loading-bar">
                            <div className="hm-loading-bar-fill" />
                        </div>
                        <p className="hm-loading-tap">Tap for sound</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="hm-root">
                <div className="hm-empty">
                    <p>{error || 'No plan found'}</p>
                </div>
            </div>
        );
    }

    const lastPlanAt = Number(localStorage.getItem('lastPlanAt'));
    const daysPassed = (Date.now() - lastPlanAt) / DAY_MS;
    const due = daysPassed >= 7;
    const offsets = getOffsets(plan.days.length);

    const lastPhotoAt = Number(localStorage.getItem('lastPhotoAt')) || Date.now();
    const photoDue = (Date.now() - lastPhotoAt) / DAY_MS >= 14;

    const totalLogs = logs.length;
    const completedLogs = logs.filter((l) => l.completed).length;
    const progressPct = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

    return (
        <div className="hm-root">
            {/* Tier promotion celebration */}
            {tierUp && (
                <div className="hm-tier-backdrop" onClick={() => { playSelect(); setTierUp(null); }}>
                    <div className="hm-tier-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="hm-tier-burst" aria-hidden="true" />
                        <div className="hm-tier-badge">
                            <span className="hm-tier-badge-dot" />
                            PROMOTION
                        </div>
                        <h2 className="hm-tier-title">Tier Up</h2>
                        <p className="hm-tier-range">
                            Tier {tierUp.from} <span>→</span> Tier {tierUp.to}
                        </p>
                        <p className="hm-tier-msg">
                            You’ve earned a higher path. Stronger work. Sharper focus.
                            The beast levels up with you.
                        </p>
                        <button
                            type="button"
                            className="hm-btn-primary"
                            onClick={() => {
                                playSelect();
                                setTierUp(null);
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            <header className="hm-topbar">
                <Link to="/" className="hm-brand" onClick={playSelect}>
                    <span className="hm-brand-kanji">鬼形</span>
                    <span className="hm-brand-sep" />
                    <span className="hm-brand-label">OniGata</span>
                </Link>
                <Link to="/settings" className="hm-settings-btn" onClick={playSelect}>
                    Settings
                </Link>
            </header>

            <main className="hm-main">
                {(photoDue || TEST_MODE) && (
                    <div className="hm-banner">
                        <div className="hm-banner-text">
                            <span className="hm-banner-label">
                                {photoDue ? 'Photo check-in due' : 'Photo check-in (test mode)'}
                            </span>
                            <span className="hm-banner-sub">Keep your baseline updated</span>
                        </div>
                        <Link to="/check-in" className="hm-banner-btn" onClick={playSelect}>
                            Upload
                        </Link>
                    </div>
                )}

                <div className="hm-week-card">
                    <div className="hm-week-top">
                        <div>
                            <span className="hm-badge">
                                <span className="hm-badge-dot" />
                                TIER {plan.tier}
                            </span>
                            <h1 className="hm-week-title">Week {plan.weekNumber}</h1>
                        </div>
                        <div className="hm-progress-ring">
                            <svg viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="20" className="hm-ring-bg" />
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    className="hm-ring-fill"
                                    style={{
                                        strokeDasharray: `${(progressPct / 100) * 125.6} 125.6`,
                                    }}
                                />
                            </svg>
                            <span className="hm-ring-pct">{progressPct}%</span>
                        </div>
                    </div>
                    <div className="hm-progress-bar">
                        <div className="hm-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <p className="hm-progress-label">
                        {completedLogs} / {totalLogs} exercises complete
                    </p>
                </div>

                {error && <div className="hm-error">{error}</div>}

                <div className="hm-days">
                    {plan.days.map((day, i) => {
                        const date = new Date(lastPlanAt + offsets[i] * DAY_MS);
                        const dayLogs = logs.filter((l) => l.dayNumber === day.dayNumber);
                        const dayDone = dayLogs.filter((l) => l.completed).length;
                        const dayTotal = dayLogs.length || day.exercises.length;
                        const isExpanded = expandedDay === day._id;
                        const allDone = dayTotal > 0 && dayDone === dayTotal;

                        return (
                            <div
                                key={day._id}
                                className={`hm-day-card ${allDone ? 'done' : ''} ${isExpanded ? 'open' : ''}`}
                            >
                                <button
                                    type="button"
                                    className="hm-day-header"
                                    onClick={() => {
                                        playSelect();
                                        setExpandedDay(isExpanded ? null : day._id);
                                    }}
                                >
                                    <div className="hm-day-left">
                                        <span className="hm-day-num">Day {day.dayNumber}</span>
                                        <span className="hm-day-date">
                                            {date.toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="hm-day-right">
                                        <span className="hm-day-count">
                                            {dayDone}/{dayTotal}
                                        </span>
                                        <span className={`hm-chevron ${isExpanded ? 'up' : ''}`}>▾</span>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <ul className="hm-exercise-list">
                                        {day.exercises.map((ex) => {
                                            const log = logs.find(
                                                (l) =>
                                                    l.dayNumber === day.dayNumber &&
                                                    l.exercise === ex.exercise._id
                                            );
                                            const checked = log?.completed || false;

                                            return (
                                                <li key={ex._id} className="hm-exercise">
                                                    <label className={`hm-check-label ${checked ? 'checked' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="hm-checkbox"
                                                            checked={checked}
                                                            disabled={!log}
                                                            onChange={(e) => handleToggle(log, e.target.checked)}
                                                        />
                                                        <span className="hm-check-box" />
                                                        <span className="hm-ex-info">
                                                            <span className="hm-ex-name">{ex.exercise.name}</span>
                                                            <span className="hm-ex-meta">
                                                                {ex.exercise.targetMuscle} · {ex.sets}×{ex.reps}
                                                            </span>
                                                        </span>
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="hm-next-week">
                    {due || TEST_MODE ? (
                        <button type="button" className="hm-btn-primary" onClick={createNewWeek}>
                            Generate Next Week
                        </button>
                    ) : (
                        <p className="hm-unlock">
                            Next week unlocks in <strong>{Math.ceil(7 - daysPassed)}</strong> day(s)
                        </p>
                    )}
                </div>
            </main>

            <footer className="hm-bottombar">
                <span>© 2026 OniGata Inc.</span>
                <span>Tokyo // Worldwide</span>
            </footer>
        </div>
    );
};

export default Home;
