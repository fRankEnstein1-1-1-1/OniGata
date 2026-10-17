import { useEffect, useRef, useState } from 'react';
import { generatePlan, getCurrentPlan, toggleLog } from '../auth/workout';
import { Link } from 'react-router-dom';
const TEST_MODE = true; // true = skip the 7-day wait while testing
const DAY_MS = 24 * 60 * 60 * 1000;

// day offsets from plan start: 3 or fewer = alternate days, more = two on / one off
const getOffsets = (n) => {
    if (n <= 3) return Array.from({ length: n }, (_, i) => i * 2);
    if (n === 6) return [0, 1, 2, 3, 4, 5]; // two-on-one-off would spill past 7 days
    return Array.from({ length: n }, (_, i) => i + Math.floor(i / 2));
};

const Home = () => {
    const [plan, setPlan] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const started = useRef(false); // stops React StrictMode from generating twice

    const loadPlan = async () => {
        const data = await getCurrentPlan();
        if (data) {
            setPlan(data.plan);
            setLogs(data.logs);
        }
        return data;
    };

    const createNewWeek = async () => {
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
                    await createNewWeek(); // first visit: generate Week 1
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

    const handleToggle = async (log, completed) => {
        setLogs((prev) => prev.map((l) => (l._id === log._id ? { ...l, completed } : l)));
        try {
            await toggleLog(log._id, completed);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading your plan (the first one can take a few seconds)...</p>;
    if (!plan) return <p>{error || 'No plan found'}</p>;

    const lastPlanAt = Number(localStorage.getItem('lastPlanAt'));
    const daysPassed = (Date.now() - lastPlanAt) / DAY_MS;
    const due = daysPassed >= 7;
    const offsets = getOffsets(plan.days.length);

    return (
        <div>
            <h1>Week {plan.weekNumber} (Tier {plan.tier})</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {plan.days.map((day, i) => {
                const date = new Date(lastPlanAt + offsets[i] * DAY_MS);
                return (
                    <div key={day._id}>
                        <h3>
                            Day {day.dayNumber} - {date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h3>
                        <ul>
                            {day.exercises.map((ex) => {
                                const log = logs.find(
                                    (l) => l.dayNumber === day.dayNumber && l.exercise === ex.exercise._id
                                );
                                return (
                                    <li key={ex._id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={log?.completed || false}
                                                disabled={!log}
                                                onChange={(e) => handleToggle(log, e.target.checked)}
                                            />{' '}
                                            {ex.exercise.name} ({ex.exercise.targetMuscle}) - {ex.sets} x {ex.reps}
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })}

            <hr />
            {due || TEST_MODE ? (
                <button onClick={createNewWeek}>Generate next week</button>
            ) : (
                <p>Next week unlocks in {Math.ceil(7 - daysPassed)} day(s)</p>
            )}
            <Link to="/settings">
                <button>Settings</button>
            </Link>
        </div>
    );
};

export default Home;