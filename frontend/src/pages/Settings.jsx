import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../auth/profile';

const Settings = () => {
    const [form, setForm] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        getProfile()
            .then(setForm)
            .catch((err) => setError(err.message));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await updateProfile({
                gender: form.gender,
                age: Number(form.age),
                level: form.level,
                target: form.target,
                workoutDays: Number(form.workoutDays),
                hasInjury: form.hasInjury,
                injuryDetails: form.hasInjury ? form.injuryDetails : ''
            });
            setMessage('Saved. Changes apply from your next generated week.');
        } catch (err) {
            setError(err.message);
        }
    };

    if (!form) return <p>{error || 'Loading...'}</p>;

    return (
        <div>
            <Link to="/home">Back to home</Link>
            <h2>Profile Settings</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Gender</label>
                    <select name="gender" value={form.gender || 'male'} onChange={handleChange}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label>Age</label>
                    <input type="number" name="age" value={form.age || ''} onChange={handleChange} required />
                </div>
                <div>
                    <label>Experience Level</label>
                    <select name="level" value={form.level || 'beginner'} onChange={handleChange}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                <div>
                    <label>Goal</label>
                    <input name="target" value={form.target || ''} onChange={handleChange} required />
                </div>
                <div>
                    <label>Workout Days per Week (max 6)</label>
                    <input
                        type="number"
                        name="workoutDays"
                        min="1"
                        max="6"
                        value={form.workoutDays || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>
                        <input type="checkbox" name="hasInjury" checked={form.hasInjury || false} onChange={handleChange} />
                        Any injury or physical limitation?
                    </label>
                </div>
                {form.hasInjury && (
                    <div>
                        <label>Injury Details</label>
                        <textarea name="injuryDetails" value={form.injuryDetails || ''} onChange={handleChange} />
                    </div>
                )}
                <button type="submit">Save</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Settings;