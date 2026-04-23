# Requirements Document

## Introduction

This feature adds select and modify functionality to the existing Flight and Hotel cards within the `ItineraryCard` component (`frontend/src/components/chat/ItineraryCard.jsx`). Users can select the current flight/hotel or open an inline modifier panel to search for alternatives using the existing RapidAPI-backed endpoints (`GET /api/external/flights` and `GET /api/external/hotels`). When a flight date changes, all downstream itinerary day dates auto-update. A total cost tracker summarizes the trip budget. No existing card design or layout is changed — only an interaction layer is added on top.

## Glossary

- **Itinerary_Card**: The existing React component (`ItineraryCard.jsx`) that renders the full trip itinerary in the right panel, including hero image, stats, route bar, flight cards, hotel card, and day-by-day cards.
- **Flight_Card**: The existing outbound or return flight section within the Itinerary_Card that displays airline, route, time, duration, stops, price, and booking links.
- **Hotel_Card**: The existing hotel section within the Itinerary_Card that displays hotel name, stars, rating, address, price per night, image, and a Booking.com link.
- **Modifier_Panel**: An inline expandable panel rendered directly below a Flight_Card or Hotel_Card that contains filter controls and search results for selecting an alternative.
- **Flight_Modifier**: The Modifier_Panel variant for flights, containing date picker, preferred time chips, stops filter, and a search button.
- **Hotel_Modifier**: The Modifier_Panel variant for hotels, containing budget chips, star rating chips, location preference chips, and a search button.
- **Alternative_Card**: A selectable radio-style card displayed inside a Modifier_Panel representing one search result (flight or hotel).
- **Day_Card**: An expandable day-by-day section within the Itinerary_Card showing activities grouped by period.
- **Cost_Tracker**: A summary section at the bottom of the Itinerary_Card that displays the total estimated trip cost broken down by flights, hotel, food, and activities.
- **Flight_Search_API**: The existing frontend API client method `externalAPI.flights(from, to, date, options)` that calls `GET /api/external/flights` (RapidAPI Sky Scanner).
- **Hotel_Search_API**: The existing frontend API client method `externalAPI.hotels(city, checkin, checkout, options)` that calls `GET /api/external/hotels` (RapidAPI Booking.com).
- **Trip_Update_API**: The existing frontend API client method `tripsAPI.update(id, tripData)` that calls `PUT /api/trips/:id`.

## Requirements

### Requirement 1: Flight Selection Buttons

**User Story:** As a traveler, I want to see "Select This Flight" and "Change Flight" buttons on each flight card, so that I can confirm the current flight or explore alternatives.

#### Acceptance Criteria

1. WHEN the Itinerary_Card renders a Flight_Card, THE Itinerary_Card SHALL display a "✓ Select This Flight" button with an orange filled background and a "✏️ Change Flight" button with an outlined style below the existing flight info and booking links.
2. WHEN the user clicks the "✓ Select This Flight" button, THE Itinerary_Card SHALL visually mark that Flight_Card as selected by applying an orange border highlight and disabling the selection buttons.
3. WHEN the user clicks the "✏️ Change Flight" button, THE Itinerary_Card SHALL expand the Flight_Modifier panel inline directly below that Flight_Card.
4. THE Itinerary_Card SHALL preserve all existing Flight_Card content including airline, route, time, duration, stops, price, "Book on Google" link, and "Skyscanner" link when displaying the selection buttons.

### Requirement 2: Flight Modifier Panel

**User Story:** As a traveler, I want to filter and search for alternative flights inline, so that I can find a better option without leaving the itinerary view.

#### Acceptance Criteria

1. WHEN the Flight_Modifier panel is open, THE Flight_Modifier SHALL display a date picker input (calendar type), preferred time chips (Morning 6-12, Afternoon 12-6, Evening 6-10, Any time), and a stops filter (Direct only, 1 stop ok, Any).
2. WHEN the user clicks the "Search New Flights" button in the Flight_Modifier, THE Flight_Modifier SHALL call the Flight_Search_API with the selected date, origin, destination, and filter options.
3. WHILE the Flight_Search_API request is in progress, THE Flight_Modifier SHALL display a loading indicator.
4. WHEN the Flight_Search_API returns results, THE Flight_Modifier SHALL display between 3 and 5 Alternative_Cards in a radio-select layout, each showing airline, route, time, duration, stops, and price.
5. WHEN the user selects an Alternative_Card, THE Flight_Modifier SHALL highlight the selected card with an orange border and deselect any previously selected card.
6. WHEN the user clicks the "Confirm New Flight" button after selecting an Alternative_Card, THE Itinerary_Card SHALL replace the current flight data with the selected alternative and collapse the Flight_Modifier panel.
7. IF the Flight_Search_API returns an error, THEN THE Flight_Modifier SHALL display an error message within the panel without disrupting the rest of the Itinerary_Card.

### Requirement 3: Hotel Selection Buttons

**User Story:** As a traveler, I want to see "Select This Hotel" and "Change Hotel" buttons on the hotel card, so that I can confirm the current hotel or explore alternatives.

#### Acceptance Criteria

1. WHEN the Itinerary_Card renders a Hotel_Card, THE Itinerary_Card SHALL display a "✓ Select This Hotel" button with an orange filled background and a "✏️ Change Hotel" button with an outlined style below the existing hotel info and booking link.
2. WHEN the user clicks the "✓ Select This Hotel" button, THE Itinerary_Card SHALL visually mark the Hotel_Card as selected by applying an orange border highlight and disabling the selection buttons.
3. WHEN the user clicks the "✏️ Change Hotel" button, THE Itinerary_Card SHALL expand the Hotel_Modifier panel inline directly below the Hotel_Card.
4. THE Itinerary_Card SHALL preserve all existing Hotel_Card content including hotel name, stars, rating, address, price per night, image, and "Book on Booking.com" link when displaying the selection buttons.

### Requirement 4: Hotel Modifier Panel

**User Story:** As a traveler, I want to filter and search for alternative hotels inline, so that I can find a better option without leaving the itinerary view.

#### Acceptance Criteria

1. WHEN the Hotel_Modifier panel is open, THE Hotel_Modifier SHALL display budget per night chips (Budget, Mid-range, Luxury), star rating chips (Any, 3★, 4★, 5★), and location preference chips (City Center, Near Airport, Near Attractions, Any).
2. WHEN the user clicks the "Search Hotels" button in the Hotel_Modifier, THE Hotel_Modifier SHALL call the Hotel_Search_API with the destination city, check-in date, check-out date, and filter options.
3. WHILE the Hotel_Search_API request is in progress, THE Hotel_Modifier SHALL display a loading indicator.
4. WHEN the Hotel_Search_API returns results, THE Hotel_Modifier SHALL display between 3 and 4 Alternative_Cards each showing hotel name, image, star rating, review rating, price per night, and address.
5. WHEN the user selects an Alternative_Card, THE Hotel_Modifier SHALL highlight the selected card with an orange border and deselect any previously selected card.
6. WHEN the user clicks the "Confirm Hotel" button after selecting an Alternative_Card, THE Itinerary_Card SHALL replace the current hotel data with the selected alternative and collapse the Hotel_Modifier panel.
7. IF the Hotel_Search_API returns an error, THEN THE Hotel_Modifier SHALL display an error message within the panel without disrupting the rest of the Itinerary_Card.

### Requirement 5: Auto-Update Itinerary Dates on Flight Change

**User Story:** As a traveler, I want all my itinerary day dates to automatically adjust when I change my flight date, so that my trip plan stays consistent.

#### Acceptance Criteria

1. WHEN the user confirms a new outbound flight with a different departure date, THE Itinerary_Card SHALL recalculate all Day_Card dates so that Day 1 corresponds to the new arrival date and each subsequent day increments by one.
2. WHEN the user confirms a new outbound flight with a different departure date, THE Itinerary_Card SHALL update the route bar start date and end date to reflect the new travel dates.
3. WHEN the user confirms a new return flight with a different departure date, THE Itinerary_Card SHALL update the route bar end date to match the new return date.
4. THE Itinerary_Card SHALL preserve all Day_Card activity content (names, descriptions, times, costs, tags) when recalculating dates.

### Requirement 6: Auto-Update Hotel Info on Hotel Change

**User Story:** As a traveler, I want the hotel card and cost summary to update when I select a new hotel, so that I see accurate information.

#### Acceptance Criteria

1. WHEN the user confirms a new hotel selection, THE Itinerary_Card SHALL update the Hotel_Card to display the new hotel name, stars, rating, price per night, image, and address.
2. WHEN the user confirms a new hotel selection, THE Cost_Tracker SHALL recalculate the hotel total as the new price per night multiplied by the number of nights.

### Requirement 7: Total Cost Tracker

**User Story:** As a traveler, I want to see a total estimated cost breakdown at the bottom of my itinerary, so that I can understand my trip budget at a glance.

#### Acceptance Criteria

1. THE Cost_Tracker SHALL display a cost breakdown section at the bottom of the scrollable itinerary content showing: outbound flight cost, return flight cost, hotel total (price per night × number of nights), estimated food cost, and estimated activities cost.
2. THE Cost_Tracker SHALL display a total estimated cost that is the sum of all individual cost items.
3. WHEN any flight or hotel data changes, THE Cost_Tracker SHALL recalculate and re-render the affected line items and the total.
4. IF a cost value is unavailable or not parseable, THEN THE Cost_Tracker SHALL display "—" for that line item and exclude the item from the total sum.

### Requirement 8: Persist Changes via Trip Update API

**User Story:** As a traveler, I want my flight and hotel changes to be saved to the backend, so that I do not lose my modifications.

#### Acceptance Criteria

1. WHEN the user confirms a new flight or hotel selection and a tripId exists, THE Itinerary_Card SHALL call the Trip_Update_API with the updated itinerary data.
2. IF the Trip_Update_API returns an error, THEN THE Itinerary_Card SHALL retain the updated data in the local state and log the error to the console without reverting the user-visible changes.
3. THE Itinerary_Card SHALL send the update request asynchronously without blocking the user interface.
