import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProfile } from '../auth/profile';

const ProfileSetup = () => {
    const navigate = useNavigate();
    const [gender, setGender] = useState('male');
    const [age, setAge] = useState('');
    const [level, setLevel] = useState('beginner');
    const [target, setTarget] = useState('V-shaped taper');
    const [workoutDays, setWorkoutDays] = useState('');
    const [hasInjury, setHasInjury] = useState(false);
    const [injuryDetails, setInjuryDetails] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProfile({
                gender,
                age: Number(age),
                level,
                target,
                workoutDays: Number(workoutDays),
                hasInjury,
                injuryDetails: hasInjury ? injuryDetails : ''
            });
            alert("Profile created sucessfully!")
            navigate('/home');
        } catch (err) {
            console.log(err.message)
            setError(err.message || 'Profile creation failed');
        }
    };

    return (
        <div>
            <h2>Set Up Your Profile</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label>Age</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>
                <div>
                    <label>Experience Level</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value)}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                <div>
                    <label>Goal</label>
                    <input value={target} onChange={(e) => setTarget(e.target.value)} required />
                </div>
                <div>
                    <label>Workout Days per Week (max 6)</label>
                    <input
                        type="number"
                        min="1"
                        max="6"
                        value={workoutDays}
                        onChange={(e) => setWorkoutDays(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>
                        <input type="checkbox" checked={hasInjury} onChange={(e) => setHasInjury(e.target.checked)} />
                        Any injury or physical limitation?
                    </label>
                </div>
                {hasInjury && (
                    <div>
                        <label>Injury Details</label>
                        <textarea value={injuryDetails} onChange={(e) => setInjuryDetails(e.target.value)} />
                    </div>
                )}
                <button type="submit">Create Profile</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ProfileSetup;