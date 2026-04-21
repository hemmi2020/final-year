"use client";

import { useState, useEffect } from "react";

const ICON_MAP = {
    "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "☁️",
    "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
    "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌧️",
    "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
    "50d": "🌫️", "50n": "🌫️",
};

const WTTR_ICONS = {
    "113": "☀️", "116": "⛅", "119": "☁️", "122": "☁️",
    "143": "🌫️", "176": "🌦️", "179": "🌨️", "182": "🌨️",
    "185": "🌨️", "200": "⛈️", "227": "❄️", "230": "❄️",
    "248": "🌫️", "260": "🌫️", "263": "🌦️", "266": "🌦️",
    "281": "🌨️", "284": "🌨️", "293": "🌦️", "296": "🌧️",
    "299": "🌧️", "302": "🌧️", "305": "🌧️", "308": "🌧️",
    "311": "🌧️", "314": "🌧️", "317": "🌨️", "320": "🌨️",
    "323": "🌨️", "326": "🌨️", "329": "❄️", "332": "❄️",
    "335": "❄️", "338": "❄️", "350": "🌨️", "353": "🌦️",
    "356": "🌧️", "359": "🌧️", "362": "🌨️", "365": "🌨️",
    "368": "🌨️", "371": "❄️", "374": "🌨️", "377": "🌨️",
    "386": "⛈️", "389": "⛈️", "392": "⛈️", "395": "❄️",
};

const CACHE_TTL = 600000; // 10 minutes

function getCache(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        return Date.now() - ts < CACHE_TTL ? data : null;
    } catch { return null; }
}

function setCache(key, data) {
    try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch { }
}

// Fallback: wttr.in (free, no API key needed, works on HTTPS)
async function fetchFromWttr(cityName, lat, lng) {
    // Try city name first, then lat/lng
    const queries = [];
    if (cityName) queries.push(cityName);
    if (lat && lng) queries.push(`${lat},${lng}`);
    if (queries.length === 0) return null;

    for (const q of queries) {
        try {
            const res = await fetch(
                `https://wttr.in/${encodeURIComponent(q)}?format=j1`,
                { signal: AbortSignal.timeout(5000) }
            );
            const data = await res.json();
            const current = data.current_condition?.[0];
            if (!current) continue;
            const code = current.weatherCode;
            return {
                temp: parseInt(current.temp_C),
                feelsLike: parseInt(current.FeelsLikeC),
                humidity: parseInt(current.humidity),
                windSpeed: parseFloat(current.windspeedKmph),
                condition: current.weatherDesc?.[0]?.value || "Unknown",
                city: cityName || `${lat},${lng}`,
                description: current.weatherDesc?.[0]?.value || "Unknown",
                icon: WTTR_ICONS[code] || "🌡️",
            };
        } catch { }
    }
    return null;
}

export function useWeather({ lat, lng, city, unit = "C" } = {}) {
    const [state, setState] = useState({
        temp: null, feelsLike: null, humidity: null, windSpeed: null,
        condition: null, city: null, description: null, icon: null,
        loading: false, error: null,
    });

    useEffect(() => {
        if (!city && (!lat || !lng)) return;

        let cancelled = false;
        const cacheKey = `weather_${city || `${lat},${lng}`}_C`;

        // Check cache first
        const cached = getCache(cacheKey);
        if (cached) {
            setState({ ...cached, loading: false, error: null });
        } else {
            setState(s => ({ ...s, loading: true, error: null }));
        }

        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

        const fetchWeather = async () => {
            // Try OpenWeatherMap first (if API key exists)
            if (apiKey) {
                try {
                    // Clean city name — remove brackets/parentheses that APIs don't understand
                    const cleanCity = city ? city.replace(/\s*\(.*?\)\s*/g, '').trim() : null;
                    const queryParam = cleanCity ? `q=${encodeURIComponent(cleanCity)}` : `lat=${lat}&lon=${lng}`;
                    const url = `https://api.openweathermap.org/data/2.5/weather?${queryParam}&appid=${apiKey}&units=metric`;
                    console.log("[useWeather] Trying OpenWeatherMap:", city || `${lat},${lng}`);
                    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
                    const data = await res.json();
                    if (data.cod === 200) {
                        const fresh = {
                            temp: Math.round(data.main.temp),
                            feelsLike: Math.round(data.main.feels_like),
                            humidity: data.main.humidity,
                            windSpeed: data.wind.speed,
                            condition: data.weather[0].description,
                            city: data.name,
                            description: data.weather[0].description,
                            icon: ICON_MAP[data.weather[0].icon] || "🌡️",
                        };
                        console.log("[useWeather] OpenWeatherMap success:", fresh.city, fresh.temp + "°C");
                        setCache(cacheKey, fresh);
                        if (!cancelled) setState({ ...fresh, loading: false, error: null });
                        return;
                    }
                    console.log("[useWeather] OpenWeatherMap error:", data.message);
                } catch (e) {
                    console.log("[useWeather] OpenWeatherMap failed:", e.message);
                }
            } else {
                console.log("[useWeather] No OpenWeatherMap API key, skipping");
            }

            // Fallback: wttr.in (free, no key needed)
            const cityName = city || null;
            console.log("[useWeather] Trying wttr.in for:", cityName || `${lat},${lng}`);
            const wttrData = await fetchFromWttr(cityName, lat, lng);
            if (wttrData) {
                console.log("[useWeather] wttr.in success:", wttrData.city, wttrData.temp + "°C");
                setCache(cacheKey, wttrData);
                if (!cancelled) setState({ ...wttrData, loading: false, error: null });
                return;
            }

            // Both failed
            if (!cancelled && !cached) {
                setState(s => ({ ...s, loading: false, error: "Weather unavailable" }));
            }
        };

        fetchWeather();
        return () => { cancelled = true; };
    }, [lat, lng, city, unit]);

    return state;
}
