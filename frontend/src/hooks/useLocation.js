"use client";

import { useState, useEffect } from "react";

// Convert country code to flag emoji
function countryCodeToFlag(code) {
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
        flag: "🌍",
        loading: true,
        error: null,
    });

    useEffect(() => {
        // Try browser geolocation first
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                            { headers: { "User-Agent": "TravelFyAI/1.0" } }
                        );
                        const data = await res.json();
                        const city =
                            data?.address?.city ||
                            data?.address?.town ||
                            data?.address?.village ||
                            data?.address?.state ||
                            null;
                        const countryCode = data?.address?.country_code?.toUpperCase() || null;
                        setState({
                            lat: latitude,
                            lng: longitude,
                            city,
                            country: data?.address?.country || null,
                            countryCode,
                            flag: countryCodeToFlag(countryCode),
                            loading: false,
                            error: null,
                        });
                    } catch {
                        // Geolocation worked but reverse geocode failed — still have coords
                        setState((s) => ({
                            ...s,
                            lat: latitude,
                            lng: longitude,
                            loading: false,
                            error: null,
                        }));
                    }
                },
                () => {
                    // Geolocation denied — fall back to IP-based detection
                    fetchFromIP();
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
            );
        } else {
            // No geolocation support — fall back to IP
            fetchFromIP();
        }

        async function fetchFromIP() {
            try {
                const res = await fetch("https://ip-api.com/json/?fields=lat,lon,city,country,countryCode");
                const data = await res.json();
                setState({
                    lat: data.lat || null,
                    lng: data.lon || null,
                    city: data.city || null,
                    country: data.country || null,
                    countryCode: data.countryCode || null,
                    flag: countryCodeToFlag(data.countryCode),
                    loading: false,
                    error: null,
                });
            } catch {
                setState((s) => ({ ...s, loading: false, error: "Location unavailable" }));
            }
        }
    }, []);

    return state;
}
