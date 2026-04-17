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

// Module-level deduplication — clears on tab visibility change (VPN detection)
let locationPromise = null;
let cachedData = null;

if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            locationPromise = null;
            cachedData = null;
        }
    });
}

function buildResult(data) {
    const cc = data.countryCode;
    const curr = data.currency || COUNTRY_CURRENCY[cc] || "USD";
    return {
        lat: data.lat ?? data.latitude ?? null,
        lng: data.lng ?? data.longitude ?? null,
        city: data.city ?? data.cityName ?? null,
        country: data.country ?? data.countryName ?? null,
        countryCode: cc,
        currency: curr,
        flag: countryCodeToFlag(cc),
    };
}

async function detectLocation() {
    if (cachedData) return cachedData;
    if (locationPromise) return locationPromise;

    locationPromise = (async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        // PRIMARY: Use own backend (no CORS, detects real client IP including VPN)
        try {
            const res = await fetch(`${API_URL}/api/external/detect-location`, {
                signal: AbortSignal.timeout(8000),
            });
            const json = await res.json();
            if (json.success && json.data?.countryCode) {
                console.log("[useLocation] Backend detect-location success:", json.data.city, json.data.country);
                cachedData = buildResult(json.data);
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] Backend detect-location failed:", e.message); }

        // FALLBACK 1: freeipapi.com (direct, may have CORS issues)
        try {
            const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.countryCode) {
                console.log("[useLocation] freeipapi.com success:", data.cityName, data.countryName);
                cachedData = buildResult({ ...data, city: data.cityName, country: data.countryName, lat: data.latitude, lng: data.longitude, currency: data.currencies?.[0] });
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] freeipapi.com failed:", e.message); }

        // FALLBACK 2: ipwhois.app
        try {
            const res = await fetch("https://ipwhois.app/json/", { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.success !== false && data.country_code) {
                console.log("[useLocation] ipwhois.app success:", data.city, data.country);
                cachedData = buildResult({ countryCode: data.country_code, city: data.city, country: data.country, lat: data.latitude, lng: data.longitude, currency: data.currency_code });
                return cachedData;
            }
        } catch (e) { console.log("[useLocation] ipwhois.app failed:", e.message); }

        // Hard fallback
        console.log("[useLocation] All APIs failed, using hard fallback: PK/Karachi/PKR");
        cachedData = buildResult({ countryCode: "PK", city: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011, currency: "PKR" });
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
