# TravelAI Fixes — Bugfix Design

## Overview

The TravelAI frontend has four interrelated bugs: (1) the destinations search hangs indefinitely when the geocode API is slow, (2) the navbar currency system uses a hardcoded dropdown instead of auto-detecting from the selected destination, (3) the navbar temperature always shows the user's IP-based location instead of the selected destination city, and (4) multiple components independently fetch `ip-api.com` data with no caching for weather or currency responses. The fix introduces a 5-second AbortController timeout with fallback on the destinations page, a global Zustand `destinationStore` that shares selected city/country/currency across components, a dual-mode `useWeather` hook supporting city-name queries, a single-fetch `useLocation` with module-level promise deduplication, and localStorage-based caching for weather (10 min TTL) and currency (1 hr TTL) responses.

## Glossary

- **Bug_Condition (C)**: The set of conditions that trigger any of the four bugs — slow geocode with no timeout, manual currency selection, IP-only temperature, redundant API calls with no caching
- **Property (P)**: The desired behavior — timeout with fallback, auto-detected destination currency, city-level temperature, single IP fetch with cached weather/currency
- **Preservation**: Existing behaviors that must remain unchanged — destination grid rendering, successful search results, °C/°F toggle, navbar styling, user dropdown, mobile menu, authentication modals
- **`searchDestination(name)`**: The async function in `destinations/page.jsx` that calls `externalAPI.geocode(name)` and fetches weather/restaurants/attractions
- **`useLocation()`**: Hook in `hooks/useLocation.js` that fetches IP-based location from `ip-api.com`
- **`useWeather(lat, lng, unit)`**: Hook in `hooks/useWeather.js` that fetches weather from OpenWeatherMap by lat/lng
- **`useCurrency(from, to)`**: Hook in `hooks/useCurrency.js` that fetches exchange rates
- **`CURRENCIES`**: Hardcoded array of 6 currency presets in `Navigation.jsx`
- **`destinationStore`**: New Zustand store to be created at `store/destinationStore.js` for sharing selected destination state globally

## Bug Details

### Bug Condition

The bugs manifest across four scenarios: (1) when `externalAPI.geocode()` takes longer than 5 seconds with no abort mechanism, (2) when the navbar requires manual currency selection from a hardcoded list instead of reading from the selected destination, (3) when the navbar temperature display only uses IP-based lat/lng and ignores the selected destination city, and (4) when `useLocation`, `useWeather`, and `useCurrency` make redundant uncached API calls on every mount.

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type AppInteraction
  OUTPUT: boolean

  // Bug 1: Geocode timeout
  IF input.type == "destinationSearch"
     AND input.geocodeResponseTime > 5000ms
     AND NOT abortControllerExists(input.searchCall)
     RETURN true

  // Bug 2: Manual currency selection
  IF input.type == "currencyDisplay"
     AND input.destinationSelected == true
     AND input.currencySource == "hardcodedDropdown"
     RETURN true

  // Bug 3: IP-only temperature
  IF input.type == "temperatureDisplay"
     AND input.destinationCity != null
     AND input.weatherQueryMode == "latLngOnly"
     RETURN true

  // Bug 4: Redundant uncached API calls
  IF input.type == "componentMount"
     AND (input.ipApiFetchCount > 1
          OR (input.weatherCacheAge < 600000 AND input.weatherFetchTriggered)
          OR (input.currencyCacheAge < 3600000 AND input.currencyFetchTriggered))
     RETURN true

  RETURN false
END FUNCTION
```

### Examples

- **Bug 1**: User searches "Kyoto" → geocode API takes 12 seconds → spinner shows "Searching destinations..." indefinitely → user is stuck. Expected: after 5 seconds, abort the call and show the fallback `DESTINATIONS` array.
- **Bug 2**: User clicks "Tokyo" on destinations page → navbar still shows "USD 1 = USD 1" → user must manually open currency dropdown and select JPY. Expected: navbar auto-detects JPY from the destination and shows "USD 1 = JPY 149.50".
- **Bug 3**: User selects "Paris" destination → navbar temperature still shows weather for user's IP city (e.g., "32°C" in Karachi) instead of Paris weather. Expected: navbar shows Paris temperature via `?q=Paris` endpoint.
- **Bug 4**: App loads → `Navigation.jsx` calls `useLocation()` which fetches `ip-api.com` → if another component also calls `useLocation()`, a second fetch fires. Weather and currency data re-fetched on every navbar re-render. Expected: single IP fetch, weather cached 10 min, currency cached 1 hr.
- **Edge case**: User searches "Atlantis" → geocode returns no data within 5 seconds → system correctly shows no result (not a bug condition, already handled by the `if (!geo.data.data)` check).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- The destinations page initial load SHALL continue to display the full 12-card `DESTINATIONS` grid (3 Featured + 9 All) exactly as before
- A successful geocode search completing within 5 seconds SHALL continue to display weather, restaurants, and attractions results
- The °C/°F toggle button in the navbar SHALL continue to convert and display temperature in the selected unit
- All pages other than destinations SHALL continue to render with no changes to data fetching, styling, or layout
- The navbar UI styling, colors, layout, fonts, and icon design SHALL remain visually identical
- When no destination is selected, the navbar currency display SHALL continue to show the user's home currency from IP detection
- The user dropdown, mobile menu, and authentication modals SHALL continue to function identically
- Mouse clicks on destination cards SHALL continue to trigger `searchDestination(d.name)` as before

**Scope:**
All inputs that do NOT involve (a) slow geocode responses, (b) destination-based currency/temperature display, or (c) repeated API fetches should be completely unaffected by this fix. This includes:

- Normal-speed geocode searches completing under 5 seconds
- Initial page loads with no destination selected
- User authentication flows
- Non-destination pages

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

1. **No AbortController on geocode call**: `searchDestination()` in `destinations/page.jsx` calls `externalAPI.geocode(name)` with no timeout or abort mechanism. The `axios.get` call will wait indefinitely for a response, keeping `loading` state `true` forever if the server is slow.

2. **Hardcoded CURRENCIES array with manual dropdown**: `Navigation.jsx` defines a `CURRENCIES` constant with 6 preset currencies and renders them as dropdown buttons. There is no mechanism to read the destination's currency — the `destinationCurrency` in `preferenceStore` defaults to `"USD"` and only changes via manual user interaction.

3. **No global destination state**: When a user selects a destination on the destinations page, the city/country/currency information stays local to `DestinationsPage` component state. The navbar has no way to know which destination was selected because there is no shared store.

4. **`useWeather` only supports lat/lng mode**: The hook signature is `useWeather(lat, lng, unit)` and the fetch URL is hardcoded to `?lat=${lat}&lon=${lng}`. There is no code path to use the OpenWeatherMap `?q={cityName}` endpoint, so the navbar can only show weather for the IP-detected coordinates.

5. **`useLocation` creates a new fetch per hook instance**: Each call to `useLocation()` runs its own `useEffect` with `fetch("https://ip-api.com/json/...")`. There is no module-level singleton, promise deduplication, or caching — every component that mounts with `useLocation()` fires a separate HTTP request.

6. **No localStorage caching for weather or currency**: `useWeather` and `useCurrency` both fetch fresh data on every mount/re-render cycle. Neither hook checks localStorage for a recent cached response before making a network request.

## Correctness Properties

Property 1: Bug Condition — Geocode Timeout with Fallback

_For any_ destination search where `externalAPI.geocode(name)` takes longer than 5 seconds, the fixed `searchDestination` function SHALL abort the API call, set `loading` to `false`, and display the fallback `DESTINATIONS` array so the user is never stuck on an infinite loading state.

**Validates: Requirements 2.1**

Property 2: Bug Condition — Dynamic Destination Currency

_For any_ destination selection that sets a city/country/currency in the global `destinationStore`, the fixed navbar SHALL auto-detect the destination currency and display the exchange rate from the user's home currency (from IP) to the destination currency, without requiring manual dropdown selection.

**Validates: Requirements 2.2, 2.3**

Property 3: Bug Condition — City-Level Temperature Display

_For any_ state where a destination city is set in the global `destinationStore`, the fixed `useWeather` hook SHALL fetch weather using the `?q={cityName}` endpoint for that destination city, and when no destination is set, SHALL fall back to the IP-based lat/lng weather query.

**Validates: Requirements 2.4, 2.5**

Property 4: Bug Condition — Single IP Fetch and API Caching

_For any_ app session, the fixed `useLocation` hook SHALL fetch `ip-api.com` data exactly once (via module-level promise deduplication), the fixed `useWeather` hook SHALL serve localStorage-cached weather data for 10 minutes before re-fetching, and the fixed `useCurrency` hook SHALL serve localStorage-cached exchange rate data for 1 hour before re-fetching.

**Validates: Requirements 2.6, 2.7, 2.8**

Property 5: Preservation — Unchanged Behaviors

_For any_ input where the bug condition does NOT hold (normal-speed searches, initial page loads, non-destination pages, user auth flows), the fixed code SHALL produce exactly the same behavior as the original code, preserving the destination grid display, successful search results, °C/°F toggle, navbar styling, user dropdown, mobile menu, and authentication modals.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `frontend/src/app/destinations/page.jsx`

**Function**: `searchDestination(name)`

**Specific Changes**:

1. **Add AbortController with 5-second timeout**: Create an `AbortController`, pass its `signal` to the `externalAPI.geocode()` call (via axios config `{ signal }`), and set a `setTimeout` of 5000ms that calls `controller.abort()`.
2. **Fallback on timeout/abort**: In the `catch` block, detect `AbortError` or timeout, set `loading` to `false`, and leave `result` as `null` so the existing `DESTINATIONS` grid renders as the fallback.
3. **Store destination in global store**: After a successful geocode, call `useDestinationStore.getState().setDestination({ city, country, currency })` to share the selected destination with the navbar.

---

**File**: `frontend/src/store/destinationStore.js` (NEW)

**Specific Changes**:

1. **Create Zustand store**: Export `useDestinationStore` with state `{ city: null, country: null, currency: null }` and actions `setDestination({ city, country, currency })` and `clearDestination()`.
2. **No persistence**: This store is session-only (no `persist` middleware) since destination selection is transient.

---

**File**: `frontend/src/components/layout/Navigation.jsx`

**Specific Changes**:

1. **Remove `CURRENCIES` constant**: Delete the hardcoded 6-currency array and the preset quick-select buttons from the currency dropdown.
2. **Import `useDestinationStore`**: Read `destinationCity`, `destinationCurrency` from the global store.
3. **Auto-set destination currency**: When `destinationCurrency` from the store is set, use it as the `to` parameter for `useCurrency(homeCurrency, destinationCurrency)` instead of the preference store's manual value.
4. **Pass city to `useWeather`**: When `destinationCity` is set, call `useWeather` in city-name mode; otherwise fall back to lat/lng mode.
5. **Keep text input**: Retain the free-text currency input field for manual override.

---

**File**: `frontend/src/hooks/useWeather.js`

**Function**: `useWeather(lat, lng, unit)` → `useWeather({ lat, lng, city, unit })`

**Specific Changes**:

1. **Dual-mode API call**: Accept an options object. If `city` is provided, use `?q=${city}` endpoint. If `lat`/`lng` are provided, use `?lat=${lat}&lon=${lng}` endpoint. City mode takes priority.
2. **localStorage caching**: Before fetching, check `localStorage` for a cached response keyed by the query params. If cache exists and is less than 10 minutes old, return cached data immediately. After a fresh fetch, write the response to `localStorage` with a timestamp.
3. **Stale-while-revalidate**: Show cached data instantly, then refresh in the background and update state if the fresh response differs.

---

**File**: `frontend/src/hooks/useCurrency.js`

**Function**: `useCurrency(from, to)`

**Specific Changes**:

1. **localStorage caching**: Before fetching, check `localStorage` for a cached rate keyed by `${from}-${to}`. If cache exists and is less than 1 hour old, return cached rate immediately. After a fresh fetch, write the response to `localStorage` with a timestamp.
2. **Stale-while-revalidate**: Show cached rate instantly, then refresh in the background.

---

**File**: `frontend/src/hooks/useLocation.js`

**Function**: `useLocation()`

**Specific Changes**:

1. **Module-level promise deduplication**: Declare a module-scoped `let locationPromise = null`. On first call to `fetchFromIP()`, assign the fetch promise to `locationPromise`. On subsequent calls, return the existing promise instead of creating a new fetch.
2. **Cache the resolved data**: Store the resolved IP data in a module-scoped variable so subsequent hook mounts read from memory without any network call.

---

**File**: `frontend/src/store/preferenceStore.js`

**Specific Changes**:

1. **Remove `destinationCurrency` default reliance**: The `destinationCurrency` field remains for manual override, but the navbar will prefer the `destinationStore` currency when available. No structural changes needed to this file beyond ensuring compatibility.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate slow geocode responses, destination selection without global state, weather fetching without city-name support, and multiple component mounts triggering redundant API calls. Run these tests on the UNFIXED code to observe failures.

**Test Cases**:

1. **Geocode Timeout Test**: Mock `externalAPI.geocode` to delay 6 seconds → assert that `loading` becomes `false` within 5.5 seconds and fallback grid renders (will fail on unfixed code — spinner stays indefinitely)
2. **Currency Auto-Detection Test**: Select a destination with known currency (e.g., Tokyo → JPY) → assert navbar currency display shows JPY conversion (will fail on unfixed code — stays on manual USD)
3. **City Weather Test**: Set destination to "Paris" → assert `useWeather` fetches with `?q=Paris` (will fail on unfixed code — only lat/lng mode exists)
4. **IP Fetch Deduplication Test**: Mount two components using `useLocation()` → assert `ip-api.com` is called exactly once (will fail on unfixed code — called once per mount)
5. **Weather Cache Test**: Call `useWeather` twice within 10 minutes with same params → assert second call reads from localStorage (will fail on unfixed code — always fetches fresh)

**Expected Counterexamples**:

- Geocode: `loading` remains `true` after 5 seconds with no abort
- Currency: `destinationCurrency` stays "USD" after selecting Tokyo
- Weather: No `?q=` query parameter in fetch URL when destination city is set
- Caching: Multiple `fetch()` calls to same endpoints within cache TTL

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**

```
FOR ALL input WHERE isBugCondition(input) DO
  IF input.type == "destinationSearch" AND input.geocodeResponseTime > 5000
    result := searchDestination_fixed(input.query)
    ASSERT result.loading == false WITHIN 5500ms
    ASSERT fallbackGridDisplayed()

  IF input.type == "currencyDisplay" AND input.destinationSelected
    result := navbarCurrency_fixed(input.destinationCurrency)
    ASSERT result.displayedCurrency == input.destinationCurrency

  IF input.type == "temperatureDisplay" AND input.destinationCity != null
    result := useWeather_fixed({ city: input.destinationCity })
    ASSERT result.fetchURL CONTAINS "q=" + input.destinationCity

  IF input.type == "componentMount"
    ASSERT ipApiFetchCount == 1
    ASSERT weatherServedFromCache WHEN cacheAge < 600000
    ASSERT currencyServedFromCache WHEN cacheAge < 3600000
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**

```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT searchDestination_original(input) == searchDestination_fixed(input)
  ASSERT useWeather_original(input) == useWeather_fixed(input)
  ASSERT useCurrency_original(input) == useCurrency_fixed(input)
  ASSERT useLocation_original(input) == useLocation_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:

- It generates many test cases automatically across the input domain (various city names, currency pairs, temperature units)
- It catches edge cases that manual unit tests might miss (empty strings, special characters in city names, same-currency pairs)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for normal searches, currency conversions, and weather fetches, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Destination Grid Preservation**: Verify the 12-card DESTINATIONS grid renders identically on initial load with no search active
2. **Successful Search Preservation**: Verify that geocode searches completing under 5 seconds still display weather, restaurants, and attractions
3. **Temperature Toggle Preservation**: Verify °C/°F conversion continues to work correctly for both IP-based and city-based weather
4. **Navbar Styling Preservation**: Verify navbar layout, colors, fonts, and icon rendering remain unchanged
5. **User Dropdown Preservation**: Verify user dropdown, mobile menu, and auth modals function identically
6. **No-Destination Currency Preservation**: Verify that when no destination is selected, navbar shows home currency from IP

### Unit Tests

- Test `searchDestination` with mocked geocode that resolves in < 5s (success path unchanged)
- Test `searchDestination` with mocked geocode that takes > 5s (abort + fallback)
- Test `useWeather` in lat/lng mode returns same data format as before
- Test `useWeather` in city-name mode returns weather for the specified city
- Test `useCurrency` with localStorage cache hit (< 1 hr old) returns cached rate
- Test `useCurrency` with expired cache (> 1 hr old) fetches fresh rate
- Test `useLocation` module-level deduplication — second call returns same promise
- Test `destinationStore` setDestination/clearDestination actions

### Property-Based Tests

- Generate random city names and verify `useWeather` selects the correct endpoint (city mode vs lat/lng mode) based on input parameters
- Generate random currency pairs and verify `useCurrency` caching logic — cached responses served within TTL, fresh fetches after TTL expiry
- Generate random geocode delay times and verify timeout behavior — abort at 5s for slow responses, normal flow for fast responses
- Generate random sequences of destination selections and clearings, verify `destinationStore` state consistency

### Integration Tests

- Test full flow: select destination on destinations page → verify navbar currency and temperature update to reflect the destination
- Test flow: select destination → clear destination (navigate away) → verify navbar reverts to IP-based currency and temperature
- Test flow: slow geocode → timeout → fallback grid displayed → user clicks a card from fallback → successful search
- Test flow: app cold start → verify single `ip-api.com` call → cached weather/currency served on subsequent renders
