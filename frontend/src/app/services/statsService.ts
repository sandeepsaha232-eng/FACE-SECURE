import axios from 'axios';

// @ts-ignore
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

const ML_URL = 'http://localhost:8000';

export const statsService = {
    async getStats() {
        const response = await axios.get(`${API_URL}/stats`, {
            withCredentials: true
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
        const response = await axios.post(`${API_URL}/auth/submit-verification`, {
            name,
            faceImage,
            livenessScore
        });
        return response.data;
    }
};
