# Implementation Plan: Flight & Hotel Modifier

## Overview

Add interactive selection and modification capabilities to the existing `ItineraryCard` component. This involves extracting pure utility functions into a testable module, adding selection buttons and modifier panels for flights and hotels, implementing auto-date-recalculation, a cost tracker, and async persistence. All changes are scoped to the frontend — no backend modifications needed.

## Tasks

- [x] 1. Extract pure utility functions into a testable module
  - [x] 1.1 Create `frontend/src/components/chat/itinerary-utils.js` with `parsePriceRaw`, `recalculateDates`, and `calculateCosts` functions
    - Implement `parsePriceRaw(price)` — extracts numeric value from formatted price strings (e.g., "PKR 85,000" → 85000), returns `null` for unparseable input
    - Implement `recalculateDates(itinerary, newDepartureDate)` — shifts all day-card dates so Day 1 starts on the new departure date, preserves activity content, updates `route.startDate` and `route.endDate`
    - Implement `calculateCosts(itinerary)` — computes cost breakdown (outbound flight, return flight, hotel total, food, activities) and total from itinerary data using `parsePriceRaw`
    - Export all three functions as named exports
    - _Requirements: 5.1, 5.2, 5.4, 6.2, 7.2, 7.4_

  - [ ]\* 1.2 Write property tests for `parsePriceRaw`
    - Create `frontend/src/components/chat/__tests__/itinerary-utils.property.test.js`
    - **Property 5: Price parsing round-trip for numeric values and null for garbage**
    - Test that any non-negative number returns that number, any string with digits returns a non-negative number, and any string without digits (or non-string/non-number) returns `null`
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 7.4**

  - [ ]\* 1.3 Write property tests for `recalculateDates`
    - **Property 1: Date recalculation produces sequential dates starting from departure**
    - Test that for any itinerary with N days (N ≥ 1) and any valid departure date, Day 1's date equals the departure date, each subsequent day increments by 1, total days unchanged, and `route.startDate` equals departure date
    - **Validates: Requirements 5.1, 5.2**

  - [ ]\* 1.4 Write property tests for activity content preservation
    - **Property 2: Date recalculation preserves all activity content**
    - Test that for any itinerary with days containing activities, calling `recalculateDates` preserves every day's activities array identically (names, descriptions, times, costs, tags, periods)
    - **Validates: Requirements 5.4**

  - [ ]\* 1.5 Write property tests for `calculateCosts`
    - **Property 4: Cost calculation total equals sum of non-null line items**
    - Test that for any itinerary with arbitrary price values, `calculateCosts` produces a `total` equal to the sum of all non-null individual cost items, where `hotelTotal` = price-per-night × number of nights
    - **Validates: Requirements 6.2, 7.2**

- [ ] 2. Checkpoint — Verify utility functions
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Add flight selection buttons and state management
  - [x] 3.1 Add selection state variables and local itinerary state to `ItineraryCard.jsx`
    - Add `useState` hooks for `flightSelected`, `returnFlightSelected`, `hotelSelected`, and `localItinerary` as defined in the design
    - Clone itinerary prop into `localItinerary` on first modifier action
    - _Requirements: 1.1, 1.2, 3.1, 3.2_

  - [x] 3.2 Render "✓ Select This Flight" and "✏️ Change Flight" buttons below each flight card
    - Orange filled button for "Select" with `background: linear-gradient(135deg, #FF4500, #FF6B35)` and white text
    - Outlined button for "Change" with `border: 1.5px solid #E5E7EB` and white background
    - On "Select" click: apply orange border (`border: 2px solid #FF4500`) to the flight card and disable both buttons
    - On "Change" click: open the flight modifier panel
    - Preserve all existing flight card content (airline, route, time, duration, stops, price, booking links)
    - Render for both outbound and return flight cards
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Implement flight modifier panel
  - [x] 4.1 Add flight modifier state variables and render the Flight Modifier panel
    - Add `useState` hooks for `flightModifierOpen`, `flightSearchDate`, `flightTimePreference`, `flightStopsFilter`, `flightResults`, `flightLoading`, `flightError`, `selectedFlightId` (and mirrored return flight state)
    - Render panel inline below the flight card when `flightModifierOpen` is true
    - Include date picker input (`<input type="date" />`), time preference chips (Morning 6-12, Afternoon 12-6, Evening 6-10, Any time), and stops filter chips (Direct only, 1 stop ok, Any)
    - Include "Search New Flights" button
    - _Requirements: 2.1_

  - [x] 4.2 Implement flight search and results display
    - On "Search New Flights" click: set loading state, call `externalAPI.flights(origin, destination, date, options)` with selected filters
    - Display loading indicator while request is in progress
    - On success: render 3-5 Alternative Cards in radio-select layout showing airline, route, time, duration, stops, and price
    - On error: display inline error message ("Could not load flights. Please try again.") without disrupting the rest of the card
    - On empty results: display "No results found. Try adjusting your filters."
    - _Requirements: 2.2, 2.3, 2.4, 2.7_

  - [x] 4.3 Implement flight alternative selection and confirmation
    - On Alternative Card click: highlight with orange border, deselect any previously selected card
    - On "Confirm New Flight" click: replace current flight data in local state, collapse modifier panel, trigger date recalculation via `recalculateDates` if departure date changed, trigger cost recalculation via `calculateCosts`
    - Fire `tripsAPI.update(tripId, updatedItinerary)` asynchronously if `tripId` exists; log errors but don't revert UI
    - _Requirements: 2.5, 2.6, 5.1, 5.2, 5.3, 8.1, 8.2, 8.3_

  - [ ]\* 4.4 Write property test for return flight date updating route end date
    - **Property 3: Return flight date updates route end date**
    - Test that updating the return flight and recalculating sets `route.endDate` to the new return date while leaving `route.startDate` unchanged
    - **Validates: Requirements 5.3**

- [x] 5. Add hotel selection buttons and modifier panel
  - [x] 5.1 Render "✓ Select This Hotel" and "✏️ Change Hotel" buttons below the hotel card
    - Same button styling as flight selection buttons
    - On "Select" click: apply orange border to hotel card and disable buttons
    - On "Change" click: open the hotel modifier panel
    - Preserve all existing hotel card content (name, stars, rating, address, price per night, image, booking link)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 5.2 Add hotel modifier state and render the Hotel Modifier panel
    - Add `useState` hooks for `hotelModifierOpen`, `hotelBudget`, `hotelStars`, `hotelLocation`, `hotelResults`, `hotelLoading`, `hotelError`, `selectedHotelId`
    - Render panel inline below hotel card when `hotelModifierOpen` is true
    - Include budget chips (Budget, Mid-range, Luxury), star rating chips (Any, 3★, 4★, 5★), and location preference chips (City Center, Near Airport, Near Attractions, Any)
    - Include "Search Hotels" button
    - _Requirements: 4.1_

  - [x] 5.3 Implement hotel search, selection, and confirmation
    - On "Search Hotels" click: set loading state, call `externalAPI.hotels(city, checkin, checkout, options)` with selected filters
    - Display loading indicator while request is in progress
    - On success: render 3-4 Alternative Cards showing hotel name, image, star rating, review rating, price per night, and address
    - On error: display inline error message without disrupting the rest of the card
    - On Alternative Card click: highlight with orange border, deselect previous
    - On "Confirm Hotel" click: replace hotel data in local state, collapse panel, trigger cost recalculation via `calculateCosts`
    - Fire `tripsAPI.update(tripId, updatedItinerary)` asynchronously if `tripId` exists
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.1, 6.2, 8.1, 8.2, 8.3_

- [ ] 6. Checkpoint — Verify selection and modifier panels
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement the Cost Tracker section
  - [x] 7.1 Render the Cost Tracker at the bottom of the scrollable itinerary content
    - Import `calculateCosts` from `itinerary-utils.js`
    - Display cost breakdown: outbound flight, return flight, hotel total (price per night × nights), food estimate, activities estimate
    - Display total estimated cost as sum of all non-null items
    - Display "—" for any unavailable or unparseable cost values
    - Recalculate and re-render when any flight or hotel data changes (use local itinerary state as dependency)
    - Style with the design's layout: emoji labels, right-aligned amounts, divider line, bold total
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]\* 7.2 Write unit tests for Cost Tracker rendering and reactivity
    - Test that all line items and total are displayed correctly
    - Test that changing flight/hotel data updates the cost tracker
    - Test that unparseable prices show "—" and are excluded from total
    - _Requirements: 7.1, 7.3, 7.4_

- [ ] 8. Checkpoint — Verify full integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Write integration-level unit tests for UI interactions
  - [ ]\* 9.1 Write unit tests for selection buttons and modifier panel interactions
    - Create `frontend/src/components/chat/__tests__/ItineraryCard.test.jsx`
    - Test selection buttons render on flight and hotel cards (Req 1.1, 3.1)
    - Test "Select" click marks card with orange border and disables buttons (Req 1.2, 3.2)
    - Test "Change" click opens modifier panel (Req 1.3, 3.3)
    - Test modifier panel controls render correctly — date picker, chips, filters (Req 2.1, 4.1)
    - Test loading state displays during search (Req 2.3, 4.3)
    - Test results render as selectable alternative cards (Req 2.4, 4.4)
    - Test radio selection highlights selected card and deselects others (Req 2.5, 4.5)
    - Test confirm replaces data and collapses panel (Req 2.6, 4.6)
    - Test API error displays inline error message (Req 2.7, 4.7)
    - Test `tripsAPI.update` called on confirm when tripId exists (Req 8.1)
    - Test persistence error doesn't revert local state (Req 8.2)
    - Test UI updates before API resolves (Req 8.3)
    - _Requirements: 1.1–1.4, 2.1–2.7, 3.1–3.4, 4.1–4.7, 8.1–8.3_

- [ ] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific UI interactions and edge cases
- All code changes are in `frontend/src/components/chat/` — no backend modifications
- Pure utility functions are extracted to `itinerary-utils.js` for testability
- The existing `externalAPI.flights`, `externalAPI.hotels`, and `tripsAPI.update` client methods are used as-is
