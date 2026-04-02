import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

/**
 * API client — auto-attaches JWT token to all requests
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — add auth token
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor — handle auth errors (logout on 401, no redirect)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default api;

// ─── Auth ───
export const authAPI = {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    logout: () => api.post('/api/auth/logout'),
    refreshToken: () => api.post('/api/auth/refresh'),
    getProfile: () => api.get('/api/auth/profile'),
};

// ─── Trips ───
export const tripsAPI = {
    getAll: () => api.get('/api/trips'),
    getById: (id) => api.get(`/api/trips/${id}`),
    create: (tripData) => api.post('/api/trips', tripData),
    update: (id, tripData) => api.put(`/api/trips/${id}`, tripData),
    delete: (id) => api.delete(`/api/trips/${id}`),
    generate: (prefs) => api.post('/api/trips/generate', prefs),
};

// ─── Chat ───
export const chatAPI = {
    send: (message) => api.post('/api/chat', { message }),
};

// ─── Users ───
export const usersAPI = {
    getProfile: () => api.get('/api/users/profile'),
    updateProfile: (data) => api.put('/api/users/profile', data),
    updatePreferences: (prefs) => api.put('/api/users/preferences', prefs),
    uploadAvatar: (formData) => api.post('/api/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── External APIs ───
export const externalAPI = {
    geocode: (q) => api.get('/api/external/geocode', { params: { q } }),
    weather: (lat, lng) => api.get('/api/external/weather', { params: { lat, lng } }),
    forecast: (lat, lng, days) => api.get('/api/external/forecast', { params: { lat, lng, days } }),
    places: (query, lat, lng, type) => api.get('/api/external/places', { params: { query, lat, lng, type } }),
    attractions: (lat, lng) => api.get('/api/external/attractions', { params: { lat, lng } }),
    currency: (from, to, amount) => api.get('/api/external/currency', { params: { from, to, amount } }),
};

// ─── Groups ───
export const groupsAPI = {
    getAll: () => api.get('/api/groups'),
    getById: (id) => api.get(`/api/groups/${id}`),
    create: (data) => api.post('/api/groups', data),
    invite: (id, email) => api.post(`/api/groups/${id}/invite`, { email }),
    join: (inviteCode) => api.post(`/api/groups/join/${inviteCode}`),
};

// ─── Locations ───
export const locationsAPI = {
    getAll: () => api.get('/api/locations'),
    save: (data) => api.post('/api/locations', data),
    remove: (id) => api.delete(`/api/locations/${id}`),
    addReview: (id, data) => api.post(`/api/locations/${id}/reviews`, data),
    getReviews: (id) => api.get(`/api/locations/${id}/reviews`),
};

// ─── Admin ───
export const adminAPI = {
    getUsers: (params) => api.get('/api/admin/users', { params }),
    getUser: (id) => api.get(`/api/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
    getStats: () => api.get('/api/admin/stats'),
    getTrips: (params) => api.get('/api/admin/trips', { params }),
};
