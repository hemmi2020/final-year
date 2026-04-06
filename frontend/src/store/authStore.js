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
