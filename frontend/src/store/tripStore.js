import { create } from 'zustand';
import { tripsAPI } from '@/lib/api';

/**
 * Trip store — manages trip state with real API calls
 */
export const useTripStore = create((set, get) => ({
    trips: [],
    currentTrip: null,
    loading: false,
    error: null,

    fetchTrips: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await tripsAPI.getAll();
            set({ trips: data.data || [], loading: false });
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to fetch trips', loading: false });
        }
    },

    fetchTrip: async (id) => {
        set({ loading: true, error: null });
        try {
            const { data } = await tripsAPI.getById(id);
            set({ currentTrip: data.data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.error || 'Trip not found', loading: false });
        }
    },

    createTrip: async (tripData) => {
        try {
            const { data } = await tripsAPI.create(tripData);
            set((state) => ({ trips: [data.data, ...state.trips] }));
            return data.data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to create trip' });
            return null;
        }
    },

    deleteTrip: async (id) => {
        try {
            await tripsAPI.delete(id);
            set((state) => ({ trips: state.trips.filter((t) => t._id !== id) }));
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to delete trip' });
        }
    },

    generateItinerary: async (preferences) => {
        set({ loading: true, error: null });
        try {
            const { data } = await tripsAPI.generate(preferences);
            set((state) => ({ trips: [data.data.trip, ...state.trips], loading: false }));
            return data.data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to generate itinerary', loading: false });
            return null;
        }
    },

    clearError: () => set({ error: null }),
}));
