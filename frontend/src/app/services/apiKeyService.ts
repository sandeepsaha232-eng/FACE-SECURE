import axios from 'axios';

const getApiUrl = () => {
    // @ts-ignore
    const envUrl = import.meta.env?.VITE_API_URL;
    if (envUrl) return envUrl;
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return '/api';
    }
    return 'https://face-secure-backend-production.up.railway.app/api';
};

const API_URL = getApiUrl();

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await wait(delay);
        return fetchWithRetry(fn, retries - 1, delay * 2);
    }
}


const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
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

export interface ApiKeyData {
    id: string;
    keyId: string;
    key?: string; // Only returned once on creation
    keyPrefix: string;
    name: string;
    environment: 'test' | 'live';
    status: 'active' | 'suspended' | 'revoked';
    monthlyUsage: number;
    dailyUsage: number;
    successCount: number;
    failureCount: number;
    lastUsedAt?: string;
    createdAt: string;
    webhookUrl?: string;
    webhookRetryPolicy: string;
    webhookLastDelivery?: {
        status: 'success' | 'failed';
        timestamp: string;
        statusCode?: number;
    };
    webhookSecret?: string;
    dataRetention: string;
    disableVideoStorage: boolean;
    requireExtraVerification: boolean;
}

export interface KeyUsageData {
    keyId: string;
    name: string;
    dailyUsage: number;
    monthlyUsage: number;
    totalSessions: number;
    verifiedSessions: number;
    rejectedSessions: number;
    pendingSessions: number;
    successRate: number;
    avgConfidence: number;
    recentSessions: Array<{
        sessionId: string;
        status: string;
        confidence: number;
        signals: { liveness: string; replay: string; behavior: string };
        deviceInfo?: {
            browser?: string;
            os?: string;
            device?: string;
            deviceType?: string;
        };
        ipAddress?: string;
        location?: {
            city?: string;
            country?: string;
            isp?: string;
        };
        isEncrypted?: boolean;
        createdAt: string;
        completedAt?: string;
    }>;
}

export interface AnalyticsData {
    totalVerifications: number;
    verifiedCount: number;
    rejectedCount: number;
    verifiedPercent: number;
    rejectedPercent: number;
    avgConfidence: number;
    retryRate: number;
    lastBrowser?: string;
}

export const apiKeyService = {
    async createKey(data: { name?: string; environment?: 'test' | 'live' }) {
        const response = await api.post('/keys', data);
        return response.data;
    },

    async listKeys(): Promise<{ success: boolean; data: ApiKeyData[] }> {
        const response = await api.get('/keys');
        return response.data;
    },

    async updateKey(id: string, data: Partial<ApiKeyData>) {
        const response = await api.put(`/keys/${id}`, data);
        return response.data;
    },

    async rotateKey(id: string) {
        const response = await api.post(`/keys/${id}/rotate`);
        return response.data;
    },

    async disableKey(id: string) {
        const response = await api.post(`/keys/${id}/disable`);
        return response.data;
    },

    async getKeyUsage(id: string): Promise<{ success: boolean; data: KeyUsageData }> {
        const response = await api.get(`/keys/${id}/usage`);
        return response.data;
    },

    async getAnalytics(): Promise<{ success: boolean; data: AnalyticsData }> {
        const response = await api.get('/keys/analytics');
        return response.data;
    },

    async createVerificationSession() {
        return fetchWithRetry(async () => {
            const response = await api.post('/verification/session');
            return response.data;
        });
    },

    async completeVerificationSession(sessionId: string, data: { status: string; confidence: number; signals: any }) {
        const response = await api.post(`/verification/session/${sessionId}/complete`, data);
        return response.data;
    },
};
