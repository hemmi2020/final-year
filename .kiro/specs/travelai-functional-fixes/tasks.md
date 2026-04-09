# Implementation Plan

- [x] 1. Fix English city names in Nominatim geocode requests
  - [x] 1.1 Add `accept-language: en` header to `mapsService.geocode()`
    - In `backend/services/external/mapsService.js`, update the `geocode()` function
    - Add `'Accept-Language': 'en'` to the existing `headers` object alongside `'User-Agent'`
    - This ensures Nominatim returns `displayName` in English regardless of the city's locale
    - _Bug_Condition: input.action == "geocodeCity" AND nominatimReturnsNonEnglish(input.city)_
    - _Expected_Behavior: City names returned in English for all geocode requests_
    - _Preservation: Geocode lat/lng coordinates, type, and structure remain unchanged_
    - _Requirements: 2.4_

- [x] 2. Add fallback restaurant data when Overpass API returns empty
  - [x] 2.1 Add `FALLBACK_RESTAURANTS` map to `mapsService.js`
    - In `backend/services/external/mapsService.js`, add a `FALLBACK_RESTAURANTS` constant at the top
    - Key by lowercase city name for: Tokyo, Istanbul, Paris, Dubai, Bali, London, New York, Bangkok, Rome, Barcelona, Maldives, Marrakech
    - Each entry: array of objects with `{ name, cuisine, address, dietary: {}, isFallback: true }`
    - _Requirements: 2.1_
  - [x] 2.2 Update `searchPlaces()` to return fallback data when results are empty
    - After the Overpass query and dietary filtering, check if `results.length === 0` and `type === 'restaurant'`
    - Extract city name from the `query` parameter (lowercase)
    - Look up city in `FALLBACK_RESTAURANTS` map and return fallback array if found
    - If city not in map, return empty array as before
    - _Bug_Condition: overpassAPIReturnsEmpty(input.city, "restaurant")_
    - _Expected_Behavior: Fallback restaurant list displayed for known cities_
    - _Preservation: When Overpass returns valid results, those real results display (not fallback) per 3.1_
    - _Requirements: 2.1, 3.1_

- [x] 3. Make attractions clickable with Google Maps links
  - [x] 3.1 Update attraction items in `destinations/page.jsx`
    - In `frontend/src/app/destinations/page.jsx`, find the attractions `.map()` rendering block
    - Wrap each attraction item in an `<a>` tag with `href="https://www.google.com/maps/search/${encodeURIComponent(a.name + ' ' + (result.displayName?.split(',')[0] || ''))}"` and `target="_blank"` / `rel="noopener noreferrer"`
    - Add `cursor: "pointer"` style and hover background color change via `onMouseEnter`/`onMouseLeave` state or inline styles
    - Add a small visual indicator (e.g., external link icon or arrow) to signal clickability
    - _Bug_Condition: attractionListRendered(input.city) with no click handler_
    - _Expected_Behavior: Each attraction opens Google Maps search on click_
    - _Preservation: Attraction name, type display, and list structure remain unchanged per 3.7_
    - _Requirements: 2.2_

- [x] 4. Add retry logic and localStorage caching for destination data fetching
  - [x] 4.1 Create `fetchWithRetry` utility and cache helpers in `destinations/page.jsx`
    - Add a `fetchWithRetry(fn, retries = 3, delay = 1000)` function that wraps async calls with retry on failure
    - Add `getCached(key)` helper that reads from localStorage and checks expiry timestamp
    - Add `setCache(key, data, ttl = 30 * 60 * 1000)` helper that writes to localStorage with expiry
    - _Requirements: 2.3_
  - [x] 4.2 Integrate retry and caching into `searchDestination()`
    - In `searchDestination()`, before fetching, check cache for each data type (keyed by city name, e.g., `dest_weather_tokyo`)
    - If cached data exists and is not expired, set state immediately from cache
    - Wrap each `externalAPI` call (`weather`, `places`, `attractions`) in `fetchWithRetry()`
    - On successful fetch, update cache via `setCache()` and update state
    - Ensure successful first-attempt fetches display immediately without unnecessary delays per 3.8
    - _Bug_Condition: fetchFails(input.endpoint) OR previousDataExists(input.cacheKey)_
    - _Expected_Behavior: Retry up to 3 times, cache with 30-min expiry, show cached data while refreshing_
    - _Preservation: Successful first-attempt fetches display immediately per 3.8_
    - _Requirements: 2.3, 3.8_

- [x] 5. Fix auth hydration flicker
  - [x] 5.1 Add `hasHydrated` flag to `authStore.js`
    - In `frontend/src/store/authStore.js`, add `hasHydrated: false` to the initial state
    - Use Zustand persist's `onRehydrateStorage` callback to set `hasHydrated: true` after rehydration completes
    - _Requirements: 2.5_
  - [x] 5.2 Gate auth-dependent UI in `Navigation.jsx` on hydration status
    - In `frontend/src/components/layout/Navigation.jsx`, read `hasHydrated` from `useAuthStore`
    - While `!hasHydrated`, render a minimal placeholder (small skeleton or empty space) for the user controls area instead of the logged-out buttons
    - Unauthenticated users must still see logged-out state immediately after hydration (no blocking spinner) per 3.4
    - _Bug_Condition: zustandNotYetHydrated() AND userIsAuthenticated()_
    - _Expected_Behavior: Loading placeholder shown until hydration completes, then correct auth state_
    - _Preservation: Unauthenticated users see logged-out state immediately after hydration per 3.4; login/logout flow unchanged per 3.5_
    - _Requirements: 2.5, 3.4, 3.5_

- [x] 6. Add global cursor pointer CSS rules
  - [x] 6.1 Add cursor pointer rules to `globals.css`
    - In `frontend/src/app/globals.css`, add global rules for interactive elements:
      ```css
      button,
      a,
      [role="button"],
      input[type="submit"],
      input[type="button"],
      select,
      label[for],
      .card,
      .pill-action,
      .choice-card,
      .btn-orange,
      .btn-outline,
      .btn-ghost {
        cursor: pointer;
      }
      button:disabled {
        cursor: not-allowed;
      }
      ```
    - Place these rules in the `@layer base` section or after the existing button/card styles
    - _Bug_Condition: elementIsInteractive(input.element) AND cursorIsNotPointer(input.element)_
    - _Expected_Behavior: All interactive elements show pointer cursor on hover_
    - _Preservation: Theme, layout, and existing cursor styles on .btn-orange etc. remain unchanged per 3.6_
    - _Requirements: 2.6_

- [x] 7. Checkpoint — Ensure all fixes work correctly
  - Verify English city names: search a non-Latin city (e.g., "Islamabad") and confirm English display name
  - Verify fallback restaurants: search a city where Overpass returns empty and confirm fallback data appears
  - Verify clickable attractions: search a city and confirm attraction items are clickable links to Google Maps
  - Verify retry/cache: confirm retry on failed fetches and cached data loads on repeat searches
  - Verify auth hydration: refresh page while authenticated and confirm no flash of logged-out UI
  - Verify cursor pointer: hover over buttons, cards, links and confirm pointer cursor
  - Verify preservation: real API results still display when available, weather works, destination cards clickable, login/logout works
