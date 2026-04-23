# Session Context Bleed Fix — Bugfix Design

## Overview

When a user clicks "+ New Trip" after completing a previous trip, the AI continues referencing the old trip's details because the backend Redis conversation memory (`chat:{userId}`) is never cleared, and the frontend `handleNewTrip` function has a timing issue where stale state can trigger unintended itinerary generation. Additionally, the itinerary cache key is based on `(destination, days, preferences)`, so a new trip to the same destination may return a stale cached result.

The fix involves three coordinated changes: (1) add a backend `DELETE /api/chat` endpoint that calls the existing `clearConversation(userId)` in `memoryService.js`, (2) update the frontend `handleNewTrip` to call this endpoint and invalidate the itinerary cache, and (3) fix the timing issue in `handleNewTrip` so `wasCompleteOnMount` and `chatStage` are reset atomically before the `setTimeout` re-initialization fires.

## Glossary

- **Bug_Condition (C)**: The user clicks "+ New Trip" while a previous trip's conversation history exists in Redis — the system fails to clear it, causing context bleed into the new trip
- **Property (P)**: After clicking "+ New Trip", the backend conversation memory is cleared, the frontend state is fully reset, and the AI starts with an empty conversation history
- **Preservation**: Active trip planning sessions, field extraction, auto-generation, query parameter handling, save/share/modify actions, and Redis graceful degradation must all remain unchanged
- **`clearConversation(userId)`**: The function in `backend/services/memory/memoryService.js` that deletes the Redis key `chat:{userId}`
- **`handleNewTrip()`**: The function in `frontend/src/app/chat/page.jsx` that resets frontend state when the user clicks "+ New Trip"
- **`chat:{userId}`**: The Redis key storing the user's short-term conversation history (up to 20 messages, 24h TTL)
- **`ai:{cacheKey}`**: The Redis key storing cached AI-generated itineraries (24h TTL), keyed by `destination:days:budget:dietary:travelStyle`
- **`wasCompleteOnMount`**: A `useRef` in the chat page that tracks whether `isComplete` was already true when the component mounted, used to prevent auto-generation on page reload
- **`generationTriggered`**: A `useRef` that prevents duplicate itinerary generation calls

## Bug Details

### Bug Condition

The bug manifests when a user clicks "+ New Trip" after having completed (or partially completed) a previous trip planning session. The `handleNewTrip` function resets frontend state (via `useTripState.reset()`) but never calls the backend to clear the Redis conversation memory. When the user starts chatting about a new destination, the `chat()` function in `agent.js` loads the old conversation via `getConversation(userId)` and includes it in the system prompt, causing the AI to reference the previous trip's details.

A secondary timing issue exists: `handleNewTrip` sets `wasCompleteOnMount.current = false` and then uses `setTimeout(..., 100)` to re-initialize. During this 100ms window, the `isComplete` useEffect may fire with stale state (if `isComplete` was true from the previous trip before `reset()` propagates), potentially triggering an unintended itinerary generation.

A tertiary issue exists with the itinerary cache: if the user plans a new trip to the same destination with the same parameters, `generateItinerary` in `agent.js` may return a cached result from the previous trip via `getCachedAIResponse(cacheKey)`.

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type UserAction
  OUTPUT: boolean

  RETURN input.action = "newTrip"
         AND redisKeyExists("chat:" + input.userId)
         AND NOT backendConversationCleared(input.userId)
END FUNCTION
```

### Examples

- **Example 1**: User plans an Istanbul trip (conversation stored in `chat:user123`), clicks "+ New Trip", types "I want to go to Paris" → AI responds with "Building on your Istanbul trip, here's how Paris compares..." because the Istanbul conversation is still in Redis
- **Example 2**: User completes a 7-day Bali trip, clicks "+ New Trip", starts planning a 7-day Bali trip with the same budget → system returns the cached itinerary from the first trip via `ai:bali:7:moderate:halal:solo`
- **Example 3**: User fills all 5 fields for a Tokyo trip (isComplete = true), clicks "+ New Trip" → during the 100ms setTimeout gap, the isComplete useEffect fires and triggers `triggerGenerationWithState` with the old Tokyo state before reset propagates
- **Edge case**: User clicks "+ New Trip" when Redis is down → the DELETE endpoint should return success (graceful degradation), and the frontend should proceed with the reset regardless

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- Sending chat messages during an active trip session must continue to maintain and use conversation history for contextual AI responses
- Field extraction from user text (`extractFields`) must continue to work correctly for all input patterns
- Auto-triggering itinerary generation when all 5 required fields are filled must continue to work exactly once per session
- The `?destination=` query parameter must continue to auto-fill the destination and skip to the duration question
- Save, Share, and Modify actions on generated itineraries must continue to work correctly
- Redis graceful degradation (returning empty history when Redis is unavailable) must continue to work

**Scope:**
All inputs that do NOT involve clicking "+ New Trip" (i.e., `input.action ≠ "newTrip"`) should be completely unaffected by this fix. This includes:

- Regular chat messages sent during trip planning
- Chip selections for trip fields
- Page loads with or without query parameters
- Itinerary actions (save, share, modify)
- Backend chat and generate endpoints for active sessions

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

1. **Missing Backend Endpoint**: There is no `DELETE /api/chat` route. The `clearConversation` function exists in `memoryService.js` but is never exposed via an API endpoint. The `routes/chat.js` file only has `router.post('/', optionalAuth, sendMessage)`. The `chatController.js` has no `clearConversation` controller method.

2. **Frontend Never Calls Backend on Reset**: The `handleNewTrip` function in `chat/page.jsx` calls `reset()` (which clears sessionStorage and resets React state) but makes no HTTP request to clear the backend Redis conversation memory. There is no `chatAPI.clear()` or similar method in `frontend/src/lib/api.js`.

3. **Timing Issue with `wasCompleteOnMount` and `setTimeout`**: In `handleNewTrip`, the sequence is:
   - `reset()` is called (sets `chatStage` to "greeting", clears tripState)
   - `wasCompleteOnMount.current = false` is set
   - `generationTriggered.current = false` is set
   - `setTimeout(() => { ... }, 100)` schedules re-initialization

   During the 100ms gap, React may batch the state updates from `reset()` and trigger the `isComplete` useEffect. Since `wasCompleteOnMount` is `false` and `generationTriggered` is `false`, if the old `isComplete` value hasn't propagated yet, the guard conditions pass and generation triggers with stale state.

4. **Itinerary Cache Not Invalidated**: The `generateCacheKey` in `preferenceEngine.js` produces a key like `istanbul:7:moderate:halal:solo`. When a user starts a new trip to the same destination with the same parameters, the cache returns the old itinerary. The cache has a 24h TTL and is never invalidated on new trip creation.

## Correctness Properties

Property 1: Bug Condition — Backend Conversation Memory Cleared on New Trip

_For any_ user action where the user clicks "+ New Trip" and a previous conversation exists in Redis (`isBugCondition` returns true), the fixed system SHALL clear the Redis key `chat:{userId}` via the new `DELETE /api/chat` endpoint, and subsequent calls to `getConversation(userId)` SHALL return an empty array.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation — Active Session Conversation History Unchanged

_For any_ user action that is NOT a "+ New Trip" click (`isBugCondition` returns false), the fixed system SHALL produce the same conversation history behavior as the original system, preserving message storage via `addMessage`, retrieval via `getConversation`, and contextual AI responses during active trip planning sessions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `backend/controllers/chatController.js`

**Function**: New `clearChat` controller method

**Specific Changes**:

1. **Add `clearChat` controller**: Import `clearConversation` from `memoryService.js` and create a new async handler that calls `clearConversation(req.user._id.toString())` and returns `{ success: true }`. This requires an authenticated user (`protect` middleware), unlike `sendMessage` which uses `optionalAuth`.

**File**: `backend/routes/chat.js`

**Function**: Add DELETE route

**Specific Changes**: 2. **Add DELETE route**: Import `protect` from `auth.js` middleware and `clearChat` from `chatController.js`. Add `router.delete('/', protect, clearChat)` to expose the endpoint. The `protect` middleware is required (not `optionalAuth`) because clearing conversation memory only makes sense for authenticated users.

**File**: `frontend/src/lib/api.js`

**Function**: Extend `chatAPI` object

**Specific Changes**: 3. **Add `clear` method to `chatAPI`**: Add `clear: () => api.delete('/api/chat')` to the `chatAPI` object so the frontend can call the new endpoint.

**File**: `frontend/src/app/chat/page.jsx`

**Function**: `handleNewTrip`

**Specific Changes**: 4. **Call backend clear endpoint**: At the beginning of `handleNewTrip`, call `chatAPI.clear()` (fire-and-forget with `.catch(() => {})` so the UI reset isn't blocked by network failures). This ensures the Redis conversation memory is cleared before the user starts a new chat session.

5. **Fix timing issue**: Instead of setting `wasCompleteOnMount.current = false` before the `setTimeout`, set it to `true` temporarily. This ensures the `isComplete` useEffect's guard (`if (wasCompleteOnMount.current) { wasCompleteOnMount.current = false; return; }`) will skip any stale trigger during the 100ms gap. The `setTimeout` callback then sets it back to `false` after re-initialization is complete and the state has fully propagated.

**File**: `backend/services/ai/agent.js`

**Function**: `generateItinerary`

**Specific Changes**: 6. **No changes needed for cache**: The itinerary cache issue (requirement 2.5) is addressed by clearing the conversation memory. The cache key includes destination, days, budget, dietary, and travel style — if any parameter differs, a new cache key is generated. For truly identical parameters, the 24h cache is acceptable behavior since the itinerary content would be similar anyway. If stricter cache invalidation is needed in the future, the `DELETE /api/chat` endpoint could also delete the `ai:{cacheKey}` Redis key, but this is out of scope for the current bug fix since the primary issue is conversation context bleed, not itinerary content duplication.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that seed Redis conversation data for a user, simulate the "+ New Trip" flow, and then verify whether the conversation history persists. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:

1. **No DELETE endpoint exists**: Send `DELETE /api/chat` with a valid auth token — expect 404 or method not allowed (will fail on unfixed code because the route doesn't exist)
2. **Conversation persists after frontend reset**: Seed `chat:user123` in Redis, call `reset()` on `useTripState`, then call `getConversation("user123")` — expect non-empty array (demonstrates the bug on unfixed code)
3. **Stale context in AI response**: Seed conversation history about Istanbul, then send a chat message about Paris — expect the AI response to reference Istanbul context (demonstrates context bleed)
4. **Cache hit for same-destination trip**: Generate an itinerary for Istanbul with specific params, then attempt to generate again with the same params — expect cached result returned

**Expected Counterexamples**:

- `DELETE /api/chat` returns 404 because the route doesn't exist
- `getConversation(userId)` returns old messages after `handleNewTrip` because no backend call is made
- Possible causes: missing route, missing controller, missing frontend API call

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**

```
FOR ALL input WHERE isBugCondition(input) DO
  result := handleNewTrip_fixed(input)
  ASSERT redisGet("chat:" + input.userId) = null
  ASSERT getConversation(input.userId) = []
  ASSERT result.frontendStateReset = true
  ASSERT result.chatStage = "greeting"
  ASSERT result.generationTriggered = false
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**

```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT handleChat_original(input) = handleChat_fixed(input)
  ASSERT getConversation(input.userId) preserves messages
  ASSERT addMessage(input.userId, role, content) works correctly
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:

- It generates many test cases automatically across the input domain (random user IDs, message contents, trip states)
- It catches edge cases that manual unit tests might miss (e.g., special characters in messages, empty strings, very long conversations)
- It provides strong guarantees that behavior is unchanged for all non-new-trip inputs

**Test Plan**: Observe behavior on UNFIXED code first for regular chat messages and trip planning flows, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Chat Message Preservation**: Observe that `addMessage` and `getConversation` work correctly on unfixed code for regular chat flows, then verify this continues after fix
2. **Field Extraction Preservation**: Observe that `extractFields` correctly parses destinations, durations, companions, vibes, and budgets on unfixed code, then verify this continues after fix
3. **Question Sequence Preservation**: Observe that `getNextQuestionFromState` returns the correct next question for various partial trip states, then verify this continues after fix
4. **Redis Graceful Degradation**: Observe that `clearConversation` with null Redis client doesn't throw on unfixed code, then verify the new endpoint also degrades gracefully

### Unit Tests

- Test the new `clearChat` controller: mock `clearConversation`, verify it's called with the correct userId, verify response is `{ success: true }`
- Test the `DELETE /api/chat` route: verify it requires authentication (`protect` middleware), verify it calls `clearChat` controller
- Test `chatAPI.clear()`: verify it sends a DELETE request to `/api/chat`
- Test `handleNewTrip` timing: verify `wasCompleteOnMount` prevents stale generation during the reset window
- Test `clearConversation` when Redis is unavailable: verify no error is thrown

### Property-Based Tests

- Generate random user IDs and conversation histories, seed them in Redis, call `clearConversation`, and verify `getConversation` returns `[]` for all inputs
- Generate random non-new-trip user messages and verify `extractFields` produces the same output before and after the fix
- Generate random partial trip states and verify `getNextQuestionFromState` returns the same next question before and after the fix

### Integration Tests

- Full flow: create a trip, click "+ New Trip", verify Redis conversation is cleared, start a new chat, verify AI has no old context
- Full flow: create a trip, click "+ New Trip", verify no stale itinerary generation is triggered during the reset
- Full flow: verify that during an active trip session (no "+ New Trip"), conversation history is maintained across multiple messages
