# Bugfix Requirements Document

## Introduction

The TravelAI app has 4 external API integrations that are non-functional on the frontend despite having fully implemented backend services. The Navigation bar has UI controls for currency and temperature unit but never fetches or displays live data. No geolocation hook exists, so the user's location is never detected. The AI chat and trip planner never invoke the restaurant/places API. Currency exchange rates are never fetched. These gaps render the external API features inert — the backend works, but the frontend never calls it.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the app loads in the browser THEN the system does not request geolocation permission and does not detect the user's current location (no `useLocation` hook exists)

1.2 WHEN the Navigation bar renders THEN the system does not display the user's current city/location name despite the backend `reverseGeocode()` endpoint being available

1.3 WHEN the Navigation bar renders with a temperature unit toggle (°C/°F) THEN the system never fetches weather data from `GET /api/external/weather` and displays no temperature or weather icon

1.4 WHEN the user toggles between °C and °F in the navbar THEN the system only changes the toggle state but does not fetch or display updated weather data in the corresponding unit

1.5 WHEN the user's location changes (e.g., geolocation updates) THEN the system does not re-fetch weather data for the new coordinates

1.6 WHEN the AI chat generates a trip response mentioning a destination THEN the system does not call the restaurant/places API (`GET /api/external/places`) to include nearby restaurant results in the response

1.7 WHEN the trip planner generates an itinerary THEN the system does not surface restaurant search results from the Overpass API alongside the itinerary

1.8 WHEN the Navigation bar renders with a currency selector dropdown THEN the system never fetches live exchange rates from `GET /api/external/currency` and does not display converted amounts

1.9 WHEN the user selects a different currency in the navbar dropdown THEN the system updates the preference store but does not fetch or display the exchange rate for the selected currency

### Expected Behavior (Correct)

2.1 WHEN the app loads in the browser THEN the system SHALL request geolocation permission via the Browser Geolocation API and, upon approval, obtain the user's latitude and longitude through a `useLocation` hook

2.2 WHEN the user's coordinates are obtained THEN the system SHALL call the backend reverse geocode endpoint and display the user's current city/location name in the Navigation bar

2.3 WHEN the user denies geolocation permission or the browser does not support it THEN the system SHALL gracefully handle the denial by showing a default/fallback state (e.g., no location displayed) without errors or crashes

2.4 WHEN the user's location coordinates are available THEN the system SHALL fetch current weather data from `GET /api/external/weather?lat=&lng=` via a `useWeather` hook and display the temperature and weather icon in the Navigation bar

2.5 WHEN the user toggles between °C and °F THEN the system SHALL re-fetch weather data with the appropriate unit parameter and update the displayed temperature accordingly

2.6 WHEN the user's location changes THEN the system SHALL re-fetch weather data for the new coordinates automatically

2.7 WHEN the AI chat agent processes a user message about a destination THEN the system SHALL have a restaurant search tool available in the backend AI tools that calls `searchPlaces()` or `findHalalRestaurants()` so restaurant data can be included in AI responses

2.8 WHEN the trip planner generates an itinerary for a destination THEN the system SHALL ensure the AI agent pipeline can invoke the places/restaurant search tool to include restaurant recommendations

2.9 WHEN the Navigation bar renders with a currency selector THEN the system SHALL fetch the current exchange rate from `GET /api/external/currency` via a `useCurrency` hook and display the rate relative to the user's selected currency

2.10 WHEN the user selects a different currency in the navbar dropdown THEN the system SHALL fetch the new exchange rate and update the displayed conversion accordingly

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user interacts with the currency dropdown THEN the system SHALL CONTINUE TO update the preference store's `currency` value and visually highlight the selected currency

3.2 WHEN the user clicks the °C/°F toggle THEN the system SHALL CONTINUE TO update the preference store's `tempUnit` value and toggle the button styling

3.3 WHEN the user navigates between pages THEN the system SHALL CONTINUE TO persist currency and temperature preferences via the Zustand persist middleware

3.4 WHEN the AI chat receives a user message THEN the system SHALL CONTINUE TO send it to `POST /api/chat` and display the AI response with the existing generative UI renderer

3.5 WHEN the trip planner submits a query THEN the system SHALL CONTINUE TO redirect to `/chat?q=` and process the trip through the existing AI agent pipeline

3.6 WHEN the backend weather, places, or currency services encounter an API error THEN the system SHALL CONTINUE TO return null/empty gracefully without crashing the server

3.7 WHEN the Navigation bar renders on desktop and mobile THEN the system SHALL CONTINUE TO display all existing UI elements (nav links, user dropdown, currency pill, temp toggle, mobile menu) without any styling or layout changes

3.8 WHEN the `externalAPI` methods in `frontend/src/lib/api.js` are called THEN the system SHALL CONTINUE TO attach the JWT token via the existing axios interceptor and handle 401 responses
