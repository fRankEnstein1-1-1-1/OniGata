import { getToken } from './jwt';

const API_URL = 'http://localhost:5000/api/profile';

export const getProfile = async () => {
    const response = await fetch(`${API_URL}/get`, {
        headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `Status ${response.status}: ${JSON.stringify(data)}`);
    }
    return data;
};

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
export const updateProfile = async (updates) => {
    const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(updates)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Update failed');
    return data;
};