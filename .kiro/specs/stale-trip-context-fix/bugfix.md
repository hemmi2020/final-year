# Bugfix Requirements Document

## Introduction

When a user completes a trip generation (e.g., an Istanbul itinerary) and then clicks the "+ New Trip" button to start a fresh planning session, the AI backend continues to reference the previous trip's conversation context. This happens because the frontend `handleNewTrip` function clears local sessionStorage but never notifies the backend to clear the user's conversation history stored in Redis. The `clearConversation()` function exists in `memoryService.js` but is not exposed through any API endpoint, so the backend retains stale conversation memory across trip sessions.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user clicks "+ New Trip" after completing a trip generation THEN the system clears frontend sessionStorage but does NOT clear the backend Redis conversation memory, leaving stale conversation history from the previous trip

1.2 WHEN a user starts chatting for a new trip after clicking "+ New Trip" THEN the system loads the previous trip's conversation history from Redis via `getConversation(userId)` and the AI responses reference the old trip context (e.g., Istanbul details appear when planning a Paris trip)

1.3 WHEN a user triggers itinerary generation for a new trip after clicking "+ New Trip" THEN the system includes the previous trip's conversation history in the LLM prompt context via `generateItinerary()`, potentially contaminating the new itinerary with old trip data

### Expected Behavior (Correct)

2.1 WHEN a user clicks "+ New Trip" after completing a trip generation THEN the system SHALL clear both the frontend sessionStorage AND the backend Redis conversation memory for that user, ensuring no stale context remains

2.2 WHEN a user starts chatting for a new trip after clicking "+ New Trip" THEN the system SHALL return an empty conversation history from Redis, and the AI SHALL respond with no reference to any previous trip context

2.3 WHEN a user triggers itinerary generation for a new trip after clicking "+ New Trip" THEN the system SHALL use only the new trip's context in the LLM prompt, with no conversation history from previous trips

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user sends messages within the same trip session (without clicking "+ New Trip") THEN the system SHALL CONTINUE TO accumulate and use conversation history in Redis for contextual AI responses

3.2 WHEN a user refreshes the page during an active trip session THEN the system SHALL CONTINUE TO restore trip state from sessionStorage and maintain backend conversation history

3.3 WHEN a user generates an itinerary for the first time (no prior trip) THEN the system SHALL CONTINUE TO generate the itinerary normally without errors, even if no conversation history exists in Redis

3.4 WHEN an unauthenticated user interacts with the chat THEN the system SHALL CONTINUE TO function without attempting to clear backend conversation memory (since no userId-based memory exists)

---

### Bug Condition

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type NewTripAction
  OUTPUT: boolean

  // Returns true when the user starts a new trip after a previous trip session
  // that left conversation history in Redis
  RETURN X.userClickedNewTrip = true
     AND X.previousConversationExistsInRedis = true
     AND X.userIsAuthenticated = true
END FUNCTION
```

### Property Specification

```pascal
// Property: Fix Checking — New Trip clears backend conversation memory
FOR ALL X WHERE isBugCondition(X) DO
  result ← handleNewTrip'(X)
  redisConversation ← getConversation(X.userId)
  ASSERT redisConversation = [] AND result.frontendStateCleared = true
END FOR
```

### Preservation Goal

```pascal
// Property: Preservation Checking — Existing session behavior unchanged
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT handleNewTrip(X) = handleNewTrip'(X)
  // In-session messages, page refreshes, unauthenticated users,
  // and first-time trips all behave identically before and after the fix
END FOR
```
