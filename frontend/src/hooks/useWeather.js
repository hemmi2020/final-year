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

export function useWeather(lat, lng, unit = "C") {
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
        if (!lat || !lng) return;

        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
            setState((s) => ({ ...s, error: "No weather API key" }));
            return;
        }

        let cancelled = false;
        setState((s) => ({ ...s, loading: true, error: null }));

        const units = unit === "F" ? "imperial" : "metric";

        fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=${units}`
        )
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                if (data.cod !== 200) {
                    setState({ temp: null, feelsLike: null, humidity: null, windSpeed: null, condition: null, city: null, description: null, icon: null, loading: false, error: "Weather unavailable" });
                    return;
                }
                setState({
                    temp: Math.round(data.main.temp),
                    feelsLike: data.main.feels_like,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    condition: data.weather[0].description,
                    city: data.name,
                    description: data.weather[0].description,
                    icon: ICON_MAP[data.weather[0].icon] || "🌡️",
                    loading: false,
                    error: null,
                });
            })
            .catch(() => {
                if (!cancelled) setState((s) => ({ ...s, loading: false, error: "Weather fetch failed" }));
            });

        return () => { cancelled = true; };
    }, [lat, lng, unit]);

    return state;
}
