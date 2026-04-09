import { create } from "zustand";

export const useDestinationStore = create((set) => ({
    city: null,
    country: null,
    currency: null,

    setDestination: ({ city, country, currency }) => set({ city, country, currency }),
    clearDestination: () => set({ city: null, country: null, currency: null }),
}));
