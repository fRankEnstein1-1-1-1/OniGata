import API_BASE_URL from '../api/api';

const API_URL = `${API_BASE_URL}/photos/upload`;

export const uploadPhotos = async (front, side) => {
    const formData = new FormData();
    formData.append('front', front);
    formData.append('side', side);

    const response = await fetch(API_URL, {
        method: 'POST',
        // no Content-Type header here: the browser sets it with the multipart boundary
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Photo upload failed');
    }
    return data;
};