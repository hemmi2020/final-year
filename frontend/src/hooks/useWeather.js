"use client";

import { useState, useEffect } from "react";

const ICON_MAP = {
    "01d": "☀️", "01n": "🌙",
    "02d": "⛅", "02n": "☁️",
    "03d": "☁️", "03n": "☁️",
    "04d": "☁️", "04n": "☁️",
    "09d": "🌧️", "09n": "🌧️",
    "10d": "🌦️", "10n": "🌧️",
    "11d": "⛈️", "11n": "⛈️",
    "13d": "❄️", "13n": "❄️",
    "50d": "🌫️", "50n": "🌫️",
};

const WEATHER_CACHE_TTL = 600000; // 10 minutes in ms

function getCachedWeather(cacheKey) {
    try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
            return cached.data;
        }
    } catch {
        // Ignore parse errors or localStorage unavailability
    }
    return null;
}

function setCachedWeather(cacheKey, data) {
    try {
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
        // Ignore quota errors
    }
}

export function useWeather({ lat, lng, city, unit = "C" } = {}) {
    const [state, setState] = useState({
        temp: null,
        feelsLike: null,
        humidity: null,
        windSpeed: null,
        condition: null,
        city: null,
        description: null,
        icon: null,
        loading: false,
        error: null,
    });

    useEffect(() => {
        // If neither city nor lat/lng are provided, return early
        if (!city && (!lat || !lng)) return;

        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
            setState((s) => ({ ...s, error: "No weather API key" }));
            return;
        }

        let cancelled = false;
        const units = unit === "F" ? "imperial" : "metric";
        const cacheKey = `weather_${city || `${lat},${lng}`}_${unit}`;

        // Build URL: city mode takes priority
        const queryParam = city ? `q=${city}` : `lat=${lat}&lon=${lng}`;
        const url = `https://api.openweathermap.org/data/2.5/weather?${queryParam}&appid=${apiKey}&units=${units}`;

        // Check localStorage cache
        const cached = getCachedWeather(cacheKey);
        if (cached) {
            // Serve cached data immediately (stale-while-revalidate)
            setState({ ...cached, loading: false, error: null });
        } else {
            setState((s) => ({ ...s, loading: true, error: null }));
        }

        // Always fetch in background to revalidate
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                if (data.cod !== 200) {
                    // Only set error if we had no cached data
                    if (!cached) {
                        setState({ temp: null, feelsLike: null, humidity: null, windSpeed: null, condition: null, city: null, description: null, icon: null, loading: false, error: "Weather unavailable" });
                    }
                    return;
                }
                const freshData = {
                    temp: Math.round(data.main.temp),
                    feelsLike: data.main.feels_like,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    condition: data.weather[0].description,
                    city: data.name,
                    description: data.weather[0].description,
                    icon: ICON_MAP[data.weather[0].icon] || "🌡️",
                };
                setCachedWeather(cacheKey, freshData);
                setState({ ...freshData, loading: false, error: null });
            })
            .catch(() => {
                if (!cancelled) {
                    // Only set error if we had no cached data
                    if (!cached) {
                        setState((s) => ({ ...s, loading: false, error: "Weather fetch failed" }));
                    }
                }
            });

        return () => { cancelled = true; };
    }, [lat, lng, city, unit]);

    return state;
}
