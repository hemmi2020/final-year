import { create } from 'zustand';

/**
 * Trip management store
 * Handles current trip, saved trips, and trip planning state
 */
export const useTripStore = create((set, get) => ({
    currentTrip: null,
    savedTrips: [],
    isGenerating: false,

    // Set current trip being planned
    setCurrentTrip: (trip) => set({ currentTrip: trip }),

    // Add trip to saved trips
    addTrip: (trip) => set((state) => ({
        savedTrips: [...state.savedTrips, trip]
    })),

    // Update existing trip
    updateTrip: (tripId, updates) => set((state) => ({
        savedTrips: state.savedTrips.map((trip) =>
            trip.id === tripId ? { ...trip, ...updates } : trip
        )
    })),

    // Delete trip
    deleteTrip: (tripId) => set((state) => ({
        savedTrips: state.savedTrips.filter((trip) => trip.id !== tripId)
    })),

    // Set all saved trips
    setSavedTrips: (trips) => set({ savedTrips: trips }),

    // Set generating state
    setGenerating: (isGenerating) => set({ isGenerating }),

    // Clear current trip
    clearCurrentTrip: () => set({ currentTrip: null }),
}));
