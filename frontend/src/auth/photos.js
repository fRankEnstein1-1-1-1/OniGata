import API_BASE_URL from '../api/api';
import { getToken } from './jwt';
const API_URL = `${API_BASE_URL}/photos/upload`;



export const uploadPhotos = async (front, side) => {
    const formData = new FormData();

    formData.append('front', front);
    formData.append('side', side);

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getToken()}`
        },
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Photo upload failed');
    }

    return data;
};