# Implementation Plan: AI Chat Trip Generation Overhaul

## Overview

This plan implements a deterministic client-side state machine to replace the current unstructured AI conversation flow, adds rich itinerary display components, enhances backend services with mock fallbacks, and wires up save/share functionality. Tasks are ordered so each builds on the previous, starting with the core state machine hook, then UI components, backend changes, and finally integration wiring.

## Tasks

- [x] 1. Create `useTripState` hook with state machine logic
  - [x] 1.1 Create `frontend/src/hooks/useTripState.js` with TripState initialization, `updateField`, `getNextQuestion`, `isComplete`, `reset`, `chatStage`/`setChatStage`, and sessionStorage persistence
    - Initialize TripState with all fields null and isComplete false
    - Implement strict question ordering: destination → duration → travelCompanion → vibe → budget
    - `getNextQuestion()` returns the first unfilled required field's QuestionConfig, or null when complete
    - `updateField(field, value)` sets the field and persists to sessionStorage
    - `isComplete` is true only when all 5 required fields are non-null
    - `reset()` clears sessionStorage key `tripState` and resets all fields to null
    - On mount, restore TripState from sessionStorage if present
    - Accept `userLocation` param to auto-fill origin from useLocation hook
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [x] 1.2 Implement `extractFields(text)` function in useTripState for free-text field extraction
    - Use regex patterns to detect destinations (capitalized place names, "to {place}" patterns)
    - Detect duration phrases ("X days", "X weeks", "a week")
    - Detect companion keywords ("solo", "with friends", "family", "couple")
    - Detect vibe keywords matching known list (history, food, shopping, adventure, nature, nightlife, culture, relaxation)
    - Detect budget keywords ("budget", "mid-range", "luxury") or dollar amounts
    - Return ExtractedFields object with only recognized fields populated
    - _Requirements: 1.5, 9.3_

  - [ ]\* 1.3 Write property tests for useTripState (Properties 1–5)
    - **Property 1: Question ordering respects defined sequence and skips filled fields**
    - **Validates: Requirements 1.2, 1.4**
    - **Property 2: Field updates are stored in Trip_State**
    - **Validates: Requirements 1.3, 2.5**
    - **Property 3: Field extraction from free text**
    - **Validates: Requirements 1.5, 9.3**
    - **Property 4: Trip_State sessionStorage round-trip**
    - **Validates: Requirements 1.8, 1.9**
    - **Property 5: Completion detection**
    - **Validates: Requirements 1.6**

- [x] 2. Create `QuickReplyChips` component
  - [x] 2.1 Create `frontend/src/components/chat/QuickReplyChips.jsx` with chip configurations for each question type
    - Duration chips: "3 days", "1 week", "2 weeks", "Custom"
    - Companion chips: "Solo", "With friends", "Family", "Couple"
    - Vibe chips (multi-select): "History", "Food", "Shopping", "Adventure", "Nature", "Nightlife", "Culture", "Relaxation"
    - Budget chips: "Budget", "Mid-range", "Luxury"
    - Accept `questionType`, `onSelect`, and optional `multiSelect` props
    - Use orange theme (#FF4500) for selected state styling with inline styles
    - For multi-select (vibe), allow toggling multiple chips and provide a "Continue" button
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Create `ItineraryCard` component
  - [x] 3.1 Create `frontend/src/components/chat/ItineraryCard.jsx` with hero image, trip summary, route bar, and action buttons
    - Hero image section with Unsplash destination photo and gradient fallback (#FF4500 → #FF6B35)
    - Trip summary stats bar: total days, city count, experiences, hotels, transport
    - Route bar: Origin → Destination → Origin with travel dates
    - Sticky bottom action bar with "Save Trip", "Share to Community", "Modify Plan" buttons
    - Accept props: itinerary, tripId, origin, destination, onSave, onShare, onModify
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.12_

  - [x] 3.2 Add flight card, hotel card, and day-by-day expandable cards to ItineraryCard
    - Flight card: airline name, departure/arrival times, price in PKR, "Change" and "Lock" buttons
    - Hotel card: hotel image, star rating, guest rating, price per night in PKR, hotel name
    - Day-by-day expandable cards: day number, theme, activities grouped by period (morning, lunch, afternoon, dinner)
    - Click on collapsed day card expands to show all activities
    - Return flight card at the bottom
    - _Requirements: 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_

  - [ ]\* 3.3 Write property tests for ItineraryCard (Properties 7–11)
    - **Property 7: Itinerary summary completeness**
    - **Validates: Requirements 4.3**
    - **Property 8: Route bar completeness**
    - **Validates: Requirements 4.4**
    - **Property 9: Flight card field completeness**
    - **Validates: Requirements 4.7**
    - **Property 10: Hotel card field completeness**
    - **Validates: Requirements 4.8**
    - **Property 11: Day card structure and activity grouping**
    - **Validates: Requirements 4.9**

- [x] 4. Enhance GeneratingPanel with origin-to-destination heading
  - Update the existing `GeneratingPanel` in `frontend/src/app/chat/page.jsx` to accept `origin` and `destination` props
  - Display heading in format "{ORIGIN} to {DESTINATION} Trip" instead of just destination name
  - Keep existing gradient, checklist, progress bar, and percentage counter logic
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]\* 4.1 Write property test for GeneratingPanel heading (Property 6)
    - **Property 6: Generating panel heading format**
    - **Validates: Requirements 3.2**

- [x] 5. Checkpoint — Ensure all frontend components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Extend Trip model and backend services
  - [x] 6.1 Add new fields to `backend/models/Trip.js` schema
    - Add `origin` (String), `travelCompanion` (String), `vibe` ([String])
    - Add `flightData` subdocument (airline, from, to, departure, arrival, price, duration, stops, airlineLogo)
    - Add `returnFlightData` subdocument (same shape as flightData)
    - Add `hotelData` subdocument (name, stars, rating, pricePerNight, image, address, distance)
    - Add `heroImage` (String), `communityNote` (String), `isAnonymous` (Boolean, default false)
    - Add `period` field (enum: morning, lunch, afternoon, dinner) to activitySchema
    - _Requirements: 5.5, 8.3, 8.4_

  - [x] 6.2 Add mock fallback functions to `backend/services/external/flightService.js` and `backend/services/external/hotelService.js`
    - Add `getMockFlights(from, to)` returning realistic mock data with airline names, times, PKR prices
    - Add `getMockHotels(city)` returning realistic mock data with hotel names, star ratings, PKR prices, placeholder images
    - Integrate fallbacks into existing `searchFlights` and `searchHotels` — return mock data when RapidAPI fails or returns empty
    - _Requirements: 6.5, 6.6_

  - [ ]\* 6.3 Write property tests for flight and hotel service mapping (Properties 13–14)
    - **Property 13: Flight service response mapping completeness**
    - **Validates: Requirements 6.3**
    - **Property 14: Hotel service response mapping completeness**
    - **Validates: Requirements 6.4**

- [x] 7. Update backend AI agent and prompts
  - [x] 7.1 Modify `backend/services/ai/prompts.js` itineraryPrompt to include Trip_State fields
    - Add origin, travelCompanion, vibe to the prompt template
    - Update JSON response format to include: origin, returnFlight, heroImage, summary, route, and period per activity
    - Add instruction to group activities by time-of-day period (morning, lunch, afternoon, dinner)
    - _Requirements: 5.2_

  - [ ]\* 7.2 Write property test for itinerary prompt completeness (Property 12)
    - **Property 12: Itinerary prompt includes all Trip_State fields**
    - **Validates: Requirements 5.2**

  - [x] 7.3 Modify `backend/services/ai/agent.js` generateItinerary to accept and use extended Trip_State params
    - Accept `origin`, `travelCompanion`, `vibe`, and `dates` parameters
    - Pass `origin` to `searchFlights` instead of hardcoded `user.preferences.homeCity`
    - Include `travelCompanion` and `vibe` in the prompt context
    - Return separate `flight` and `returnFlight` objects in the response
    - Include `heroImage` URL (Unsplash placeholder) in response
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 7.4 Modify `backend/services/ai/agent.js` chat function to accept optional `tripState` context
    - Accept optional `tripState` parameter from request body
    - Include Trip_State summary in the system prompt context so the AI acknowledges already-collected fields
    - _Requirements: 9.1, 9.2_

  - [x] 7.5 Modify `backend/controllers/chatController.js` to handle extended request bodies
    - Update `generateItinerary` to accept and pass through origin, travelCompanion, vibe, dates, duration fields
    - Save flightData, returnFlightData, hotelData, heroImage to the Trip document
    - Update `sendMessage` to pass tripState from request body to the chat function
    - Validate that destination is present in generate request, return 400 if missing
    - _Requirements: 5.1, 5.5, 5.6, 9.1_

- [x] 8. Checkpoint — Ensure backend changes work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Rewire ChatPage to use state machine and new components
  - [x] 9.1 Refactor `frontend/src/app/chat/page.jsx` to integrate useTripState hook and state-machine-driven conversation flow
    - Replace current ad-hoc chat stage logic with useTripState hook
    - On page load, show greeting message and first question from getNextQuestion()
    - On user message (typed or chip click), call extractFields + updateField, then send to POST /api/chat with tripState context
    - Append AI response as assistant message, then append next question from getNextQuestion()
    - Display QuickReplyChips below AI messages based on current question's chipType
    - When isComplete becomes true, set chatStage to "generating" and call POST /api/trips/generate with full Trip_State
    - On generate response, set chatStage to "ready" and render ItineraryCard in right panel
    - Pass origin and destination to GeneratingPanel
    - Wire "New Trip" button to useTripState.reset()
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 2.5, 2.6, 3.1, 3.2, 4.1, 9.1, 9.3_

  - [x] 9.2 Wire Save Trip, Share to Community, and Modify Plan action buttons
    - "Save Trip" calls POST /api/trips/generate (if not already saved), shows success toast, updates button to "Saved ✓"
    - "Share to Community" opens ShareTripModal with tripId, destination, and title
    - "Modify Plan" resets chatStage to "asking", allows user to update specific fields, re-triggers generation
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 8.1, 9.4_

  - [x] 9.3 Update `frontend/src/lib/api.js` chatAPI.send to include tripState in request body
    - Modify `chatAPI.send` to accept message and optional tripState parameter
    - Send both in the POST /api/chat request body
    - _Requirements: 9.1_

- [x] 10. Enhance ShareTripModal with trip preview, personal note, and anonymous toggle
  - Modify `frontend/src/components/chat/ShareTripModal.jsx` to add:
    - Trip preview section showing destination name and trip title at the top
    - Personal note text field for the user to add a message
    - Anonymous sharing toggle
    - Wire publish call to POST /api/community/trips/:id/publish with note and anonymous flag
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11. Checkpoint — Ensure full integration works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

  - [ ]\* 11.1 Write property test for community trip card fields (Property 15)
    - **Property 15: Community trip card field completeness**
    - **Validates: Requirements 8.7**

- [x] 12. Final checkpoint — Verify all requirements are covered
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key integration points
- Property tests use fast-check library and validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing orange theme (#FF4500), navbar, Mapbox setup, and other pages remain unchanged
