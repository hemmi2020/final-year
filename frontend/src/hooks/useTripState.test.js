import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
    useTripState,
    getNextQuestionFromState,
    extractFields,
} from "./useTripState";

// ── Helpers ────────────────────────────────────────────────────────────────────

function createFullState(overrides = {}) {
    return {
        destination: "Istanbul",
        origin: "Karachi",
        duration: "1 week",
        travelCompanion: "Solo",
        vibe: ["History", "Food"],
        budget: "Mid-range",
        dates: null,
        isComplete: true,
        ...overrides,
    };
}

// ── Setup ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
    sessionStorage.clear();
});

// ── Initialization ─────────────────────────────────────────────────────────────

describe("useTripState — initialization", () => {
    it("initializes with all fields null and isComplete false", () => {
        const { result } = renderHook(() => useTripState(null));
        const { tripState, isComplete } = result.current;

        expect(tripState.destination).toBeNull();
        expect(tripState.origin).toBeNull();
        expect(tripState.duration).toBeNull();
        expect(tripState.travelCompanion).toBeNull();
        expect(tripState.vibe).toBeNull();
        expect(tripState.budget).toBeNull();
        expect(tripState.dates).toBeNull();
        expect(isComplete).toBe(false);
    });

    it("restores TripState from sessionStorage on mount", () => {
        const saved = createFullState();
        sessionStorage.setItem("tripState", JSON.stringify(saved));

        const { result } = renderHook(() => useTripState(null));
        expect(result.current.tripState.destination).toBe("Istanbul");
        expect(result.current.tripState.duration).toBe("1 week");
        expect(result.current.isComplete).toBe(true);
    });

    it("auto-fills origin from userLocation", () => {
        const location = { city: "Lahore", lat: 31.5, lng: 74.3 };
        const { result } = renderHook(() => useTripState(location));

        expect(result.current.tripState.origin).toBe("Lahore");
    });

    it("chatStage defaults to greeting", () => {
        const { result } = renderHook(() => useTripState(null));
        expect(result.current.chatStage).toBe("greeting");
    });
});

// ── updateField ────────────────────────────────────────────────────────────────

describe("useTripState — updateField", () => {
    it("sets a field value and persists to sessionStorage", () => {
        const { result } = renderHook(() => useTripState(null));

        act(() => {
            result.current.updateField("destination", "Tokyo");
        });

        expect(result.current.tripState.destination).toBe("Tokyo");

        const stored = JSON.parse(sessionStorage.getItem("tripState"));
        expect(stored.destination).toBe("Tokyo");
    });

    it("sets isComplete to true when all required fields are filled", () => {
        const { result } = renderHook(() => useTripState(null));

        act(() => {
            result.current.updateField("destination", "Paris");
            result.current.updateField("duration", "3 days");
            result.current.updateField("travelCompanion", "Solo");
            result.current.updateField("vibe", ["Culture"]);
            result.current.updateField("budget", "Budget");
        });

        expect(result.current.isComplete).toBe(true);
    });

    it("keeps isComplete false when some required fields are missing", () => {
        const { result } = renderHook(() => useTripState(null));

        act(() => {
            result.current.updateField("destination", "Paris");
            result.current.updateField("duration", "3 days");
        });

        expect(result.current.isComplete).toBe(false);
    });
});

// ── getNextQuestion ────────────────────────────────────────────────────────────

describe("useTripState — getNextQuestion", () => {
    it("returns destination question first when all fields are null", () => {
        const { result } = renderHook(() => useTripState(null));
        const q = result.current.getNextQuestion();

        expect(q).not.toBeNull();
        expect(q.field).toBe("destination");
        expect(q.chipType).toBe("destination");
    });

    it("skips filled fields and returns the next unfilled one", () => {
        const { result } = renderHook(() => useTripState(null));

        act(() => {
            result.current.updateField("destination", "Rome");
        });

        const q = result.current.getNextQuestion();
        expect(q.field).toBe("duration");
    });

    it("returns null when all required fields are filled", () => {
        const { result } = renderHook(() => useTripState(null));

        act(() => {
            result.current.updateField("destination", "Rome");
            result.current.updateField("duration", "1 week");
            result.current.updateField("travelCompanion", "Family");
            result.current.updateField("vibe", ["Food"]);
            result.current.updateField("budget", "Luxury");
        });

        expect(result.current.getNextQuestion()).toBeNull();
    });

    it("follows strict ordering: destination → duration → travelCompanion → vibe → budget", () => {
        const expectedOrder = [
            "destination",
            "duration",
            "travelCompanion",
            "vibe",
            "budget",
        ];
        const { result } = renderHook(() => useTripState(null));

        for (const field of expectedOrder) {
            const q = result.current.getNextQuestion();
            expect(q.field).toBe(field);

            act(() => {
                const value = field === "vibe" ? ["Adventure"] : "test-value";
                result.current.updateField(field, value);
            });
        }

        expect(result.current.getNextQuestion()).toBeNull();
    });
});

// ── getNextQuestionFromState (pure function) ───────────────────────────────────

describe("getNextQuestionFromState", () => {
    it("returns destination for a fresh state", () => {
        const state = {
            destination: null,
            duration: null,
            travelCompanion: null,
            vibe: null,
            budget: null,
        };
        expect(getNextQuestionFromState(state).field).toBe("destination");
    });

    it("skips to vibe when destination, duration, and travelCompanion are filled", () => {
        const state = {
            destination: "Berlin",
            duration: "5 days",
            travelCompanion: "Couple",
            vibe: null,
            budget: null,
        };
        expect(getNextQuestionFromState(state).field).toBe("vibe");
    });

    it("returns null when all fields are filled", () => {
        const state = {
            destination: "Berlin",
            duration: "5 days",
            travelCompanion: "Couple",
            vibe: ["Nature"],
            budget: "Budget",
        };
        expect(getNextQuestionFromState(state)).toBeNull();
    });
});

// ── reset ──────────────────────────────────────────────────────────────────────

describe("useTripState — reset", () => {
    it("clears sessionStorage and resets all fields to null", () => {
        const { result } = renderHook(() => useTripState(null));

        act(() => {
            result.current.updateField("destination", "Dubai");
            result.current.updateField("duration", "3 days");
        });

        expect(result.current.tripState.destination).toBe("Dubai");

        act(() => {
            result.current.reset();
        });

        expect(result.current.tripState.destination).toBeNull();
        expect(result.current.tripState.duration).toBeNull();
        expect(result.current.isComplete).toBe(false);
        expect(sessionStorage.getItem("tripState")).toBeNull();
    });

    it("resets chatStage to greeting", () => {
        const { result } = renderHook(() => useTripState(null));

        act(() => {
            result.current.setChatStage("asking");
        });
        expect(result.current.chatStage).toBe("asking");

        act(() => {
            result.current.reset();
        });
        expect(result.current.chatStage).toBe("greeting");
    });
});

// ── chatStage ──────────────────────────────────────────────────────────────────

describe("useTripState — chatStage", () => {
    it("allows setting chatStage to valid values", () => {
        const { result } = renderHook(() => useTripState(null));

        for (const stage of ["greeting", "asking", "generating", "ready"]) {
            act(() => {
                result.current.setChatStage(stage);
            });
            expect(result.current.chatStage).toBe(stage);
        }
    });
});

// ── extractFields ──────────────────────────────────────────────────────────────

describe("extractFields — empty/null input", () => {
    it("returns empty object for empty string", () => {
        expect(extractFields("")).toEqual({});
    });

    it("returns empty object for null", () => {
        expect(extractFields(null)).toEqual({});
    });

    it("returns empty object for undefined", () => {
        expect(extractFields(undefined)).toEqual({});
    });

    it("returns empty object for whitespace-only string", () => {
        expect(extractFields("   ")).toEqual({});
    });
});

describe("extractFields — destination detection", () => {
    it('detects "trip to {Place}" pattern', () => {
        const result = extractFields("I want a trip to Istanbul");
        expect(result.destination).toBe("Istanbul");
    });

    it('detects "go to {Place}" pattern', () => {
        const result = extractFields("Let's go to Paris");
        expect(result.destination).toBe("Paris");
    });

    it('detects "visit {Place}" pattern', () => {
        const result = extractFields("I want to visit Tokyo");
        expect(result.destination).toBe("Tokyo");
    });

    it('detects "travel to {Place}" pattern', () => {
        const result = extractFields("I want to travel to Dubai");
        expect(result.destination).toBe("Dubai");
    });

    it("detects multi-word destination", () => {
        const result = extractFields("trip to New York");
        expect(result.destination).toBe("New York");
    });

    it("detects standalone capitalized place name as fallback", () => {
        const result = extractFields("I'm thinking about Barcelona for vacation");
        expect(result.destination).toBe("Barcelona");
    });
});

describe("extractFields — duration detection", () => {
    it('detects "X days" pattern', () => {
        const result = extractFields("I want to go for 3 days");
        expect(result.duration).toBe("3 days");
    });

    it('detects "1 week" pattern', () => {
        const result = extractFields("maybe 1 week");
        expect(result.duration).toBe("1 week");
    });

    it('detects "2 weeks" pattern', () => {
        const result = extractFields("about 2 weeks");
        expect(result.duration).toBe("2 weeks");
    });

    it('detects "a week" pattern', () => {
        const result = extractFields("I have a week off");
        expect(result.duration).toBe("1 week");
    });

    it('detects "a day" pattern', () => {
        const result = extractFields("just a day trip");
        expect(result.duration).toBe("1 day");
    });

    it("uses singular form for 1 day", () => {
        const result = extractFields("1 day trip");
        expect(result.duration).toBe("1 day");
    });
});

describe("extractFields — companion detection", () => {
    it('detects "solo"', () => {
        const result = extractFields("I'm traveling solo");
        expect(result.travelCompanion).toBe("Solo");
    });

    it('detects "alone"', () => {
        const result = extractFields("going alone");
        expect(result.travelCompanion).toBe("Solo");
    });

    it('detects "with friends"', () => {
        const result = extractFields("traveling with friends");
        expect(result.travelCompanion).toBe("With friends");
    });

    it('detects "family"', () => {
        const result = extractFields("a family trip");
        expect(result.travelCompanion).toBe("Family");
    });

    it('detects "couple"', () => {
        const result = extractFields("we are a couple");
        expect(result.travelCompanion).toBe("Couple");
    });
});

describe("extractFields — vibe detection", () => {
    it("detects single vibe keyword", () => {
        const result = extractFields("I love history");
        expect(result.vibe).toEqual(["History"]);
    });

    it("detects multiple vibe keywords", () => {
        const result = extractFields("I want food and adventure");
        expect(result.vibe).toEqual(["Food", "Adventure"]);
    });

    it("detects all known vibe keywords", () => {
        const text =
            "history food shopping adventure nature nightlife culture relaxation";
        const result = extractFields(text);
        expect(result.vibe).toEqual([
            "History",
            "Food",
            "Shopping",
            "Adventure",
            "Nature",
            "Nightlife",
            "Culture",
            "Relaxation",
        ]);
    });

    it("is case-insensitive for vibes", () => {
        const result = extractFields("ADVENTURE and FOOD");
        expect(result.vibe).toEqual(["Food", "Adventure"]);
    });
});

describe("extractFields — budget detection", () => {
    it('detects "budget"', () => {
        const result = extractFields("on a budget");
        expect(result.budget).toBe("Budget");
    });

    it('detects "cheap"', () => {
        const result = extractFields("something cheap");
        expect(result.budget).toBe("Budget");
    });

    it('detects "mid-range"', () => {
        const result = extractFields("mid-range hotels");
        expect(result.budget).toBe("Mid-range");
    });

    it('detects "midrange"', () => {
        const result = extractFields("midrange hotels please");
        expect(result.budget).toBe("Mid-range");
    });

    it('detects "luxury"', () => {
        const result = extractFields("luxury experience");
        expect(result.budget).toBe("Luxury");
    });

    it('detects "expensive"', () => {
        const result = extractFields("something expensive");
        expect(result.budget).toBe("Luxury");
    });
});

describe("extractFields — multi-field extraction", () => {
    it("extracts destination and duration from one message", () => {
        const result = extractFields("trip to Rome for 5 days");
        expect(result.destination).toBe("Rome");
        expect(result.duration).toBe("5 days");
    });

    it("extracts destination, duration, and companion", () => {
        const result = extractFields(
            "I want to visit Paris for 1 week solo"
        );
        expect(result.destination).toBe("Paris");
        expect(result.duration).toBe("1 week");
        expect(result.travelCompanion).toBe("Solo");
    });

    it("extracts all fields from a rich message", () => {
        const result = extractFields(
            "trip to Istanbul for 3 days with friends, interested in history and food, budget"
        );
        expect(result.destination).toBe("Istanbul");
        expect(result.duration).toBe("3 days");
        expect(result.travelCompanion).toBe("With friends");
        expect(result.vibe).toEqual(["History", "Food"]);
        expect(result.budget).toBe("Budget");
    });

    it("does not set fields that are not mentioned", () => {
        const result = extractFields("trip to Tokyo");
        expect(result.destination).toBe("Tokyo");
        expect(result.duration).toBeUndefined();
        expect(result.travelCompanion).toBeUndefined();
        expect(result.vibe).toBeUndefined();
        expect(result.budget).toBeUndefined();
    });
});
