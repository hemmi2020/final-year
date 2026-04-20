"use client";

import { useState, useEffect, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "tripState";

const REQUIRED_FIELDS = [
    "destination",
    "duration",
    "travelCompanion",
    "vibe",
    "budget",
];

const QUESTION_SEQUENCE = [
    {
        field: "destination",
        prompt: "Where would you like to go? Tell me your dream destination!",
        chipType: "destination",
        multiSelect: false,
    },
    {
        field: "duration",
        prompt: "How long would you like your trip to be?",
        chipType: "duration",
        multiSelect: false,
    },
    {
        field: "travelCompanion",
        prompt: "Who are you traveling with?",
        chipType: "travelCompanion",
        multiSelect: false,
    },
    {
        field: "vibe",
        prompt: "What kind of vibe are you looking for? Pick as many as you like!",
        chipType: "vibe",
        multiSelect: true,
    },
    {
        field: "budget",
        prompt: "What's your budget range for this trip?",
        chipType: "budget",
        multiSelect: false,
    },
];

// ── Initial state factory ──────────────────────────────────────────────────────

function createInitialTripState() {
    return {
        destination: null,
        origin: null,
        duration: null,
        travelCompanion: null,
        vibe: null,
        budget: null,
        dates: null,
        isComplete: false,
    };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function checkComplete(state) {
    return REQUIRED_FIELDS.every((f) => state[f] != null);
}

function loadFromSessionStorage() {
    try {
        if (typeof window === "undefined") return null;
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // Recompute isComplete from the persisted fields
        parsed.isComplete = checkComplete(parsed);
        return parsed;
    } catch {
        return null;
    }
}

function saveToSessionStorage(state) {
    try {
        if (typeof window === "undefined") return;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Graceful degradation — state works in-memory only
    }
}

function clearSessionStorage() {
    try {
        if (typeof window === "undefined") return;
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // Ignore
    }
}

// ── getNextQuestion (pure function, exported for testing) ──────────────────────

export function getNextQuestionFromState(tripState) {
    for (const q of QUESTION_SEQUENCE) {
        if (tripState[q.field] == null) {
            return { ...q };
        }
    }
    return null;
}

// ── extractFields (free-text field extraction) ─────────────────────────────────

const VIBE_KEYWORDS = [
    "history",
    "food",
    "shopping",
    "adventure",
    "nature",
    "nightlife",
    "culture",
    "relaxation",
];

const COMPANION_PATTERNS = [
    { pattern: /\b(solo|alone)\b/i, value: "Solo" },
    { pattern: /\bwith\s+friends\b/i, value: "With friends" },
    { pattern: /\bfamily\b/i, value: "Family" },
    { pattern: /\bcouple\b/i, value: "Couple" },
];

const BUDGET_PATTERNS = [
    { pattern: /\b(mid[\s-]?range|midrange)\b/i, value: "Mid-range" },
    { pattern: /\b(luxury|expensive)\b/i, value: "Luxury" },
    { pattern: /\b(budget|cheap)\b/i, value: "Budget" },
];

// Well-known destinations for quick matching
const KNOWN_DESTINATIONS = [
    "istanbul", "paris", "london", "dubai", "tokyo", "bali", "rome", "barcelona",
    "new york", "bangkok", "maldives", "lahore", "karachi", "islamabad", "singapore",
    "kuala lumpur", "sydney", "melbourne", "toronto", "vancouver", "amsterdam",
    "berlin", "munich", "vienna", "prague", "budapest", "athens", "cairo",
    "marrakech", "cape town", "nairobi", "mumbai", "delhi", "goa", "jaipur",
    "seoul", "osaka", "hong kong", "shanghai", "beijing", "taipei", "hanoi",
    "ho chi minh", "phuket", "chiang mai", "siem reap", "petra", "doha",
    "riyadh", "jeddah", "muscat", "tbilisi", "baku", "tashkent", "zanzibar",
    "santorini", "mykonos", "dubrovnik", "lisbon", "porto", "madrid", "seville",
    "florence", "venice", "milan", "zurich", "geneva", "edinburgh", "dublin",
    "reykjavik", "stockholm", "copenhagen", "oslo", "helsinki", "tallinn", "riga",
    "warsaw", "krakow", "bucharest", "sofia", "belgrade", "sarajevo", "tirana",
    "montenegro", "malta", "cyprus", "mauritius", "seychelles", "fiji",
    "hawaii", "cancun", "mexico city", "bogota", "lima", "buenos aires",
    "rio de janeiro", "sao paulo", "santiago", "cusco", "cartagena",
];

export function extractFields(text) {
    if (!text || typeof text !== "string" || text.trim() === "") {
        return {};
    }

    const result = {};

    // ── Destination detection ────────────────────────────────────────────────
    // Match "to {Place}", "visit {Place}", "trip to {Place}", "go to {Place}" (case-insensitive)
    const destinationPatterns = [
        /\b(?:trip\s+to|go\s+to|visit|travel\s+to|fly\s+to|heading\s+to)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)/i,
    ];

    for (const pat of destinationPatterns) {
        const match = text.match(pat);
        if (match) {
            result.destination = match[1].trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            break;
        }
    }

    // Fallback: standalone capitalized place name (2+ letters, not at sentence start after period)
    if (!result.destination) {
        // Look for capitalized words that look like place names (not common English words)
        const commonWords = new Set([
            "I", "The", "My", "We", "Our", "This", "That", "It", "He", "She",
            "They", "What", "Where", "When", "How", "Who", "Why", "Can", "Could",
            "Would", "Should", "Will", "Want", "Like", "Love", "Need", "Looking",
            "Maybe", "Also", "And", "But", "For", "With", "About", "Some", "Any",
            "Solo", "Family", "Couple", "Budget", "Luxury", "History", "Food",
            "Shopping", "Adventure", "Nature", "Nightlife", "Culture", "Relaxation",
            "Mid", "Cheap", "Expensive", "Days", "Weeks", "Week", "Day", "Custom",
            "Alone", "Friends",
        ]);
        const placeMatch = text.match(
            /\b([A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{2,})*)\b/g
        );
        if (placeMatch) {
            for (const candidate of placeMatch) {
                const words = candidate.split(/\s+/);
                const isCommon = words.every((w) => commonWords.has(w));
                if (!isCommon) {
                    result.destination = candidate.trim();
                    break;
                }
            }
        }
    }

    // Check against known destinations (case-insensitive)
    if (!result.destination) {
        const lower = text.toLowerCase().trim();
        const found = KNOWN_DESTINATIONS.find(d => lower === d || lower.includes(d));
        if (found) {
            result.destination = found.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
    }

    // Last resort: if text is 1-3 words, all start with uppercase, and no other fields matched
    if (!result.destination && !result.duration && !result.travelCompanion && !result.budget) {
        const words = text.trim().split(/\s+/);
        if (words.length <= 3 && words.length >= 1) {
            const looksLikePlace = words.every(w => /^[A-Z]/.test(w));
            if (looksLikePlace) {
                result.destination = text.trim();
            }
        }
    }

    // ── Duration detection ───────────────────────────────────────────────────
    // Match "X days", "X weeks", "a week", "1 week", "3 days", etc.
    const durationMatch = text.match(
        /\b(\d+)\s*(days?|weeks?)\b/i
    );
    if (durationMatch) {
        const num = parseInt(durationMatch[1], 10);
        const unit = durationMatch[2].toLowerCase().startsWith("w")
            ? num === 1 ? "week" : "weeks"
            : num === 1 ? "day" : "days";
        result.duration = `${num} ${unit}`;
    } else {
        // Match "a week", "a day"
        const aWeekMatch = text.match(/\b(a|one)\s+(week|day)\b/i);
        if (aWeekMatch) {
            result.duration = `1 ${aWeekMatch[2].toLowerCase()}`;
        }
    }

    // ── Companion detection ──────────────────────────────────────────────────
    for (const { pattern, value } of COMPANION_PATTERNS) {
        if (pattern.test(text)) {
            result.travelCompanion = value;
            break;
        }
    }

    // ── Vibe detection ───────────────────────────────────────────────────────
    const matchedVibes = VIBE_KEYWORDS.filter((v) =>
        new RegExp(`\\b${v}\\b`, "i").test(text)
    ).map((v) => v.charAt(0).toUpperCase() + v.slice(1));

    if (matchedVibes.length > 0) {
        result.vibe = matchedVibes;
    }

    // ── Budget detection ─────────────────────────────────────────────────────
    for (const { pattern, value } of BUDGET_PATTERNS) {
        if (pattern.test(text)) {
            result.budget = value;
            break;
        }
    }

    return result;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useTripState(userLocation) {
    const [tripState, setTripState] = useState(() => {
        const restored = loadFromSessionStorage();
        return restored || createInitialTripState();
    });

    const [chatStage, setChatStage] = useState("greeting");

    // Auto-fill origin from userLocation when it becomes available
    useEffect(() => {
        if (userLocation && userLocation.city && tripState.origin == null) {
            setTripState((prev) => {
                const next = { ...prev, origin: userLocation.city };
                saveToSessionStorage(next);
                return next;
            });
        }
    }, [userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

    // Persist to sessionStorage whenever tripState changes (after initial mount)
    const mounted = useState(false);
    useEffect(() => {
        if (!mounted[0]) {
            mounted[0] = true;
            return;
        }
        saveToSessionStorage(tripState);
    }, [tripState]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── updateField ──────────────────────────────────────────────────────────────

    const updateField = useCallback((field, value) => {
        setTripState((prev) => {
            const next = { ...prev, [field]: value };
            next.isComplete = checkComplete(next);
            saveToSessionStorage(next);
            return next;
        });
    }, []);

    // ── getNextQuestion ──────────────────────────────────────────────────────────

    const getNextQuestion = useCallback(() => {
        return getNextQuestionFromState(tripState);
    }, [tripState]);

    // ── isComplete ───────────────────────────────────────────────────────────────

    const isComplete = tripState.isComplete;

    // ── reset ────────────────────────────────────────────────────────────────────

    const reset = useCallback(() => {
        clearSessionStorage();
        setTripState(createInitialTripState());
        setChatStage("greeting");
    }, []);

    return {
        tripState,
        updateField,
        extractFields,
        getNextQuestion,
        isComplete,
        reset,
        chatStage,
        setChatStage,
    };
}
