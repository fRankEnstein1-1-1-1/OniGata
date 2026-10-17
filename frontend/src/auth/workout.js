import { getToken } from './jwt';

const API_URL = 'http://localhost:5000/api/workout';

const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
});

export const generatePlan = async () => {
    const response = await fetch(`${API_URL}/generate`, { method: 'POST', headers: headers() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Plan generation failed');
    return data;
};

export const getCurrentPlan = async () => {
    const response = await fetch(`${API_URL}/current`, { headers: headers() });
    if (response.status === 404) return null;
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not load plan');
    return data;
};

export const toggleLog = async (logId, completed) => {
    const response = await fetch(`${API_URL}/log/${logId}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ completed })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Update failed');
    return data;
};