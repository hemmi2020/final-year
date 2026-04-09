# TravelAI Functional Fixes — Bugfix Design

## Overview

Six functional bugs affect the TravelAI application across the destinations page, authentication flow, and global UI. The fixes target: (1) empty restaurant results from Overpass API by adding hardcoded fallbacks, (2) non-interactive attraction listings by adding click-to-Google-Maps links, (3) unreliable data fetching by adding retry logic and localStorage caching, (4) non-English city names by adding `accept-language: en` to Nominatim requests, (5) auth hydration flicker by gating renders on Zustand rehydration, and (6) missing pointer cursors by adding global CSS rules.

## Glossary

- **Bug_Condition (C)**: The set of conditions across 6 issues that trigger defective behavior — empty restaurants, non-clickable attractions, failed fetches without retry, non-English names, auth flicker, missing cursors
- **Property (P)**: The desired correct behavior for each bug condition — fallback data, clickable links, retry+cache, English names, hydration gate, pointer cursors
- **Preservation**: Existing behaviors that must remain unchanged — real API results when available, weather display, destination card clicks, unauthenticated access, login/logout flow, theme/layout
- **mapsService.geocode()**: Backend function in `backend/services/external/mapsService.js` that calls Nominatim to convert place names to coordinates
- **mapsService.searchPlaces()**: Backend function that queries Overpass API for nearby restaurants/places
- **DestinationsPage**: Frontend page component at `frontend/src/app/destinations/page.jsx` that renders search, weather, restaurants, and attractions
- **authStore**: Zustand store at `frontend/src/store/authStore.js` using `persist` middleware for auth state

## Bug Details

### Bug Condition

The bugs manifest across six independent conditions in the application. Each condition is independently triggerable.

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type UserInteraction
  OUTPUT: boolean

  // Bug 1: Empty restaurants
  condition1 := input.action == "searchDestination"
                AND overpassAPIReturnsEmpty(input.city, "restaurant")

  // Bug 2: Non-interactive attractions
  condition2 := input.action == "viewAttractions"
                AND attractionListRendered(input.city)

  // Bug 3: Unreliable fetches
  condition3 := input.action == "fetchDestinationData"
                AND (fetchFails(input.endpoint) OR previousDataExists(input.cacheKey))

  // Bug 4: Non-English city names
  condition4 := input.action == "geocodeCity"
                AND nominatimReturnsNonEnglish(input.city)

  // Bug 5: Auth hydration flicker
  condition5 := input.action == "pageLoad"
                AND userIsAuthenticated()
                AND zustandNotYetHydrated()

  // Bug 6: Missing cursor pointer
  condition6 := input.action == "hoverClickable"
                AND elementIsInteractive(input.element)
                AND cursorIsNotPointer(input.element)

  RETURN condition1 OR condition2 OR condition3
         OR condition4 OR condition5 OR condition6
END FUNCTION
```

### Examples

- **Bug 1**: User searches "Marrakech" → Overpass returns 0 restaurants → UI shows "No restaurants found" instead of fallback data
- **Bug 2**: User searches "Tokyo" → attractions list renders plain `<div>` elements → no click handler, no hover effect, no way to explore further
- **Bug 3**: User searches "Bali" → weather API times out → no retry, no cached data shown, section stays empty
- **Bug 4**: User searches "Islamabad" → Nominatim returns "اسلام آباد" → displayed in Urdu instead of "Islamabad"
- **Bug 5**: Authenticated user refreshes page → sees logged-out navbar for ~200ms → then switches to logged-in state
- **Bug 6**: User hovers over destination cards, nav buttons, dropdown items → cursor stays as default arrow instead of pointer

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- When Overpass API returns valid restaurant results, those real results must display (not fallback)
- Weather display (temperature, description, feels-like, humidity, wind speed) must continue working correctly
- Clicking featured/grid destination cards must continue triggering searches
- Unauthenticated users must see logged-out state immediately without a loading spinner blocking access
- Login/logout must continue updating auth state and persisting to localStorage
- Application theme (orange/white), image layout, and page structure must remain unchanged
- Search bar, destination cards, and "Plan a Trip Here" button must continue functioning
- Successful first-attempt fetches must display results immediately without retry delays

**Scope:**
All inputs that do NOT match any of the six bug conditions should be completely unaffected. This includes:

- Mouse clicks on elements that already have correct cursor styles
- API responses that return valid, non-empty data on first attempt
- Geocode responses already in English
- Page loads when user is not authenticated
- Attractions display (structure remains the same, just gains interactivity)

## Hypothesized Root Cause

1. **Empty Restaurants (Bug 1)**: `mapsService.searchPlaces()` relies entirely on Overpass API which has sparse restaurant data for many cities. The `dietary` filter in `externalController.places` further reduces results. No fallback mechanism exists.

2. **Non-Interactive Attractions (Bug 2)**: In `destinations/page.jsx`, the attractions `.map()` renders plain `<div>` elements with no `onClick`, no `cursor: pointer`, and no hover styles. The data has `name` and `type` but no link is generated.

3. **Unreliable Fetches (Bug 3)**: `searchDestination()` in `destinations/page.jsx` uses `Promise.allSettled` but has no retry logic. Failed requests silently resolve to empty state. No caching layer exists — every search re-fetches everything.

4. **Non-English City Names (Bug 4)**: `mapsService.geocode()` calls Nominatim without `accept-language` header. Nominatim defaults to the local language of the result, so cities in non-Latin-script countries return names in local script.

5. **Auth Hydration Flicker (Bug 5)**: `authStore` uses Zustand `persist` middleware which hydrates asynchronously from localStorage. `Navigation.jsx` reads `isAuthenticated` immediately on render, getting `false` before hydration completes, causing a flash of logged-out UI.

6. **Missing Cursor Pointer (Bug 6)**: `globals.css` has no global `cursor: pointer` rules for `button`, `a`, `[role="button"]`, or other interactive elements. Individual components use inline `cursor: "pointer"` inconsistently.

## Correctness Properties

Property 1: Bug Condition - Fallback Restaurant Data

_For any_ destination search where the Overpass API returns zero restaurant results, the fixed system SHALL display a hardcoded fallback list of popular restaurants for known cities, each showing name, cuisine type, and address.

**Validates: Requirements 2.1**

Property 2: Bug Condition - Clickable Attractions

_For any_ attraction item rendered in the search results, the fixed system SHALL make it clickable with a Google Maps link (`https://www.google.com/maps/search/{name}+{city}`), display `cursor: pointer` on hover, and show a subtle background color change on hover.

**Validates: Requirements 2.2**

Property 3: Bug Condition - Retry and Cache for Data Fetching

_For any_ failed data fetch for destination information, the fixed system SHALL retry up to 3 times with 1-second delays, cache successful responses in localStorage with 30-minute expiry, and show cached data while refreshing in the background.

**Validates: Requirements 2.3**

Property 4: Bug Condition - English City Names

_For any_ geocode request to Nominatim, the fixed system SHALL include `accept-language: en` header so city names are returned in English.

**Validates: Requirements 2.4**

Property 5: Bug Condition - Auth Hydration Gate

_For any_ page load by an authenticated user, the fixed system SHALL display a loading state until the Zustand auth store has fully rehydrated, preventing flash of unauthenticated content.

**Validates: Requirements 2.5**

Property 6: Bug Condition - Pointer Cursor on Interactive Elements

_For any_ button, link, or clickable element in the application, the fixed system SHALL display a pointer cursor on hover via global CSS rules.

**Validates: Requirements 2.6**

Property 7: Preservation - Existing Functionality

_For any_ input where none of the six bug conditions hold, the fixed system SHALL produce the same behavior as the original system, preserving real API results, weather display, destination card clicks, unauthenticated access, auth persistence, and theme/layout.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

**File**: `backend/services/external/mapsService.js`

**Function**: `geocode()`

**Bug 4 Fix — English City Names:**

1. Add `'Accept-Language': 'en'` to the `headers` object in the Nominatim GET request
2. This ensures `displayName` is returned in English regardless of the city's locale

---

**File**: `backend/services/external/mapsService.js`

**Function**: `searchPlaces()`

**Bug 1 Fix — Fallback Restaurant Data:**

1. Add a `FALLBACK_RESTAURANTS` map keyed by city name (lowercase) containing popular restaurants for known cities (Tokyo, Istanbul, Paris, Dubai, Bali, London, New York, Bangkok, Rome, Barcelona, Maldives, Marrakech)
2. After the Overpass query and dietary filtering, if `results.length === 0` and `type === 'restaurant'`, look up the city in the fallback map
3. Return fallback data with `{ name, cuisine, address, dietary: {}, isFallback: true }` structure

---

**File**: `frontend/src/app/destinations/page.jsx`

**Bug 2 Fix — Clickable Attractions:**

1. Wrap each attraction item in an `<a>` tag with `href="https://www.google.com/maps/search/${encodeURIComponent(a.name + ' ' + (result.displayName?.split(',')[0] || ''))}"` and `target="_blank"` / `rel="noopener noreferrer"`
2. Add `cursor: "pointer"` and hover background color change via inline styles or onMouseEnter/onMouseLeave

**Bug 3 Fix — Retry and Cache:**

1. Create a utility function `fetchWithRetry(fn, retries = 3, delay = 1000)` that wraps API calls with retry logic
2. Create `getCached(key)` and `setCache(key, data, ttl = 30 * 60 * 1000)` helpers using localStorage with expiry timestamps
3. In `searchDestination()`, check cache first for each endpoint (keyed by city name), return cached data immediately, then fetch in background
4. Wrap each `externalAPI` call in `fetchWithRetry()`
5. On successful fetch, update cache and state

---

**File**: `frontend/src/store/authStore.js`

**Bug 5 Fix — Auth Hydration Gate:**

1. Add a `hasHydrated` boolean field (default `false`) to the store
2. Use Zustand persist's `onRehydrateStorage` callback to set `hasHydrated = true` after rehydration completes
3. Export a `useAuthHydrated()` hook or expose `hasHydrated` in the store

**File**: `frontend/src/components/layout/Navigation.jsx`

**Bug 5 Fix (continued):**

1. Read `hasHydrated` from `authStore`
2. While `!hasHydrated`, render a minimal placeholder for the user controls area (e.g., a small skeleton or empty space) instead of the logged-out buttons

---

**File**: `frontend/src/app/globals.css`

**Bug 6 Fix — Pointer Cursors:**

1. Add global rules:
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
   ```
2. Add `button:disabled { cursor: not-allowed; }` to override for disabled buttons

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write tests that exercise each bug condition on the unfixed code to observe failures.

**Test Cases**:

1. **Empty Restaurants Test**: Call `searchPlaces("Marrakech", lat, lng, { type: "restaurant" })` and verify it returns empty (will fail on unfixed code)
2. **Attraction Click Test**: Render DestinationsPage, search a city, verify attraction items have no onClick handler (will fail on unfixed code)
3. **Fetch Retry Test**: Mock a failing API endpoint and verify no retry occurs (will fail on unfixed code)
4. **Non-English Name Test**: Call `geocode("Islamabad")` and check if displayName contains non-Latin characters (will fail on unfixed code)
5. **Auth Flicker Test**: Set auth state in localStorage, render Navigation, check if logged-out UI flashes before hydration (will fail on unfixed code)
6. **Cursor Test**: Render buttons/cards and verify computed cursor style is not "pointer" for many elements (will fail on unfixed code)

**Expected Counterexamples**:

- `searchPlaces` returns `[]` for many cities due to sparse Overpass data
- Attraction divs have no click handler or href
- Failed fetches are not retried
- Nominatim returns local-script names without `accept-language` header

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**

```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedSystem(input)
  ASSERT expectedBehavior(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**

```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalSystem(input) = fixedSystem(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:

- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for successful API calls, weather display, and card interactions, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Real Restaurant Preservation**: When Overpass returns valid results, verify those results display (not fallback)
2. **Weather Display Preservation**: Verify weather data renders correctly after all fixes
3. **Card Click Preservation**: Verify destination cards still trigger searches
4. **Unauthenticated Access Preservation**: Verify non-authenticated users see logged-out state immediately
5. **Auth Persistence Preservation**: Verify login/logout still persists correctly

### Unit Tests

- Test `geocode()` includes `accept-language: en` header (mock axios, inspect request headers)
- Test `searchPlaces()` returns fallback data when Overpass returns empty for known cities
- Test `searchPlaces()` returns real data when Overpass returns results (no fallback)
- Test `fetchWithRetry()` retries 3 times on failure then throws
- Test `fetchWithRetry()` returns immediately on first success without delay
- Test cache helpers: `setCache` stores with expiry, `getCached` returns null for expired entries
- Test `authStore.hasHydrated` is false initially and true after rehydration
- Test attraction items render with correct Google Maps href

### Property-Based Tests

- Generate random city names and verify `geocode()` always includes `accept-language: en` header
- Generate random Overpass responses (empty/non-empty) and verify fallback logic activates only when empty
- Generate random fetch success/failure sequences and verify retry count never exceeds 3
- Generate random auth states and verify hydration gate prevents flicker

### Integration Tests

- Test full destination search flow: search → geocode → weather + restaurants + attractions all render
- Test destination search with failing APIs: verify retry, cache, and fallback behavior end-to-end
- Test page refresh with authenticated user: verify no flash of logged-out content
- Test hover states across multiple page components for pointer cursor
