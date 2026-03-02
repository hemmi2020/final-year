import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

/**
 * API client with axios
 * Automatically adds auth token to requests
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// API endpoints
export const authAPI = {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    logout: () => api.post('/api/auth/logout'),
    refreshToken: () => api.post('/api/auth/refresh'),
    getProfile: () => api.get('/api/auth/profile'),
};

export const tripsAPI = {
    getAll: () => api.get('/api/trips'),
    getById: (id) => api.get(`/api/trips/${id}`),
    create: (tripData) => api.post('/api/trips', tripData),
    update: (id, tripData) => api.put(`/api/trips/${id}`, tripData),
    delete: (id) => api.delete(`/api/trips/${id}`),
    generateItinerary: (preferences) => api.post('/api/trips/generate', preferences),
};

export const usersAPI = {
    getProfile: () => api.get('/api/users/profile'),
    updateProfile: (userData) => api.put('/api/users/profile', userData),
    updatePreferences: (preferences) => api.put('/api/users/preferences', preferences),
    uploadAvatar: (formData) => api.post('/api/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const adminAPI = {
    getUsers: (params) => api.get('/api/admin/users', { params }),
    getUser: (id) => api.get(`/api/admin/users/${id}`),
    updateUser: (id, userData) => api.put(`/api/admin/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
    getStats: () => api.get('/api/admin/stats'),
    getTrips: (params) => api.get('/api/admin/trips', { params }),
};
