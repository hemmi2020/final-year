# Bugfix Requirements Document

## Introduction

The TravelAI Next.js application has six functional issues affecting the destinations page, authentication flow, and global UI interactivity. These bugs degrade user experience through empty restaurant results, non-interactive attraction listings, inconsistent data loading, non-English city names, authentication flicker on page load, and missing cursor pointer styles on clickable elements. This document captures the current defective behavior, the expected correct behavior, and the existing behavior that must be preserved during the fix.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user searches for a destination city THEN the restaurant section displays "No restaurants found" because the Overpass API query returns empty results for many cities and dietary filtering can remove all remaining results

1.2 WHEN a user views the attractions list for a searched destination THEN the attraction items are plain non-interactive divs with no click handler, no cursor pointer, and no hover feedback

1.3 WHEN a user searches for destination data (weather, restaurants, attractions) THEN the data fetching sometimes succeeds and sometimes fails silently with no retry mechanism, no caching, and no fallback to previously loaded data

1.4 WHEN a user searches for a city and the Nominatim geocode API returns the result THEN the city name displays in Urdu or local script instead of English because the `mapsService.geocode()` call does not include an `accept-language: en` header

1.5 WHEN a user loads or refreshes any page while authenticated THEN the UI briefly flickers showing logged-out state before showing logged-in state because the Zustand persist middleware has a hydration delay and there is no loading/hydrating state to gate the render

1.6 WHEN a user hovers over buttons, links, and other clickable elements across the application THEN the cursor does not change to pointer because global CSS rules for cursor styles are missing for many interactive elements

### Expected Behavior (Correct)

2.1 WHEN a user searches for a destination city and the Overpass API returns empty restaurant results THEN the system SHALL fall back to a hardcoded list of popular restaurants for known cities, and each restaurant SHALL display its name, cuisine type, address, and rating if available

2.2 WHEN a user views the attractions list for a searched destination THEN each attraction item SHALL be clickable, opening a Google Maps link in the format `https://www.google.com/maps/search/{ATTRACTION_NAME}+{CITY}`, SHALL display cursor pointer on hover, and SHALL show a subtle background color change on hover

2.3 WHEN a data fetch for destination information fails THEN the system SHALL retry up to 3 times with a 1-second delay between attempts, SHALL cache successful responses in localStorage with a 30-minute expiry, and SHALL show cached data instantly while refreshing in the background

2.4 WHEN the Nominatim geocode API is called THEN the system SHALL include an `accept-language: en` header in the request so that city names are returned in English

2.5 WHEN a user loads or refreshes any page while authenticated THEN the system SHALL display a loading or hydrating state until the Zustand auth store has fully rehydrated, preventing any flash of unauthenticated content

2.6 WHEN a user hovers over any button, link, or clickable element in the application THEN the system SHALL display a pointer cursor via global CSS rules added to `globals.css`

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the Overpass API returns valid restaurant results for a city THEN the system SHALL CONTINUE TO display those real results rather than fallback data

3.2 WHEN a user views weather data for a searched destination THEN the system SHALL CONTINUE TO display temperature, description, feels-like, humidity, and wind speed correctly

3.3 WHEN a user clicks on a featured or grid destination card THEN the system SHALL CONTINUE TO trigger a search for that destination and display results

3.4 WHEN a user is not authenticated THEN the system SHALL CONTINUE TO show the logged-out state without any loading spinner blocking access

3.5 WHEN a user logs in or logs out THEN the system SHALL CONTINUE TO update the auth state and persist it to localStorage correctly

3.6 WHEN the application color theme (orange/white), image layout, and overall page structure are rendered THEN the system SHALL CONTINUE TO display them unchanged

3.7 WHEN a user interacts with the search bar, destination cards, and "Plan a Trip Here" button THEN the system SHALL CONTINUE TO function as they currently do

3.8 WHEN data fetches succeed on the first attempt THEN the system SHALL CONTINUE TO display results immediately without unnecessary delays from retry logic
