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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function buildResult(data, source) {
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
        timezone: data.timezone ?? null,
        locationSource: source,
    };
}

// Try GPS geolocation (returns a promise that resolves with coords or rejects)
function tryGPS() {
    return new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            return reject(new Error('Geolocation not available'));
        }

        // Check if we've already been denied — skip the prompt
        const asked = typeof localStorage !== 'undefined' && localStorage.getItem('gps_permission_asked');
        if (asked === 'denied') {
            return reject(new Error('GPS previously denied'));
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Store that permission was granted
                try { localStorage.setItem('gps_permission_asked', 'granted'); } catch { }
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (err) => {
                // Store that permission was denied/failed so we don't re-prompt
                try { localStorage.setItem('gps_permission_asked', 'denied'); } catch { }
                reject(err);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 300000, // 5 min cache
            }
        );
    });
}

// Reverse geocode GPS coordinates via backend
async function reverseGeocode(lat, lng) {
    const res = await fetch(
        `${API_URL}/api/external/reverse-geocode?lat=${lat}&lng=${lng}`,
        { signal: AbortSignal.timeout(5000) }
    );
    const json = await res.json();
    if (json.success && json.data) {
        return json.data; // expects { city, country, countryCode, ... }
    }
    throw new Error('Reverse geocode failed');
}

// IP-based detection (existing logic, extracted for reuse)
async function detectLocationByIP() {
    // PRIMARY: Use own backend (no CORS, detects real client IP including VPN)
    try {
        const res = await fetch(`${API_URL}/api/external/detect-location`, {
            signal: AbortSignal.timeout(8000),
        });
        const json = await res.json();
        if (json.success && json.data?.countryCode) {
            console.log("[useLocation] Backend detect-location success:", json.data.city, json.data.country);
            return buildResult(json.data, 'ip');
        }
    } catch (e) { console.log("[useLocation] Backend detect-location failed:", e.message); }

    // FALLBACK 1: freeipapi.com (direct, may have CORS issues)
    try {
        const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        if (data.countryCode) {
            console.log("[useLocation] freeipapi.com success:", data.cityName, data.countryName);
            return buildResult({ ...data, city: data.cityName, country: data.countryName, lat: data.latitude, lng: data.longitude, currency: data.currencies?.[0], timezone: data.timeZones?.[0] }, 'ip');
        }
    } catch (e) { console.log("[useLocation] freeipapi.com failed:", e.message); }

    // FALLBACK 2: ipwhois.app
    try {
        const res = await fetch("https://ipwhois.app/json/", { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        if (data.success !== false && data.country_code) {
            console.log("[useLocation] ipwhois.app success:", data.city, data.country);
            return buildResult({ countryCode: data.country_code, city: data.city, country: data.country, lat: data.latitude, lng: data.longitude, currency: data.currency_code }, 'ip');
        }
    } catch (e) { console.log("[useLocation] ipwhois.app failed:", e.message); }

    // Hard fallback
    console.log("[useLocation] All APIs failed, using hard fallback: PK/Karachi/PKR");
    return buildResult({ countryCode: "PK", city: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011, currency: "PKR", timezone: "Asia/Karachi" }, 'ip');
}

async function detectLocation() {
    if (cachedData) return cachedData;
    if (locationPromise) return locationPromise;

    locationPromise = (async () => {
        // Step 1: Try GPS first (higher accuracy)
        try {
            const gpsCoords = await tryGPS();
            console.log("[useLocation] GPS success:", gpsCoords.lat, gpsCoords.lng);

            // Step 2: Reverse geocode to get city/country
            try {
                const geoData = await reverseGeocode(gpsCoords.lat, gpsCoords.lng);
                console.log("[useLocation] Reverse geocode success:", geoData.city, geoData.country);
                cachedData = buildResult({
                    lat: gpsCoords.lat,
                    lng: gpsCoords.lng,
                    city: geoData.city,
                    country: geoData.country,
                    countryCode: geoData.countryCode,
                    currency: geoData.currency,
                    timezone: geoData.timezone,
                }, 'gps');
                return cachedData;
            } catch (rgErr) {
                console.log("[useLocation] Reverse geocode failed, using GPS coords with IP fallback for city/country:", rgErr.message);
                // GPS coords are good but reverse geocode failed
                // Get IP data for city/country info, but keep GPS coordinates
                try {
                    const ipData = await detectLocationByIP();
                    cachedData = {
                        ...ipData,
                        lat: gpsCoords.lat,
                        lng: gpsCoords.lng,
                        locationSource: 'gps',
                    };
                    return cachedData;
                } catch {
                    // Even IP failed — use GPS coords with minimal info
                    cachedData = buildResult({
                        lat: gpsCoords.lat,
                        lng: gpsCoords.lng,
                        countryCode: null,
                        city: null,
                        country: null,
                    }, 'gps');
                    return cachedData;
                }
            }
        } catch (gpsErr) {
            console.log("[useLocation] GPS failed/denied, falling back to IP detection:", gpsErr.message);
        }

        // Step 3: GPS failed — fall through to existing IP detection
        cachedData = await detectLocationByIP();
        return cachedData;
    })();

    return locationPromise;
}

export function useLocation() {
    const [state, setState] = useState({
        lat: null, lng: null, city: null, country: null,
        countryCode: null, currency: null, flag: "🌐", timezone: null,
        loading: true, error: null, locationSource: null,
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
