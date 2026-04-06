import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePreferenceStore = create(
    persist(
        (set) => ({
            currency: "USD",
            tempUnit: "C",
            country: "🇺🇸",

            setCurrency: (currency) => set({ currency }),
            setTempUnit: (tempUnit) => set({ tempUnit }),
            setCountry: (country) => set({ country }),
        }),
        { name: "preference-storage" }
    )
);

// Currency symbols map
export const CURRENCY_SYMBOLS = {
    USD: "$", EUR: "€", GBP: "£", PKR: "Rs", AED: "د.إ", INR: "₹", JPY: "¥", AUD: "A$",
};
