"use client";

import { useState, useEffect } from "react";

// Convert country code to flag emoji
export function countryCodeToFlag(code) {
    if (!code || code.length !== 2) return "🌍";
    return String.fromCodePoint(
        ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
}

export function useLocation() {
    const [state, setState] = useState({
        lat: null,
        lng: null,
        city: null,
        country: null,
        countryCode: null,
        currency: null,
        flag: "🌍",
        loading: true,
        error: null,
    });

    useEffect(() => {
        async function fetchFromIP() {
            try {
                const res = await fetch(
                    "https://ip-api.com/json/?fields=lat,lon,city,country,countryCode,currency"
                );
                const data = await res.json();
                setState({
                    lat: data.lat ?? null,
                    lng: data.lon ?? null,
                    city: data.city ?? null,
                    country: data.country ?? null,
                    countryCode: data.countryCode ?? null,
                    currency: data.currency ?? null,
                    flag: countryCodeToFlag(data.countryCode),
                    loading: false,
                    error: null,
                });
            } catch {
                setState({
                    lat: null,
                    lng: null,
                    city: null,
                    country: null,
                    countryCode: null,
                    currency: null,
                    flag: "🌍",
                    loading: false,
                    error: "Location unavailable",
                });
            }
        }

        fetchFromIP();
    }, []);

    return state;
}
