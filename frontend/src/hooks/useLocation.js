"use client";

import { useState, useEffect } from "react";

// Convert country code to flag emoji
export function countryCodeToFlag(code) {
    if (!code || code.length !== 2) return "🌍";
    return String.fromCodePoint(
        ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
}

// Module-level promise deduplication — ensures ip-api.com is fetched exactly once
let locationPromise = null;
let cachedData = null;

function fetchFromIP() {
    // If we already have resolved data, return it immediately
    if (cachedData) {
        return Promise.resolve(cachedData);
    }

    // If a fetch is already in-flight, return the existing promise (deduplication)
    if (locationPromise) {
        return locationPromise;
    }

    // First call — create the fetch and assign to module-level variable
    locationPromise = fetch(
        "https://ip-api.com/json/?fields=lat,lon,city,country,countryCode,currency"
    )
        .then((res) => res.json())
        .then((data) => {
            cachedData = {
                lat: data.lat ?? null,
                lng: data.lon ?? null,
                city: data.city ?? null,
                country: data.country ?? null,
                countryCode: data.countryCode ?? null,
                currency: data.currency ?? null,
                flag: countryCodeToFlag(data.countryCode),
            };
            return cachedData;
        })
        .catch(() => {
            // On error, clear the promise so a future mount can retry
            locationPromise = null;
            return null;
        });

    return locationPromise;
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
        let cancelled = false;

        fetchFromIP().then((data) => {
            if (cancelled) return;

            if (data) {
                setState({
                    ...data,
                    loading: false,
                    error: null,
                });
            } else {
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
        });

        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}
