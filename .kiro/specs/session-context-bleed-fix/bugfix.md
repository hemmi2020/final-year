# Bugfix Requirements Document

## Introduction

When a user creates a trip (e.g., an Istanbul trip) and then clicks "+ New Trip" to start planning a different trip, the previous trip's conversation context bleeds into the new trip flow. The AI continues to reference the old trip's details (destination, itinerary, preferences) because the backend Redis conversation memory is never cleared on new trip creation, and there is a frontend timing issue where stale state may persist during the reset sequence. This results in a confusing user experience where the AI appears to mix up trips.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user clicks "+ New Trip" after completing a previous trip THEN the system does not clear the backend Redis conversation memory (`chat:{userId}`), causing the AI to retain the old trip's conversation history

1.2 WHEN a user clicks "+ New Trip" and begins chatting about a new destination THEN the system loads the previous trip's conversation history via `getConversation(userId)` in the AI `chat()` function and includes it in the system prompt, causing the AI to reference the old trip context

1.3 WHEN a user clicks "+ New Trip" THEN the system has no API endpoint to clear the backend conversation memory, so the frontend `handleNewTrip` function cannot request a server-side conversation reset

1.4 WHEN a user clicks "+ New Trip" and the `handleNewTrip` function resets frontend state THEN the system re-initializes via `setTimeout(..., 100)` which may allow the `isComplete` useEffect to fire with stale state before `chatStage` has reset to "greeting", potentially triggering an unintended itinerary generation

1.5 WHEN a user generates a new trip to the same destination with similar parameters after clicking "+ New Trip" THEN the system may return a cached itinerary from the previous trip via the Redis cache in `generateItinerary`, since the cache key is based on `(destination, days, preferences)`

### Expected Behavior (Correct)

2.1 WHEN a user clicks "+ New Trip" THEN the system SHALL clear the backend Redis conversation memory for that user by calling a dedicated API endpoint that invokes `clearConversation(userId)`

2.2 WHEN a user clicks "+ New Trip" and begins chatting about a new destination THEN the system SHALL start with an empty conversation history, ensuring the AI has no context from previous trips

2.3 WHEN the frontend needs to clear backend conversation state THEN the system SHALL expose a DELETE endpoint (e.g., `DELETE /api/chat`) that calls `clearConversation(userId)` in the memory service

2.4 WHEN a user clicks "+ New Trip" and the frontend resets state THEN the system SHALL ensure the `chatStage` is fully reset to "greeting" and the `isComplete` useEffect does not fire with stale state before re-initialization completes

2.5 WHEN a user generates a new trip to the same destination with similar parameters after clicking "+ New Trip" THEN the system SHALL NOT serve a cached itinerary from a previous trip; the cache should be invalidated or bypassed for new trip flows

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user sends chat messages during an active trip planning session (without clicking "+ New Trip") THEN the system SHALL CONTINUE TO maintain and use the conversation history for contextual AI responses

3.2 WHEN a user is in the middle of planning a trip and provides trip details (destination, duration, vibe, etc.) THEN the system SHALL CONTINUE TO extract fields, update trip state, and advance through the question sequence correctly

3.3 WHEN a user completes all required trip fields during a session THEN the system SHALL CONTINUE TO auto-trigger itinerary generation exactly once

3.4 WHEN a user navigates to the chat page with a `?destination=` query parameter THEN the system SHALL CONTINUE TO auto-fill the destination and skip to the duration question

3.5 WHEN a user clicks "Save", "Share", or "Modify" on a generated itinerary THEN the system SHALL CONTINUE TO handle those actions correctly without being affected by the conversation clearing mechanism

3.6 WHEN the Redis connection is unavailable THEN the system SHALL CONTINUE TO degrade gracefully, returning empty conversation history and not crashing

---

## Bug Condition

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type UserAction
  OUTPUT: boolean

  // Returns true when the user starts a new trip after having a previous trip session
  RETURN X.action = "newTrip" AND X.previousConversationExists = true
END FUNCTION
```

## Fix Checking Property

```pascal
// Property: Fix Checking — New trip starts with clean context
FOR ALL X WHERE isBugCondition(X) DO
  result ← handleNewTrip'(X)
  ASSERT result.backendConversationCleared = true
    AND result.frontendStateFullyReset = true
    AND result.aiConversationHistory = []
    AND result.noStaleGenerationTriggered = true
END FOR
```

## Preservation Checking Property

```pascal
// Property: Preservation Checking — Active sessions unaffected
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT handleNewTrip(X) = handleNewTrip'(X)
  // For non-new-trip actions, behavior is identical before and after the fix
END FOR
```
