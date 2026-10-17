import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPhotos } from '../auth/photos';

const PhotoUpload = () => {
    const navigate = useNavigate();
    const [front, setFront] = useState(null);
    const [side, setSide] = useState(null);
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
            await uploadPhotos(front, side);
            localStorage.setItem('lastPhotoAt', Date.now().toString());
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Photo upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Upload Baseline Photos</h2>
            <p>Use fitted clothing and clear, direct lighting. Take the same two angles every time.</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Front view</label>
                    <input type="file" accept="image/*" onChange={(e) => setFront(e.target.files[0])} />
                </div>
                <div>
                    <label>Side view</label>
                    <input type="file" accept="image/*" onChange={(e) => setSide(e.target.files[0])} />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default PhotoUpload;