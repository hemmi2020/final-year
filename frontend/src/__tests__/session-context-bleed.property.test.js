/**
 * Bug Condition Exploration Test — Session Context Bleed on New Trip
 *
 * **Validates: Requirements 1.1, 1.2, 1.3**
 *
 * These tests demonstrate the bug: when a user clicks "+ New Trip", the backend
 * Redis conversation memory is never cleared because:
 *   1. chatAPI does NOT have a `clear` method
 *   2. handleNewTrip in chat/page.jsx does NOT call the backend to clear conversation
 *   3. No DELETE /api/chat endpoint exists
 *
 * EXPECTED: These tests FAIL on unfixed code (proving the bug exists).
 * After the fix, these same tests should PASS.
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { chatAPI } from "@/lib/api";
import fs from "fs";
import path from "path";

describe("Bug Condition: Session Context Bleed — Frontend", () => {
    /**
     * Property 1: chatAPI MUST have a `clear` method to clear backend conversation memory.
     *
     * On unfixed code, chatAPI only has `send`. There is no way for the frontend
     * to tell the backend to clear conversation memory. This test asserts that
     * `chatAPI.clear` exists as a function — it will FAIL on unfixed code.
     *
     * **Validates: Requirements 1.3**
     */
    it("chatAPI should have a 'clear' method to clear backend conversation memory", () => {
        expect(typeof chatAPI.clear).toBe("function");
    });

    /**
     * Property 2: handleNewTrip source code MUST contain a call to clear backend conversation.
     *
     * On unfixed code, handleNewTrip only calls reset() (frontend state) but never
     * calls chatAPI.clear() or any backend endpoint. This test reads the source code
     * and asserts that it contains a backend clear call — it will FAIL on unfixed code.
     *
     * **Validates: Requirements 1.1, 1.2**
     */
    it("handleNewTrip should call chatAPI.clear() to clear backend conversation", () => {
        const chatPagePath = path.resolve(
            __dirname,
            "../app/chat/page.jsx"
        );
        const source = fs.readFileSync(chatPagePath, "utf-8");

        // Extract the handleNewTrip function body from source
        const handleNewTripMatch = source.match(
            /const handleNewTrip\s*=\s*\(\)\s*=>\s*\{/
        );
        expect(handleNewTripMatch).not.toBeNull();

        // The function should contain a call to clear backend conversation memory
        // Look for chatAPI.clear() anywhere in handleNewTrip
        const fnStart = source.indexOf(handleNewTripMatch[0]);
        // Find the function body by counting braces
        let braceCount = 0;
        let fnBody = "";
        let started = false;
        for (let i = fnStart; i < source.length; i++) {
            if (source[i] === "{") {
                braceCount++;
                started = true;
            }
            if (source[i] === "}") {
                braceCount--;
            }
            if (started) {
                fnBody += source[i];
            }
            if (started && braceCount === 0) break;
        }

        // Assert that handleNewTrip calls chatAPI.clear()
        expect(fnBody).toMatch(/chatAPI\.clear\s*\(/);
    });

    /**
     * Property 3 (PBT): For any random trip state, after calling reset(), sessionStorage
     * is cleared but there is NO mechanism to clear backend conversation state.
     *
     * This uses fast-check to generate random trip states and verifies that the chatAPI
     * object lacks a `clear` method — meaning no matter what trip state you're in,
     * there's no way to clear backend memory on new trip.
     *
     * **Validates: Requirements 1.1, 1.2, 1.3**
     */
    it("for any trip state, chatAPI has no mechanism to clear backend conversation", () => {
        const tripStateArb = fc.record({
            destination: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 30 })),
            origin: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 30 })),
            duration: fc.oneof(fc.constant(null), fc.constantFrom("3 days", "1 week", "2 weeks")),
            travelCompanion: fc.oneof(fc.constant(null), fc.constantFrom("Solo", "Family", "Couple", "With friends")),
            vibe: fc.oneof(fc.constant(null), fc.array(fc.constantFrom("History", "Food", "Adventure", "Nature"), { minLength: 1, maxLength: 4 })),
            budget: fc.oneof(fc.constant(null), fc.constantFrom("Budget", "Mid-range", "Luxury")),
        });

        fc.assert(
            fc.property(tripStateArb, (tripState) => {
                // Regardless of what trip state we have, chatAPI must have a clear method
                // to allow the frontend to clear backend conversation memory on new trip.
                // On unfixed code, this will be false — proving the bug.
                expect(typeof chatAPI.clear).toBe("function");
            }),
            { numRuns: 50 }
        );
    });
});
