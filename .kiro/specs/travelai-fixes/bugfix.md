# Bugfix Requirements Document

## Introduction

The TravelAI Next.js application has four interrelated issues affecting the destinations page, navbar currency display, navbar temperature display, and overall API loading performance. The destinations search hangs indefinitely when the geocode API is slow, the currency system relies on a manual dropdown instead of auto-detecting from the selected destination, the temperature display only reflects the user's IP-based location rather than the selected destination city, and multiple components independently re-fetch the same IP-based location data causing slow navbar rendering. These issues degrade the user experience across the core navigation and destination discovery flows.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user searches for a destination on `/destinations` and `externalAPI.geocode(name)` takes longer than 5 seconds THEN the system displays the "Searching destinations..." spinner indefinitely with no timeout or fallback, leaving the user stuck on a loading state

1.2 WHEN a user wants to see currency exchange rates in the navbar THEN the system requires manual selection from a hardcoded `CURRENCIES` dropdown (USD, EUR, GBP, PKR, AED, INR) instead of automatically detecting the destination country's currency

1.3 WHEN a user selects a destination on the destinations page THEN the system does not share the selected destination's city/country/currency with the navbar components, so the navbar currency and temperature remain based on the user's IP location only

1.4 WHEN the navbar displays temperature THEN the system always fetches weather using the user's IP-detected lat/lng coordinates via `useWeather(lat, lng)` and never updates to reflect the selected destination city

1.5 WHEN the `useWeather` hook is called THEN the system only supports lat/lng-based weather fetching and has no capability to fetch weather by city name using the `?q={CITY_NAME}` endpoint

1.6 WHEN the app loads and multiple components (Navigation, pages) need IP location data THEN the system calls `ip-api.com` independently in each component via `useLocation()`, causing redundant network requests and slow initial rendering

1.7 WHEN the navbar fetches weather data from OpenWeatherMap THEN the system makes a fresh API call on every render/mount with no caching, causing unnecessary network requests and slow data display

1.8 WHEN the navbar fetches exchange rate data THEN the system makes a fresh API call on every render/mount with no caching, causing unnecessary network requests and slow data display

### Expected Behavior (Correct)

2.1 WHEN a user searches for a destination on `/destinations` and `externalAPI.geocode(name)` takes longer than 5 seconds THEN the system SHALL abort the API call, stop the loading spinner, and display the fallback data from the hardcoded `DESTINATIONS` array (12 items) so the user is never stuck on an infinite loading state

2.2 WHEN a user is viewing the navbar currency display THEN the system SHALL auto-detect the home currency from `ip-api.com` (via the existing `useLocation` hook) and auto-fetch the destination country's currency when a destination is selected, removing the hardcoded `CURRENCIES` constant and preset dropdown buttons from `Navigation.jsx`

2.3 WHEN a user selects a destination on the destinations page THEN the system SHALL store the destination city, country, and currency in a global Zustand destination store so that the navbar currency display and temperature display automatically update to reflect the selected destination

2.4 WHEN a destination city is set in the global destination store THEN the system SHALL fetch weather for that specific destination city using the `?q={CITY_NAME}` endpoint, and WHEN no destination is set THEN the system SHALL fetch weather for the user's IP-detected city (current default behavior)

2.5 WHEN the `useWeather` hook is called THEN the system SHALL support both lat/lng mode (for IP-based location) and city name mode (for destination-based weather), selecting the appropriate OpenWeatherMap endpoint based on the provided parameters

2.6 WHEN the app loads THEN the system SHALL fetch `ip-api.com` data exactly once and store it in a global context or state, so all components that need location data read from the shared store instead of making independent API calls

2.7 WHEN weather data is fetched from OpenWeatherMap THEN the system SHALL cache the response in localStorage with a timestamp and serve cached data for 10 minutes before making a new API request, showing cached data instantly while refreshing in the background

2.8 WHEN exchange rate data is fetched THEN the system SHALL cache the response in localStorage with a timestamp and serve cached data for 1 hour before making a new API request, showing cached data instantly while refreshing in the background

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the destinations page initially loads (no search performed) THEN the system SHALL CONTINUE TO display the full `DESTINATIONS` grid with 12 curated destination cards (Featured + All sections) exactly as before

3.2 WHEN a destination search completes successfully within 5 seconds THEN the system SHALL CONTINUE TO display the geocoded result with weather, restaurants, and attractions data as it does currently

3.3 WHEN the user toggles between °C and °F temperature units THEN the system SHALL CONTINUE TO convert and display temperature in the selected unit correctly

3.4 WHEN the user is on any page other than destinations THEN the system SHALL CONTINUE TO render that page with no changes to its data fetching logic, styling, or layout

3.5 WHEN the navbar renders THEN the system SHALL CONTINUE TO display the same UI styling, colors, layout, fonts, and icon design without any visual changes

3.6 WHEN no destination is selected THEN the navbar currency display SHALL CONTINUE TO show the user's home currency symbol (detected from IP)

3.7 WHEN the user interacts with the user dropdown, mobile menu, or authentication modals in the navbar THEN the system SHALL CONTINUE TO function identically to current behavior
