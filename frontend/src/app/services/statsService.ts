import axios from 'axios';

const getApiUrl = () => {
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000/api';
    }
    return 'https://face-secure.onrender.com/api';
};

const API_URL = getApiUrl();

const getMlUrl = () => {
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8000';
    }
    return 'https://face-secure-1.onrender.com';
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

    async verifyLiveness(image: string, sessionId?: string) {
        try {
            const response = await axios.post(`${ML_URL}/verify-liveness`, {
                image,
                sessionId
            });
            return response.data;
        } catch (error: any) {
            console.error("🔥 CRITICAL BACKEND ERROR 🔥:", error.response?.data?.detail || error.message);
            throw error;
        }
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
