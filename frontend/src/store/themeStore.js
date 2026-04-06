import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
    persist(
        (set, get) => ({
            dark: false,
            toggle: () => {
                const next = !get().dark;
                set({ dark: next });
                if (typeof document !== "undefined") {
                    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
                }
            },
            init: () => {
                if (typeof document !== "undefined") {
                    document.documentElement.setAttribute("data-theme", get().dark ? "dark" : "light");
                }
            },
        }),
        { name: "theme-storage" }
    )
);
