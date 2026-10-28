import { useState } from 'react';
import { Link } from 'react-router-dom';
import { uploadPhotos } from '../auth/photos';

const Checkin = () => {
    const [front, setFront] = useState(null);
    const [side, setSide] = useState(null);
    const [comparison, setComparison] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!front || !side) {
            setError('Please select both a front and a side photo');
            return;
        }
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

    return (
        <div>
            <Link to="/home">Back to home</Link>
            <h2>14-Day Check-In</h2>

            {comparison ? (
                <div>
                    <h3>Your progress note</h3>
                    <p>{comparison}</p>
                    <p>Generate your next week from Home now, so this note feeds into it.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <p>Use the same angles, clothing and lighting as your previous photos.</p>
                    <div>
                        <label>Front view</label>
                        <input type="file" accept="image/*" onChange={(e) => setFront(e.target.files[0])} />
                    </div>
                    <div>
                        <label>Side view</label>
                        <input type="file" accept="image/*" onChange={(e) => setSide(e.target.files[0])} />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Comparing (can take a few seconds)...' : 'Submit check-in'}
                    </button>
                </form>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Checkin;