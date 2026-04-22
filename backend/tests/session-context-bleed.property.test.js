/**
 * Bug Condition Exploration Test — Session Context Bleed on New Trip (Backend)
 *
 * **Validates: Requirements 1.1, 1.2, 1.3**
 *
 * These tests demonstrate the bug from the backend perspective:
 *   1. The chat routes file does NOT have a DELETE handler
 *   2. chatController does NOT export a `clearChat` function
 *   3. clearConversation exists in memoryService but is never wired to any route
 *
 * EXPECTED: These tests FAIL on unfixed code (proving the bug exists).
 * After the fix, these same tests should PASS.
 */
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fc = require("fast-check");
const fs = require("fs");
const path = require("path");

describe("Bug Condition: Session Context Bleed — Backend", () => {
    /**
     * Test 1: chat routes file MUST have a DELETE handler.
     *
     * On unfixed code, routes/chat.js only has router.post('/').
     * There is no router.delete('/') — meaning no DELETE /api/chat endpoint exists.
     * This test will FAIL on unfixed code.
     *
     * **Validates: Requirements 1.3**
     */
    it("chat routes should have a DELETE handler for clearing conversation", () => {
        const routesPath = path.resolve(__dirname, "../routes/chat.js");
        const source = fs.readFileSync(routesPath, "utf-8");

        // Assert that the routes file contains a delete route
        const hasDeleteRoute =
            /router\.delete\s*\(/.test(source) ||
            /router\["delete"\]\s*\(/.test(source);

        assert.ok(
            hasDeleteRoute,
            "Expected routes/chat.js to have a DELETE route handler (router.delete), but none was found"
        );
    });

    /**
     * Test 2: chatController MUST export a `clearChat` function.
     *
     * On unfixed code, chatController only exports `sendMessage` and `generateItinerary`.
     * There is no `clearChat` export. This test will FAIL on unfixed code.
     *
     * **Validates: Requirements 1.1, 1.3**
     */
    it("chatController should export a clearChat function", () => {
        const chatController = require("../controllers/chatController");

        assert.ok(
            typeof chatController.clearChat === "function",
            `Expected chatController to export 'clearChat' as a function, but got ${typeof chatController.clearChat}`
        );
    });

    /**
     * Test 3 (PBT): For any random user ID, clearConversation exists in memoryService
     * but is never wired to any route — demonstrating the gap.
     *
     * This uses fast-check to generate random user IDs and verifies that:
     * - memoryService.clearConversation IS a function (it exists)
     * - chatController does NOT have clearChat (it's not wired)
     *
     * On unfixed code, the second assertion fails — proving the bug.
     *
     * **Validates: Requirements 1.1, 1.2, 1.3**
     */
    it("for any user ID, clearConversation exists in memoryService but clearChat is missing from controller", () => {
        const memoryService = require("../services/memory/memoryService");
        const chatController = require("../controllers/chatController");

        const userIdArb = fc.stringMatching(/^[a-f0-9]{24}$/);

        fc.assert(
            fc.property(userIdArb, (userId) => {
                // memoryService.clearConversation exists — the capability is there
                assert.equal(
                    typeof memoryService.clearConversation,
                    "function",
                    "memoryService.clearConversation should exist"
                );

                // But chatController.clearChat does NOT exist — it's never wired to a route
                // After the fix, this should be a function
                assert.equal(
                    typeof chatController.clearChat,
                    "function",
                    `Expected chatController.clearChat to be a function for userId ${userId}, but it is ${typeof chatController.clearChat}. The clearConversation capability exists in memoryService but is not exposed via any controller/route.`
                );
            }),
            { numRuns: 50 }
        );
    });
});
