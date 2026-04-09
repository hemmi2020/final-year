import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePreferenceStore = create(
    persist(
        (set) => ({
            destinationCurrency: "USD",
            tempUnit: "C",

            setDestinationCurrency: (destinationCurrency) => set({ destinationCurrency }),
            setTempUnit: (tempUnit) => set({ tempUnit }),
        }),
        { name: "preference-storage" }
    )
);

// Currency symbols map
export const CURRENCY_SYMBOLS = {
    USD: "$", EUR: "€", GBP: "£", PKR: "Rs", AED: "د.إ", INR: "₹", JPY: "¥", AUD: "A$",
};
