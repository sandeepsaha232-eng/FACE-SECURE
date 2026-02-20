import axios from 'axios';

const getApiUrl = () => {
    // @ts-ignore
    const envUrl = import.meta.env?.VITE_API_URL;
    if (envUrl) return envUrl;
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000/api';
    }
    return 'https://face-secure-backend-production.up.railway.app/api';
};

const API_URL = getApiUrl();

const getMlUrl = () => {
    // @ts-ignore
    const envUrl = import.meta.env?.VITE_ML_URL;
    if (envUrl) return envUrl;
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8000';
    }
    return 'https://face-secure-ml-production.up.railway.app';
};

const ML_URL = getMlUrl();

export const statsService = {
    async getStats() {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/stats`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    async verifyLiveness(image: string) {
        const response = await axios.post(`${ML_URL}/verify-liveness`, {
            image
        });
        return response.data;
    },

    async submitVerification(name: string, faceImage: string, livenessScore: number) {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/auth/submit-verification`, {
            name,
            faceImage,
            livenessScore
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }
};
