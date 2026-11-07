import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../auth/profile';
import { GOALS } from '../constants/goal';
import './Settings.css';

import male from '../assets/male oni.jpeg';
import female from '../assets/female oni.jpeg';
import beginner from '../assets/dagger.jpeg';
import intermediate from '../assets/sword.jpeg';
import expert from '../assets/Aura sword.jpeg';
import vhsape from '../assets/v shape.jpeg';
import lean from '../assets/leaan.jpeg';
import fatloss from '../assets/fat loss.jpeg';
import general from '../assets/general strength.jpeg';

import selectSfx from '../assets/sounds/transition.mp3';
import submitSfx from '../assets/sounds/profile.mp3';

const STEPS = ['gender', 'age', 'goal', 'level', 'days', 'injury'];

const goalImages = {
    'V-shaped taper': vhsape,
    'Lean muscle gain': lean,
    'Fat loss': fatloss,
    'General strength': general,
};

const Settings = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [level, setLevel] = useState('');
    const [target, setTarget] = useState('');
    const [workoutDays, setWorkoutDays] = useState('');
    const [hasInjury, setHasInjury] = useState(false);
    const [injuryDetails, setInjuryDetails] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [booting, setBooting] = useState(true);

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
        getProfile()
            .then((p) => {
                if (p) {
                    setGender(p.gender || '');
                    setAge(p.age != null ? String(p.age) : '');
                    setLevel(p.level || '');
                    setTarget(p.target || '');
                    setWorkoutDays(p.workoutDays != null ? String(p.workoutDays) : '');
                    setHasInjury(!!p.hasInjury);
                    setInjuryDetails(p.injuryDetails || '');
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setBooting(false));
    }, []);

    const current = STEPS[step];
    const progress = ((step + 1) / STEPS.length) * 100;

    const canProceed = () => {
        switch (current) {
            case 'gender':
                return !!gender;
            case 'age':
                return Number(age) >= 13 && Number(age) <= 100;
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
        playSelect();
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1);
            setError('');
        }
    };

    const back = () => {
        if (step > 0) {
            playSelect();
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
            await updateProfile({
                gender,
                age: Number(age),
                level,
                target,
                workoutDays: Number(workoutDays),
                hasInjury,
                injuryDetails: hasInjury ? injuryDetails : '',
            });
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Save failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (booting) {
        return (
            <div className="st-root">
                <div className="st-boot">
                    <div className="st-boot-dot" />
                    <p>Loading settings…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="st-root">
            <header className="st-topbar">
                <Link to="/home" className="st-brand">
                    <span className="st-brand-kanji">鬼形</span>
                    <span className="st-brand-sep" />
                    <span className="st-brand-label">OniGata</span>
                </Link>
                <div className="st-step-indicator">
                    Step {step + 1} / {STEPS.length}
                </div>
            </header>

            <div className="st-progress-track">
                <div className="st-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <main className="st-main">
                <div className="st-card-frame">
                    <div className="st-border-stream" aria-hidden="true" />
                    <div className="st-glass-card">
                        {current === 'gender' && (
                            <section className="st-section">
                                <div className="st-section-header">
                                    <span className="st-badge">
                                        <span className="st-badge-dot" />
                                        IDENTITY
                                    </span>
                                    <h2 className="st-title">Select Your Gender</h2>
                                    <p className="st-subtitle">Choose the path that matches you</p>
                                </div>
                                <div className="st-choice-row">
                                    <button
                                        type="button"
                                        className={`st-choice-card ${gender === 'male' ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setGender('male'); }}
                                    >
                                        <div className="st-choice-image">
                                            <img src={male} alt="Male" />
                                            <span className="st-choice-label">Male</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        className={`st-choice-card ${gender === 'female' ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setGender('female'); }}
                                    >
                                        <div className="st-choice-image">
                                            <img src={female} alt="Female" />
                                            <span className="st-choice-label">Female</span>
                                        </div>
                                    </button>
                                </div>
                            </section>
                        )}

                        {current === 'age' && (
                            <section className="st-section">
                                <div className="st-section-header">
                                    <span className="st-badge">
                                        <span className="st-badge-dot" />
                                        TIMELINE
                                    </span>
                                    <h2 className="st-title">Your Age</h2>
                                    <p className="st-subtitle">Update your age for better programming</p>
                                </div>
                                <div className="st-dob-wrap">
                                    <label htmlFor="age" className="st-label">Age</label>
                                    <input
                                        id="age"
                                        type="number"
                                        className="st-date-input"
                                        value={age}
                                        min="13"
                                        max="100"
                                        onChange={(e) => { playSelect(); setAge(e.target.value); }}
                                        required
                                    />
                                </div>
                            </section>
                        )}

                        {current === 'goal' && (
                            <section className="st-section">
                                <div className="st-section-header">
                                    <span className="st-badge">
                                        <span className="st-badge-dot" />
                                        PURPOSE
                                    </span>
                                    <h2 className="st-title">Your Goal</h2>
                                    <p className="st-subtitle">What are you forging toward?</p>
                                </div>
                                <div className="st-choice-grid">
                                    {GOALS.map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            className={`st-choice-card ${target === g ? 'active' : ''}`}
                                            onClick={() => { playSelect(); setTarget(g); }}
                                        >
                                            <div className="st-choice-image small">
                                                <img src={goalImages[g]} alt={g} />
                                                <span className="st-choice-label">{g}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {current === 'level' && (
                            <section className="st-section">
                                <div className="st-section-header">
                                    <span className="st-badge">
                                        <span className="st-badge-dot" />
                                        EXPERIENCE
                                    </span>
                                    <h2 className="st-title">Your Level</h2>
                                    <p className="st-subtitle">How long have you walked this path?</p>
                                </div>
                                <div className="st-choice-row three">
                                    <button
                                        type="button"
                                        className={`st-choice-card ${level === 'beginner' ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setLevel('beginner'); }}
                                    >
                                        <div className="st-choice-image">
                                            <img src={beginner} alt="Beginner" />
                                            <span className="st-choice-label">Beginner</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        className={`st-choice-card ${level === 'intermediate' ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setLevel('intermediate'); }}
                                    >
                                        <div className="st-choice-image">
                                            <img src={intermediate} alt="Intermediate" />
                                            <span className="st-choice-label">Intermediate</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        className={`st-choice-card ${level === 'advanced' ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setLevel('advanced'); }}
                                    >
                                        <div className="st-choice-image">
                                            <img src={expert} alt="Advanced" />
                                            <span className="st-choice-label">Advanced</span>
                                        </div>
                                    </button>
                                </div>
                            </section>
                        )}

                        {current === 'days' && (
                            <section className="st-section">
                                <div className="st-section-header">
                                    <span className="st-badge">
                                        <span className="st-badge-dot" />
                                        DISCIPLINE
                                    </span>
                                    <h2 className="st-title">Workout Days</h2>
                                    <p className="st-subtitle">How many days per week can you commit? (1–6)</p>
                                </div>
                                <div className="st-days-row">
                                    {[1, 2, 3, 4, 5, 6].map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            className={`st-day-btn ${Number(workoutDays) === d ? 'active' : ''}`}
                                            onClick={() => { playSelect(); setWorkoutDays(String(d)); }}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {current === 'injury' && (
                            <section className="st-section">
                                <div className="st-section-header">
                                    <span className="st-badge">
                                        <span className="st-badge-dot" />
                                        LIMITS
                                    </span>
                                    <h2 className="st-title">Injuries & Limitations</h2>
                                    <p className="st-subtitle">Any physical constraints we should know about?</p>
                                </div>
                                <div className="st-injury-toggle">
                                    <button
                                        type="button"
                                        className={`st-toggle-btn ${!hasInjury ? 'active' : ''}`}
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
                                        className={`st-toggle-btn ${hasInjury ? 'active' : ''}`}
                                        onClick={() => { playSelect(); setHasInjury(true); }}
                                    >
                                        Yes, I have limitations
                                    </button>
                                </div>
                                {hasInjury && (
                                    <div className="st-injury-details">
                                        <label htmlFor="injury" className="st-label">
                                            Describe your injury / limitation
                                        </label>
                                        <textarea
                                            id="injury"
                                            className="st-textarea"
                                            value={injuryDetails}
                                            onChange={(e) => setInjuryDetails(e.target.value)}
                                            placeholder="e.g. Previous knee surgery, lower back pain..."
                                            rows={4}
                                        />
                                    </div>
                                )}
                            </section>
                        )}

                        {error && <div className="st-error">{error}</div>}

                        <div className="st-nav">
                            {step > 0 && (
                                <button type="button" className="st-btn-secondary" onClick={back}>
                                    Back
                                </button>
                            )}
                            {step < STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    className="st-btn-primary"
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
                                    className="st-btn-primary"
                                    onClick={handleSubmit}
                                    disabled={!canProceed() || isLoading}
                                >
                                    {isLoading ? 'Saving…' : 'Save Changes'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="st-bottombar">
                <span>© 2026 OniGata Inc. All rights reserved.</span>
                <span>Tokyo // Worldwide</span>
            </footer>
        </div>
    );
};

export default Settings;
