"use client";

import { useState, useEffect } from "react";
import { externalAPI } from "@/lib/api";

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
        setState((s) => ({ ...s, loading: true, error: null }));

        // Try backend first, fall back to free open API
        externalAPI
            .currency(from, to)
            .then(({ data }) => {
                if (cancelled) return;
                const rate = data?.data?.rate;
                if (rate) {
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
                        setState({ rate: rate ?? null, loading: false, error: rate ? null : "Rate unavailable" });
                    })
                    .catch(() => {
                        if (!cancelled) setState({ rate: null, loading: false, error: "Currency fetch failed" });
                    });
            });

        return () => { cancelled = true; };
    }, [from, to]);

    return state;
}
