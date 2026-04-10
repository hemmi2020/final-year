"use client";

import { useState, useEffect } from "react";

// Convert country code to flag emoji
export function countryCodeToFlag(code) {
    if (!code || code.length !== 2) return "🌍";
    return String.fromCodePoint(
        ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
}

// Currency symbol mapping
const CURRENCY_SYMBOLS = {
    PKR: "Rs", USD: "$", EUR: "€", GBP: "£", AED: "د.إ", INR: "₹",
    JPY: "¥", AUD: "A$", CAD: "C$", SAR: "﷼", QAR: "﷼", BDT: "৳",
    TRY: "₺", MYR: "RM", SGD: "S$", THB: "฿", IDR: "Rp", PHP: "₱",
};

export function getCurrencySymbol(code) {
    return CURRENCY_SYMBOLS[code] || code;
}

// Module-level deduplication
let locationPromise = null;
let cachedData = null;

async function detectLocation() {
    if (cachedData) return cachedData;
    if (locationPromise) return locationPromise;

    locationPromise = (async () => {
        // Try ip-api.com first
        try {
            const res = await fetch("https://ip-api.com/json/?fields=lat,lon,city,country,countryCode,currency", { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.countryCode) {
                console.log("[useLocation] ip-api.com success:", data.city, data.country);
                cachedData = {
                    lat: data.lat ?? null, lng: data.lon ?? null,
                    city: data.city ?? null, country: data.country ?? null,
                    countryCode: data.countryCode ?? null, currency: data.currency ?? null,
                    flag: countryCodeToFlag(data.countryCode),
                };
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] ip-api.com failed:", e.message); }

        // Fallback 1: ipapi.co
        try {
            const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.country_code) {
                console.log("[useLocation] ipapi.co success:", data.city, data.country_name);
                cachedData = {
                    lat: data.latitude ?? null, lng: data.longitude ?? null,
                    city: data.city ?? null, country: data.country_name ?? null,
                    countryCode: data.country_code ?? null, currency: data.currency ?? null,
                    flag: countryCodeToFlag(data.country_code),
                };
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] ipapi.co failed:", e.message); }

        // Fallback 2: api.country.is
        try {
            const res = await fetch("https://api.country.is", { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.country) {
                console.log("[useLocation] api.country.is success:", data.country);
                cachedData = {
                    lat: null, lng: null, city: null, country: data.country,
                    countryCode: data.country, currency: null,
                    flag: countryCodeToFlag(data.country),
                };
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] api.country.is failed:", e.message); }

        // Hard fallback — Pakistan
        console.log("[useLocation] All APIs failed, using hard fallback: PK/Karachi");
        cachedData = {
            lat: 24.8607, lng: 67.0011, city: "Karachi", country: "Pakistan",
            countryCode: "PK", currency: "PKR", flag: countryCodeToFlag("PK"),
        };
        return cachedData;
    })();

    return locationPromise;
}

export function useLocation() {
    const [state, setState] = useState({
        lat: null, lng: null, city: null, country: null,
        countryCode: null, currency: null, flag: "🌐", loading: true, error: null,
    });

    useEffect(() => {
        let cancelled = false;
        detectLocation().then((data) => {
            if (cancelled) return;
            setState({ ...data, loading: false, error: null });
        });
        return () => { cancelled = true; };
    }, []);

    return state;
}
