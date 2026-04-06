import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Authentication store using Zustand
 * Persists user data and token to localStorage
 */
export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            // Set user and token after login
            setUser: (user, token) => {
                set({ user, token, isAuthenticated: true });
                // Sync preferences to global preference store
                try {
                    const prefStore = require("@/store/preferenceStore").usePreferenceStore.getState();
                    if (user?.preferences?.preferredCurrency) prefStore.setCurrency(user.preferences.preferredCurrency);
                    if (user?.preferences?.temperatureUnit) prefStore.setTempUnit(user.preferences.temperatureUnit === "imperial" ? "F" : "C");
                } catch { }
            },

            // Update user profile
            updateUser: (userData) => set((state) => ({
                user: { ...state.user, ...userData }
            })),

            // Logout and clear data
            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false
            }),

            // Check if user is admin
            isAdmin: () => {
                const { user } = get();
                return user?.role === 'admin';
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
