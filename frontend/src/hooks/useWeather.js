"use client";

import { useState, useEffect } from "react";

const ICON_MAP = {
    "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "☁️",
    "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
    "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌧️",
    "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
    "50d": "🌫️", "50n": "🌫️",
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

export function useWeather({ lat, lng, city, unit = "C" } = {}) {
    const [state, setState] = useState({
        temp: null, feelsLike: null, humidity: null, windSpeed: null,
        condition: null, city: null, description: null, icon: null,
        loading: false, error: null,
    });

    useEffect(() => {
        if (!city && (!lat || !lng)) return;

        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
            console.log("[useWeather] No API key set");
            setState(s => ({ ...s, error: "No weather API key" }));
            return;
        }

        let cancelled = false;
        // ALWAYS use metric for °C, imperial for °F
        const units = unit === "F" ? "imperial" : "metric";
        const queryParam = city ? `q=${encodeURIComponent(city)}` : `lat=${lat}&lon=${lng}`;
        const cacheKey = `weather_${city || `${lat},${lng}`}_${units}`;
        const url = `https://api.openweathermap.org/data/2.5/weather?${queryParam}&appid=${apiKey}&units=${units}`;

        // Check cache first
        const cached = getCache(cacheKey);
        if (cached) {
            setState({ ...cached, loading: false, error: null });
        } else {
            setState(s => ({ ...s, loading: true, error: null }));
        }

        console.log("[useWeather] Fetching:", city || `${lat},${lng}`, "units:", units);

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (cancelled) return;
                if (data.cod !== 200) {
                    console.log("[useWeather] API error:", data.message);
                    if (!cached) setState(s => ({ ...s, loading: false, error: "Weather unavailable" }));
                    return;
                }
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
                console.log("[useWeather] Success:", fresh.city, fresh.temp + "°");
                setCache(cacheKey, fresh);
                setState({ ...fresh, loading: false, error: null });
            })
            .catch(err => {
                if (!cancelled && !cached) {
                    console.log("[useWeather] Fetch failed:", err.message);
                    setState(s => ({ ...s, loading: false, error: "Weather fetch failed" }));
                }
            });

        return () => { cancelled = true; };
    }, [lat, lng, city, unit]);

    return state;
}
