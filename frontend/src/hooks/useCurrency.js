"use client";

import { useState, useEffect } from "react";
import { externalAPI } from "@/lib/api";

const CURRENCY_CACHE_TTL = 3600000; // 1 hour in ms

function getCachedRate(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (Date.now() - cached.timestamp < CURRENCY_CACHE_TTL) {
            return cached.rate;
        }
    } catch {
        // Ignore parse errors or localStorage unavailability
    }
    return null;
}

function setCachedRate(key, rate) {
    try {
        localStorage.setItem(key, JSON.stringify({ rate, timestamp: Date.now() }));
    } catch {
        // Ignore quota errors
    }
}

export function useCurrency(from = "USD", to) {
    const [state, setState] = useState({
        rate: null,
        loading: false,
        error: null,
    });

    useEffect(() => {
        if (!from || !to || from === to) {
            setState({ rate: from === to ? 1 : null, loading: false, error: null });
            return;
        }

        let cancelled = false;
        const cacheKey = `currency_${from}_${to}`;

        // Check localStorage cache
        const cached = getCachedRate(cacheKey);
        if (cached) {
            // Serve cached data immediately (stale-while-revalidate)
            setState({ rate: cached, loading: false, error: null });
        } else {
            setState((s) => ({ ...s, loading: true, error: null }));
        }

        // Always fetch in background to revalidate
        externalAPI
            .currency(from, to)
            .then(({ data }) => {
                if (cancelled) return;
                const rate = data?.data?.rate;
                if (rate) {
                    setCachedRate(cacheKey, rate);
                    setState({ rate, loading: false, error: null });
                } else {
                    throw new Error("No rate from backend");
                }
            })
            .catch(() => {
                if (cancelled) return;
                // Fallback: free open exchange rate API (no key needed)
                fetch(`https://open.er-api.com/v6/latest/${from}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (cancelled) return;
                        const rate = data?.rates?.[to];
                        if (rate) {
                            setCachedRate(cacheKey, rate);
                        }
                        setState({ rate: rate ?? null, loading: false, error: rate ? null : "Rate unavailable" });
                    })
                    .catch(() => {
                        if (!cancelled) {
                            // Only set error if we had no cached data
                            if (!cached) {
                                setState({ rate: null, loading: false, error: "Currency fetch failed" });
                            }
                        }
                    });
            });

        return () => { cancelled = true; };
    }, [from, to]);

    return state;
}
