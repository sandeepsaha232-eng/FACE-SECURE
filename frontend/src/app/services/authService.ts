import axios from 'axios';

const getApiUrl = () => {
    // 1. Check for environment variable (set VITE_API_URL in Vercel to point to Railway backend)
    // @ts-ignore
    const envUrl = import.meta.env?.VITE_API_URL;
    if (envUrl) {
        return envUrl;
    }

    // 2. Local development: proxy configured in vite.config.ts forwards /api to localhost:5000
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return '/api';
    }

    // 3. Production fallback: points to your live Railway backend
    return 'https://face-secure-backend-production.up.railway.app/api';
};

const API_URL = getApiUrl();
console.log('DEBUG: authService using API_URL:', API_URL);

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

// Auto-redirect to login on expired token (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && error.response?.data?.message === 'Token expired') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    username?: string;
    profilePhoto?: string;
    bio?: string;
    phoneNumber?: string;
    location?: string;
    dateOfBirth?: string;
    gender?: string;
    preferences?: {
        language: string;
        theme: 'light' | 'dark' | 'system';
        notifications: {
            email: boolean;
            push: boolean;
        };
        privacy: {
            profilePublic: boolean;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export const authService = {
    // ... existing methods ...
    async register(userData: { name: string; email: string; password?: string; username?: string; faceImage?: string }) {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('authToken', response.data.token); // Store as authToken too
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userId', response.data.user.id || response.data.user._id);
            }
        }
        return response.data;
    },

    async login(data: { email: string; password?: string }) {
        // Password login fallback (if implemented)
        const response = await api.post('/auth/login', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('authToken', response.data.token);
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userId', response.data.user.id || response.data.user._id);
            }
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

    async getProfile(): Promise<{ success: boolean; data: UserProfile }> {
        const response = await api.get('/user/profile');
        return response.data;
    },

    async updateProfile(data: Partial<UserProfile>): Promise<{ success: boolean; message: string; data: UserProfile }> {
        const response = await api.put('/user/profile', data);
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('apiKey'); // Clear any cached API key data
        window.location.href = '/login';
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }
};
