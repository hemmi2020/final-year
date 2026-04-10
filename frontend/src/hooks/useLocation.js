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

// Country code → currency code mapping (for APIs that don't return currency)
const COUNTRY_CURRENCY = {
    PK: "PKR", US: "USD", GB: "GBP", AE: "AED", IN: "INR", JP: "JPY",
    AU: "AUD", CA: "CAD", SA: "SAR", QA: "QAR", BD: "BDT", TR: "TRY",
    MY: "MYR", SG: "SGD", TH: "THB", ID: "IDR", PH: "PHP", CN: "CNY",
    DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
    AT: "EUR", PT: "EUR", IE: "EUR", GR: "EUR", FI: "EUR",
};

export function getCurrencySymbol(code) {
    return CURRENCY_SYMBOLS[code] || code || "$";
}

// Module-level deduplication
let locationPromise = null;
let cachedData = null;

async function detectLocation() {
    if (cachedData) return cachedData;
    if (locationPromise) return locationPromise;

    locationPromise = (async () => {
        // API 1: ipapi.co (works on HTTPS, free, no key needed)
        try {
            const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.country_code) {
                const cc = data.country_code;
                const curr = data.currency || COUNTRY_CURRENCY[cc] || "USD";
                console.log("[useLocation] ipapi.co success:", data.city, data.country_name, curr);
                cachedData = {
                    lat: data.latitude ?? null, lng: data.longitude ?? null,
                    city: data.city ?? null, country: data.country_name ?? null,
                    countryCode: cc, currency: curr,
                    flag: countryCodeToFlag(cc),
                };
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] ipapi.co failed:", e.message); }

        // API 2: ip-api.com (HTTP only — works in dev, may fail on HTTPS deployed sites)
        try {
            const res = await fetch("http://ip-api.com/json/?fields=lat,lon,city,country,countryCode,currency", { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.countryCode) {
                console.log("[useLocation] ip-api.com success:", data.city, data.country);
                cachedData = {
                    lat: data.lat ?? null, lng: data.lon ?? null,
                    city: data.city ?? null, country: data.country ?? null,
                    countryCode: data.countryCode, currency: data.currency ?? COUNTRY_CURRENCY[data.countryCode] ?? "USD",
                    flag: countryCodeToFlag(data.countryCode),
                };
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] ip-api.com failed:", e.message); }

        // API 3: ipwho.is (HTTPS, free, no key)
        try {
            const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.success !== false && data.country_code) {
                const cc = data.country_code;
                const curr = data.currency?.code || COUNTRY_CURRENCY[cc] || "USD";
                console.log("[useLocation] ipwho.is success:", data.city, data.country, curr);
                cachedData = {
                    lat: data.latitude ?? null, lng: data.longitude ?? null,
                    city: data.city ?? null, country: data.country ?? null,
                    countryCode: cc, currency: curr,
                    flag: countryCodeToFlag(cc),
                };
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] ipwho.is failed:", e.message); }

        // Hard fallback — Pakistan
        console.log("[useLocation] All APIs failed, using hard fallback: PK/Karachi/PKR");
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
