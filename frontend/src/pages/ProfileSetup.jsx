import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProfile } from '../auth/profile';
import { GOALS } from '../constants/goal';
import './ProfileSetup.css';

import male from "../assets/male oni.jpeg";
import female from "../assets/female oni.jpeg";
import beginner from "../assets/dagger.jpeg";
import intermediate from "../assets/sword.jpeg";
import expert from "../assets/Aura sword.jpeg"
import vhsape from "../assets/v shape.jpeg";
import lean from "../assets/leaan.jpeg";
import fatloss from "../assets/fat loss.jpeg";
import general from "../assets/general strength.jpeg";


// 🔊 Sound effects – put your files in src/assets/sounds/
import selectSfx from '../assets/sounds/transition.mp3';   // common selection sound
import submitSfx from '../assets/sounds/profile.mp3';   // create profile sound

const STEPS = ['gender', 'age', 'goal', 'level', 'days', 'injury'];

const ProfileSetup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [level, setLevel] = useState('');
    const [target, setTarget] = useState('');
    const [workoutDays, setWorkoutDays] = useState('');
    const [hasInjury, setHasInjury] = useState(false);
    const [injuryDetails, setInjuryDetails] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Preload audio so playback is instant
    const selectAudio = useRef(null);
    const submitAudio = useRef(null);

    if (!selectAudio.current) {
        selectAudio.current = new Audio(selectSfx);
        selectAudio.current.volume = 0.6;
    }
    if (!submitAudio.current) {
        submitAudio.current = new Audio(submitSfx);
        submitAudio.current.volume = 0.7;
    }

    const goalImages = {
        "V-shaped taper": vhsape,
        "Lean muscle gain": lean,
        "Fat loss": fatloss,
        "General strength": general,
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

    const current = STEPS[step];
    const progress = ((step + 1) / STEPS.length) * 100;

    const calcAge = (dateString) => {
        if (!dateString) return null;
        const today = new Date();
        const birth = new Date(dateString);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const canProceed = () => {
        switch (current) {
            case 'gender':
                return !!gender;
            case 'age':
                return !!dob && calcAge(dob) >= 13 && calcAge(dob) <= 100;
            case 'level':
                return !!level;
            case 'goal':
                return !!target;
            case 'days':
                return Number(workoutDays) >= 1 && Number(workoutDays) <= 6;
            case 'injury':
                return !hasInjury || (hasInjury && injuryDetails.trim().length > 0);
            default:
                return false;
        }
    };

    const next = () => {
        if (!canProceed()) return;
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1);
            setError('');
        }
    };

    const back = () => {
        if (step > 0) {
            setStep((s) => s - 1);
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (!canProceed()) return;
        playSubmit();
        setIsLoading(true);
        setError('');
        try {
            const age = calcAge(dob);
            await createProfile({
                gender,
                age,
                level,
                target,
                workoutDays: Number(workoutDays),
                hasInjury,
                injuryDetails: hasInjury ? injuryDetails : '',
            });
            navigate('/photo-upload');
        } catch (err) {
            setError(err.message || 'Profile creation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ps-root">
            {/* Top Bar */}
            <header className="ps-topbar">
                <Link to="/" className="ps-brand">
                    <span className="ps-brand-kanji">鬼形</span>
                    <span className="ps-brand-sep" />
                    <span className="ps-brand-label">OniGata</span>
                </Link>
                <div className="ps-step-indicator">
                    Step {step + 1} / {STEPS.length}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="ps-progress-track">
                <div className="ps-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Main Content */}
            <main className="ps-main">
                <div className="ps-card-frame">
                    <div className="ps-border-stream" aria-hidden="true" />
                    <div className="ps-glass-card">
                        {/* ===== GENDER ===== */}
                        {current === 'gender' && (
                            <section className="ps-section">
                                <div className="ps-section-header">
                                    <span className="ps-badge">
                                        <span className="ps-badge-dot" />
                                        IDENTITY
                                    </span>
                                    <h2 className="ps-title">Select Your Gender</h2>
                                    <p className="ps-subtitle">Choose the path that matches you</p>
                                </div>

                                <div className="ps-choice-row">
                                    <button
                                        type="button"
                                        className={`ps-choice-card ${gender === 'male' ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setGender('male'); }}
                                    >
                                        <div className="ps-choice-image">
                                            {/* Replace with your male image */}
                                            <div className="ps-placeholder"></div>
                                            {<img src={male} alt="Male" />}
                                            <span className="ps-choice-label">Male</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className={`ps-choice-card ${gender === 'female' ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setGender('female'); }}
                                    >
                                        <div className="ps-choice-image">
                                            {/* Replace with your female image */}
                                            <div className="ps-placeholder"></div>
                                            {<img src={female} alt="Female" />}
                                            <span className="ps-choice-label">Female</span>
                                        </div>
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* ===== AGE / DOB ===== */}
                        {current === 'age' && (
                            <section className="ps-section">
                                <div className="ps-section-header">
                                    <span className="ps-badge">
                                        <span className="ps-badge-dot" />
                                        TIMELINE
                                    </span>
                                    <h2 className="ps-title">Date of Birth</h2>
                                    <p className="ps-subtitle">We use this to calculate your age accurately</p>
                                </div>

                                <div className="ps-dob-wrap">
                                    <label htmlFor="dob" className="ps-label">Date of Birth</label>
                                    <input
                                        id="dob"
                                        type="date"
                                        className="ps-date-input"
                                        value={dob}
                                        onChange={(e) => { playSelect(); setDob(e.target.value); }}
                                        max={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                    {dob && (
                                        <p className="ps-age-preview">
                                            Age: <strong>{calcAge(dob)}</strong> years
                                        </p>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* ===== EXPERIENCE LEVEL ===== */}
                        {current === 'level' && (
                            <section className="ps-section">
                                <div className="ps-section-header">
                                    <span className="ps-badge">
                                        <span className="ps-badge-dot" />
                                        EXPERIENCE
                                    </span>
                                    <h2 className="ps-title">Your Level</h2>
                                    <p className="ps-subtitle">How long have you walked this path?</p>
                                </div>

                                <div className="ps-choice-row three">
                                    <button
                                        type="button"
                                        className={`ps-choice-card ${level === 'beginner' ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setLevel('beginner'); }}
                                    >
                                        <div className="ps-choice-image">
                                            <div className="ps-placeholder"></div>
                                            {<img src={beginner} alt="Beginner" />}
                                            <span className="ps-choice-label">Beginner</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className={`ps-choice-card ${level === 'intermediate' ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setLevel('intermediate'); }}
                                    >
                                        <div className="ps-choice-image">
                                            <div className="ps-placeholder"></div>
                                            {<img src={intermediate} alt="Intermediate" />}
                                            <span className="ps-choice-label">Intermediate</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className={`ps-choice-card ${level === 'advanced' ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setLevel('advanced'); }}
                                    >
                                        <div className="ps-choice-image">
                                            <div className="ps-placeholder"></div>
                                            {<img src={expert} alt="Advanced" />}
                                            <span className="ps-choice-label">Advanced</span>
                                        </div>
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* ===== GOAL ===== */}
                        {current === 'goal' && (
                            <section className="ps-section">
                                <div className="ps-section-header">
                                    <span className="ps-badge">
                                        <span className="ps-badge-dot" />
                                        PURPOSE
                                    </span>
                                    <h2 className="ps-title">Your Goal</h2>
                                    <p className="ps-subtitle">What are you forging toward?</p>
                                </div>

                                <div className="ps-choice-grid">
                                    {GOALS.map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            className={`ps-choice-card ${target === g ? 'active' : ''}`}
                                            onClick={() => { playSelect(); setTarget(g); }}
                                        >
                                            <div className="ps-choice-image small">
                                                <div className="ps-placeholder"></div>
                                                {<img src={goalImages[g]} alt={g} />}
                                                <span className="ps-choice-label">{g}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ===== WORKOUT DAYS ===== */}
                        {current === 'days' && (
                            <section className="ps-section">
                                <div className="ps-section-header">
                                    <span className="ps-badge">
                                        <span className="ps-badge-dot" />
                                        DISCIPLINE
                                    </span>
                                    <h2 className="ps-title">Workout Days</h2>
                                    <p className="ps-subtitle">How many days per week can you commit? (1–6)</p>
                                </div>

                                <div className="ps-days-row">
                                    {[1, 2, 3, 4, 5, 6].map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            className={`ps-day-btn ${Number(workoutDays) === d ? 'active' : ''}`}
                                            onClick={() => { playSelect(); setWorkoutDays(String(d)); }}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ===== INJURY ===== */}
                        {current === 'injury' && (
                            <section className="ps-section">
                                <div className="ps-section-header">
                                    <span className="ps-badge">
                                        <span className="ps-badge-dot" />
                                        LIMITS
                                    </span>
                                    <h2 className="ps-title">Injuries & Limitations</h2>
                                    <p className="ps-subtitle">Any physical constraints we should know about?</p>
                                </div>

                                <div className="ps-injury-toggle">
                                    <button
                                        type="button"
                                        className={`ps-toggle-btn ${!hasInjury ? 'active' : ''}`}
                                        onClick={() => {
                                            playSelect();
                                            setHasInjury(false);
                                            setInjuryDetails('');
                                        }}
                                    >
                                        No Injuries
                                    </button>
                                    <button
                                        type="button"
                                        className={`ps-toggle-btn ${hasInjury ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setHasInjury(true); }}
                                    >
                                        Yes, I have limitations
                                    </button>
                                </div>

                                {hasInjury && (
                                    <div className="ps-injury-details">
                                        <label htmlFor="injury" className="ps-label">Describe your injury / limitation</label>
                                        <textarea
                                            id="injury"
                                            className="ps-textarea"
                                            value={injuryDetails}
                                            onChange={(e) => setInjuryDetails(e.target.value)}
                                            placeholder="e.g. Previous knee surgery, lower back pain..."
                                            rows={4}
                                        />
                                    </div>
                                )}
                            </section>
                        )}

                        {error && <div className="ps-error">{error}</div>}

                        {/* Navigation */}
                        <div className="ps-nav">
                            {step > 0 && (
                                <button type="button" className="ps-btn-secondary" onClick={back}>
                                    Back
                                </button>
                            )}

                            {step < STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    className="ps-btn-primary"
                                    onClick={next}
                                    disabled={!canProceed()}
                                >
                                    Continue
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="ps-btn-primary"
                                    onClick={handleSubmit}
                                    disabled={!canProceed() || isLoading}
                                >
                                    {isLoading ? 'Forging Profile...' : 'Create Profile'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="ps-bottombar">
                <span>© 2026 OniGata Inc. All rights reserved.</span>
                <span>Tokyo // Worldwide</span>
            </footer>
        </div>
    );
};

export default ProfileSetup;