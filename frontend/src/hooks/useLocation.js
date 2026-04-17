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
    CNY: "¥", KRW: "₩", BRL: "R$", ZAR: "R", EGP: "E£", MAD: "MAD",
};

const COUNTRY_CURRENCY = {
    PK: "PKR", US: "USD", GB: "GBP", AE: "AED", IN: "INR", JP: "JPY",
    AU: "AUD", CA: "CAD", SA: "SAR", QA: "QAR", BD: "BDT", TR: "TRY",
    MY: "MYR", SG: "SGD", TH: "THB", ID: "IDR", PH: "PHP", CN: "CNY",
    DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
    KR: "KRW", BR: "BRL", ZA: "ZAR", EG: "EGP", MA: "MAD",
};

export function getCurrencySymbol(code) {
    return CURRENCY_SYMBOLS[code] || code || "$";
}

// Module-level deduplication — resets on full page reload
// Also clears when tab becomes visible again (VPN change detection)
let locationPromise = null;
let cachedData = null;

if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Clear cache when user returns to tab — picks up VPN changes
            locationPromise = null;
            cachedData = null;
        }
    });
}

async function detectLocation() {
    if (cachedData) return cachedData;
    if (locationPromise) return locationPromise;

    locationPromise = (async () => {
        // API 1: freeipapi.com (HTTPS, CORS-friendly, no key)
        try {
            const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.countryCode) {
                const cc = data.countryCode;
                const curr = (data.currencies && data.currencies[0]) || COUNTRY_CURRENCY[cc] || "USD";
                console.log("[useLocation] freeipapi.com success:", data.cityName, data.countryName, curr);
                cachedData = {
                    lat: data.latitude ?? null, lng: data.longitude ?? null,
                    city: data.cityName ?? null, country: data.countryName ?? null,
                    countryCode: cc, currency: curr,
                    flag: countryCodeToFlag(cc),
                };
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] freeipapi.com failed:", e.message); }

        // API 2: ipwhois.app (HTTPS, CORS-friendly, no key)
        try {
            const res = await fetch("https://ipwhois.app/json/", { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.success !== false && data.country_code) {
                const cc = data.country_code;
                const curr = data.currency_code || COUNTRY_CURRENCY[cc] || "USD";
                console.log("[useLocation] ipwhois.app success:", data.city, data.country, curr);
                cachedData = {
                    lat: data.latitude ?? null, lng: data.longitude ?? null,
                    city: data.city ?? null, country: data.country ?? null,
                    countryCode: cc, currency: curr,
                    flag: countryCodeToFlag(cc),
                };
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] ipwhois.app failed:", e.message); }

        // API 3: ipwho.is (HTTPS, no key)
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

        // Hard fallback
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
