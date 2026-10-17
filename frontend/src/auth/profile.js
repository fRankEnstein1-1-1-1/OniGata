import { getToken } from './jwt';

const API_URL = 'http://localhost:5000/api/profile';

export const createProfile = async (profileData) => {
    const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(profileData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Profile creation failed');
    }
    return data;
};