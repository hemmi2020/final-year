/**
 * Preservation Property Tests — Session Context Bleed Fix
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 *
 * These tests verify that existing behavior is preserved for non-buggy inputs
 * (cases where isBugCondition returns false). They should PASS on unfixed code,
 * confirming the baseline behavior that must remain unchanged after the fix.
 *
 * Property 2: Preservation — Active Session Conversation History Unchanged
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { extractFields, getNextQuestionFromState } from "@/hooks/useTripState";

// ── Field sequence used by getNextQuestionFromState ────────────────────────────
const FIELD_SEQUENCE = [
    "destination",
    "duration",
    "travelCompanion",
    "vibe",
    "budget",
];

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Build a trip state object from a map of filled fields.
 * Unfilled fields default to null.
 */
function buildTripState(filledFields) {
    return {
        destination: filledFields.destination ?? null,
        origin: filledFields.origin ?? null,
        duration: filledFields.duration ?? null,
        travelCompanion: filledFields.travelCompanion ?? null,
        vibe: filledFields.vibe ?? null,
        budget: filledFields.budget ?? null,
        dates: null,
        isComplete: false,
    };
}

// ── 1. Field Extraction Preservation (PBT) ─────────────────────────────────────

describe("Preservation: Field Extraction (PBT)", () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * For all random strings, extractFields produces consistent output:
     * it returns an object and does not crash.
     */
    it("extractFields returns an object for any string input", () => {
        fc.assert(
            fc.property(fc.string({ minLength: 0, maxLength: 200 }), (input) => {
                const result = extractFields(input);
                expect(result).toBeDefined();
                expect(typeof result).toBe("object");
                expect(result).not.toBeNull();
            }),
            { numRuns: 200 }
        );
    });

    /**
     * **Validates: Requirements 3.2**
     *
     * extractFields is idempotent: calling it twice on the same input gives
     * the same result. This ensures no hidden mutable state affects extraction.
     */
    it("extractFields is idempotent — calling twice gives the same result", () => {
        fc.assert(
            fc.property(fc.string({ minLength: 0, maxLength: 200 }), (input) => {
                const first = extractFields(input);
                const second = extractFields(input);
                expect(first).toEqual(second);
            }),
            { numRuns: 200 }
        );
    });

    /**
     * **Validates: Requirements 3.2**
     *
     * Known inputs produce expected outputs — baseline behavior.
     */
    it('extractFields("trip to Paris for 5 days solo budget") returns expected fields', () => {
        const result = extractFields("trip to Paris for 5 days solo budget");
        // The regex captures "Paris For" because the destination pattern greedily
        // matches words after "trip to" until a non-alpha boundary. This is the
        // actual current behavior we are preserving.
        expect(result.destination).toBe("Paris For");
        expect(result.duration).toBe("5 days");
        expect(result.travelCompanion).toBe("Solo");
        expect(result.budget).toBe("Budget");
    });

    it('extractFields("") returns empty object', () => {
        const result = extractFields("");
        expect(result).toEqual({});
    });

    it('extractFields("Create New Trip") returns empty object (skip phrase)', () => {
        const result = extractFields("Create New Trip");
        expect(result).toEqual({});
    });
});

// ── 2. Question Sequence Preservation (PBT) ────────────────────────────────────

describe("Preservation: Question Sequence (PBT)", () => {
    /**
     * **Validates: Requirements 3.2, 3.3**
     *
     * For all random partial trip states (with random subsets of fields filled),
     * getNextQuestionFromState returns the correct next unfilled field from the
     * sequence [destination, duration, travelCompanion, vibe, budget].
     */
    it("returns the correct next unfilled field for any partial trip state", () => {
        // Arbitrary that generates a random subset of filled fields
        const partialTripStateArb = fc.record({
            destination: fc.oneof(
                fc.constant(null),
                fc.string({ minLength: 1, maxLength: 30 })
            ),
            duration: fc.oneof(
                fc.constant(null),
                fc.constantFrom("3 days", "1 week", "2 weeks", "5 days")
            ),
            travelCompanion: fc.oneof(
                fc.constant(null),
                fc.constantFrom("Solo", "Family", "Couple", "With friends")
            ),
            vibe: fc.oneof(
                fc.constant(null),
                fc.array(
                    fc.constantFrom("History", "Food", "Adventure", "Nature"),
                    { minLength: 1, maxLength: 4 }
                )
            ),
            budget: fc.oneof(
                fc.constant(null),
                fc.constantFrom("Budget", "Mid-range", "Luxury")
            ),
        });

        fc.assert(
            fc.property(partialTripStateArb, (partialFields) => {
                const tripState = buildTripState(partialFields);
                const result = getNextQuestionFromState(tripState);

                // Find the first null field in the sequence
                const firstNullField = FIELD_SEQUENCE.find(
                    (f) => tripState[f] == null
                );

                if (firstNullField) {
                    expect(result).not.toBeNull();
                    expect(result.field).toBe(firstNullField);
                } else {
                    // All fields filled → returns null
                    expect(result).toBeNull();
                }
            }),
            { numRuns: 200 }
        );
    });

    /**
     * **Validates: Requirements 3.3**
     *
     * When all fields are filled, getNextQuestionFromState returns null.
     */
    it("returns null when all required fields are filled", () => {
        const tripState = buildTripState({
            destination: "Paris",
            duration: "5 days",
            travelCompanion: "Solo",
            vibe: ["History"],
            budget: "Budget",
        });
        const result = getNextQuestionFromState(tripState);
        expect(result).toBeNull();
    });

    /**
     * **Validates: Requirements 3.2**
     *
     * When no fields are filled, getNextQuestionFromState returns the
     * destination question (first in sequence).
     */
    it("returns destination question when no fields are filled", () => {
        const tripState = buildTripState({});
        const result = getNextQuestionFromState(tripState);
        expect(result).not.toBeNull();
        expect(result.field).toBe("destination");
    });
});

// ── 3. extractFields Specific Known-Input Tests ────────────────────────────────

describe("Preservation: extractFields Known Inputs", () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * Various destination patterns work correctly.
     */
    it("extracts destination from 'trip to Istanbul'", () => {
        const result = extractFields("trip to Istanbul");
        expect(result.destination).toBe("Istanbul");
    });

    it("extracts destination from 'go to Tokyo'", () => {
        const result = extractFields("go to Tokyo");
        expect(result.destination).toBe("Tokyo");
    });

    it("extracts destination from 'visit London'", () => {
        const result = extractFields("visit London");
        expect(result.destination).toBe("London");
    });

    it("extracts destination from 'travel to Barcelona'", () => {
        const result = extractFields("travel to Barcelona");
        expect(result.destination).toBe("Barcelona");
    });

    /**
     * Duration patterns work correctly.
     */
    it("extracts duration from '7 days'", () => {
        const result = extractFields("trip to Rome for 7 days");
        expect(result.duration).toBe("7 days");
    });

    it("extracts duration from '2 weeks'", () => {
        const result = extractFields("trip to Bali for 2 weeks");
        expect(result.duration).toBe("2 weeks");
    });

    it("extracts duration from '1 week'", () => {
        const result = extractFields("trip to Dubai for 1 week");
        expect(result.duration).toBe("1 week");
    });

    /**
     * Companion patterns work correctly.
     */
    it("extracts companion 'Solo' from 'solo trip'", () => {
        const result = extractFields("solo trip to Paris");
        expect(result.travelCompanion).toBe("Solo");
    });

    it("extracts companion 'Family' from 'family vacation'", () => {
        const result = extractFields("family vacation to London");
        expect(result.travelCompanion).toBe("Family");
    });

    it("extracts companion 'Couple' from 'couple getaway'", () => {
        const result = extractFields("couple getaway to Maldives");
        expect(result.travelCompanion).toBe("Couple");
    });

    it("extracts companion 'With friends' from 'with friends'", () => {
        const result = extractFields("trip to Bali with friends");
        expect(result.travelCompanion).toBe("With friends");
    });

    /**
     * Budget patterns work correctly.
     */
    it("extracts budget 'Budget' from 'budget trip'", () => {
        const result = extractFields("budget trip to Istanbul");
        expect(result.budget).toBe("Budget");
    });

    it("extracts budget 'Luxury' from 'luxury vacation'", () => {
        const result = extractFields("luxury vacation to Dubai");
        expect(result.budget).toBe("Luxury");
    });

    it("extracts budget 'Mid-range' from 'mid-range trip'", () => {
        const result = extractFields("mid-range trip to Tokyo");
        expect(result.budget).toBe("Mid-range");
    });
});
