import axios from 'axios';

const getApiUrl = () => {
    // 1. If we are on a non-localhost domain (e.g. Vercel), force use the same-origin /api
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return `${window.location.origin}/api`;
    }

    // 2. Otherwise, check for environment variable OR use local default
    // @ts-ignore
    return import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    async register(userData: { name: string; email: string; password?: string; faceImage?: string }) {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    },

    async login(data: { email: string; password?: string }) {
        // Password login fallback (if implemented)
        const response = await api.post('/auth/login', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    async verifyFace(data: {
        faceImage: string;
        livenessData: any;
        metadata: any
    }) {
        const response = await api.post('/auth/verify-face', data);
        if (response.data.sessionToken) {
            localStorage.setItem('token', response.data.sessionToken);
        }
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/login';
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }
};
