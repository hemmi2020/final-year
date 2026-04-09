# Implementation Plan

- [ ] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - TravelAI Multi-Bug Exploration
  - **CRITICAL**: Write these property-based tests BEFORE implementing any fixes
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate all four bugs exist in the unfixed code
  - **Scoped PBT Approach**: Scope each property to the concrete failing scenarios:
    - **Bug 1 — Geocode Timeout**: Mock `externalAPI.geocode` to delay >5 seconds. Assert that `searchDestination` aborts the call and sets `loading` to `false` within 5.5 seconds, and the fallback `DESTINATIONS` grid renders. On unfixed code this will FAIL because there is no AbortController — the spinner stays indefinitely.
    - **Bug 2 — Manual Currency Selection**: Simulate selecting a destination (e.g., Tokyo/Japan/JPY) and assert the navbar reads the destination currency from a global store and displays the JPY exchange rate automatically. On unfixed code this will FAIL because `CURRENCIES` is hardcoded and no `destinationStore` exists.
    - **Bug 3 — IP-Only Temperature**: Set a destination city (e.g., "Paris") in the global store and assert `useWeather` fetches weather using the `?q=Paris` endpoint. On unfixed code this will FAIL because `useWeather` only accepts `(lat, lng, unit)` and has no city-name mode.
    - **Bug 4 — Redundant Uncached API Calls**: Mount two components that call `useLocation()` and assert `ip-api.com` is fetched exactly once. Also assert that `useWeather` and `useCurrency` serve cached data from localStorage within their TTL windows (10 min / 1 hr). On unfixed code this will FAIL because each hook instance fires its own fetch with no deduplication or caching.
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found (e.g., "`loading` stays `true` after 6s", "no `?q=` param in weather URL", "2 ip-api fetches for 2 mounts")
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - TravelAI Unchanged Behaviors
  - **IMPORTANT**: Follow observation-first methodology — run UNFIXED code, observe outputs, then write tests asserting those outputs
  - **Observe on unfixed code**:
    - Observe: Initial destinations page load renders 12 `DESTINATIONS` cards (3 Featured + 9 All) with correct names, images, tags, and layout
    - Observe: A geocode search completing under 5 seconds returns weather, restaurants, and attractions data and renders the result view
    - Observe: The °C/°F toggle button converts temperature correctly between units
    - Observe: Navbar styling, colors, layout, fonts, and icons render identically
    - Observe: User dropdown, mobile menu, and authentication modals function correctly
    - Observe: When no destination is selected, navbar currency shows the user's home currency from IP detection
  - **Write property-based tests capturing observed behavior**:
    - For all initial page loads with no active search, the 12-card DESTINATIONS grid renders with Featured (3) and All (9) sections
    - For all geocode searches completing within 5 seconds, weather/restaurants/attractions results display correctly
    - For all temperature unit toggles (C↔F), the displayed temperature converts correctly using the formula `F = C * 9/5 + 32`
    - For all states where no destination is selected, navbar currency display shows the IP-detected home currency
    - For all user interactions with dropdown, mobile menu, and auth modals, behavior is identical to current
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 3. Fix 1 — Destinations page 5-second timeout with fallback
  - [x] 3.1 Implement AbortController timeout in `searchDestination`
    - In `frontend/src/app/destinations/page.jsx`, wrap the `externalAPI.geocode(name)` call with an `AbortController`
    - Create `const controller = new AbortController()` and pass `{ signal: controller.signal }` as the axios config
    - Set `const timeout = setTimeout(() => controller.abort(), 5000)` for a 5-second deadline
    - Clear the timeout with `clearTimeout(timeout)` on successful response
    - In the `catch` block, detect abort/timeout errors, set `loading` to `false`, and leave `result` as `null` so the existing `DESTINATIONS` grid renders as fallback
    - Ensure the `finally` or `catch` always calls `clearTimeout(timeout)` to prevent memory leaks
    - _Bug_Condition: isBugCondition(input) where input.type == "destinationSearch" AND input.geocodeResponseTime > 5000ms AND NOT abortControllerExists_
    - _Expected_Behavior: searchDestination aborts after 5s, loading=false, fallback DESTINATIONS grid displayed_
    - _Preservation: Successful searches under 5s continue to work identically; initial page load with 12-card grid unchanged_
    - _Requirements: 1.1, 2.1, 3.1, 3.2_

  - [ ] 3.2 Verify geocode timeout exploration test now passes
    - **Property 1: Expected Behavior** - Geocode Timeout with Fallback
    - **IMPORTANT**: Re-run the SAME geocode timeout test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior: abort after 5s, loading=false, fallback grid displayed
    - **EXPECTED OUTCOME**: Test PASSES (confirms the timeout bug is fixed)
    - _Requirements: 2.1_

  - [ ] 3.3 Verify preservation tests still pass after timeout fix
    - **Property 2: Preservation** - Destinations Page Unchanged Behaviors
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 — do NOT write new tests
    - Confirm initial 12-card grid, successful searches, and all other preserved behaviors still work
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions from timeout fix)

- [ ] 4. Fix 2 — Global destination store + dynamic currency (remove CURRENCIES dropdown)
  - [x] 4.1 Create `destinationStore.js` Zustand store
    - Create new file `frontend/src/store/destinationStore.js`
    - Export `useDestinationStore` with state: `{ city: null, country: null, currency: null }`
    - Add actions: `setDestination({ city, country, currency })` and `clearDestination()` that resets all to `null`
    - No `persist` middleware — this is session-only transient state
    - _Bug_Condition: isBugCondition(input) where input.type == "currencyDisplay" AND input.destinationSelected AND input.currencySource == "hardcodedDropdown"_
    - _Expected_Behavior: Global store shares destination city/country/currency across navbar and destinations page_
    - _Requirements: 2.3_

  - [x] 4.2 Store destination in global store from destinations page
    - In `frontend/src/app/destinations/page.jsx`, import `useDestinationStore`
    - After successful geocode in `searchDestination`, call `useDestinationStore.getState().setDestination({ city: loc.displayName?.split(",")[0], country: loc.country || null, currency: loc.currency || null })`
    - When user clicks "← Back to all destinations", call `useDestinationStore.getState().clearDestination()`
    - _Expected_Behavior: Destination selection propagates to global store for navbar consumption_
    - _Preservation: searchDestination success/failure flow unchanged; DESTINATIONS grid rendering unchanged_
    - _Requirements: 2.3, 3.1, 3.2_

  - [x] 4.3 Update Navigation.jsx to read from destinationStore and remove CURRENCIES
    - In `frontend/src/components/layout/Navigation.jsx`, import `useDestinationStore`
    - Read `{ city: destCity, currency: destCurrency }` from `useDestinationStore()`
    - Delete the `CURRENCIES` constant array (6 hardcoded currencies)
    - Delete the preset quick-select currency buttons from the dropdown (the `CURRENCIES.map(...)` block)
    - Keep the free-text currency input field for manual override
    - Use `destCurrency || destinationCurrency` (from preferenceStore) as the `to` parameter for `useCurrency(homeCurrency, effectiveCurrency)`
    - When `destCurrency` changes, auto-update the displayed exchange rate
    - _Bug_Condition: isBugCondition(input) where input.currencySource == "hardcodedDropdown"_
    - _Expected_Behavior: Navbar auto-detects destination currency from global store; CURRENCIES dropdown removed_
    - _Preservation: Navbar styling, layout, user dropdown, mobile menu, auth modals unchanged; home currency display when no destination selected unchanged_
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 3.5, 3.6, 3.7_

  - [ ] 4.4 Verify currency auto-detection exploration test now passes
    - **Property 1: Expected Behavior** - Dynamic Destination Currency
    - **IMPORTANT**: Re-run the SAME currency auto-detection test from task 1 — do NOT write a new test
    - **EXPECTED OUTCOME**: Test PASSES (confirms destination currency auto-detection works)
    - _Requirements: 2.2, 2.3_

  - [ ] 4.5 Verify preservation tests still pass after store + currency fix
    - **Property 2: Preservation** - Navbar and Currency Unchanged Behaviors
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 — do NOT write new tests
    - Confirm navbar styling, home currency display, user dropdown, mobile menu, auth modals all unchanged
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions from store + currency fix)

- [ ] 5. Fix 3 — City-level temperature (dual-mode useWeather)
  - [x] 5.1 Implement dual-mode `useWeather` hook with localStorage caching
    - In `frontend/src/hooks/useWeather.js`, change the signature from `useWeather(lat, lng, unit)` to `useWeather({ lat, lng, city, unit })` accepting an options object
    - If `city` is provided, build URL with `?q=${city}` endpoint; otherwise use `?lat=${lat}&lon=${lng}` (city mode takes priority)
    - Add localStorage caching with 10-minute TTL:
      - Cache key: `weather_${city || `${lat},${lng}`}_${unit}`
      - Before fetching, check localStorage for cached data with valid timestamp (< 600000ms old)
      - If cache hit, set state from cache immediately, then fetch in background (stale-while-revalidate)
      - After fresh fetch, write response + timestamp to localStorage
    - Keep the same return shape: `{ temp, feelsLike, humidity, windSpeed, condition, city, description, icon, loading, error }`
    - _Bug_Condition: isBugCondition(input) where input.type == "temperatureDisplay" AND input.destinationCity != null AND input.weatherQueryMode == "latLngOnly"_
    - _Expected_Behavior: useWeather supports city-name mode via ?q= endpoint; cached responses served within 10-min TTL_
    - _Preservation: lat/lng mode continues to work identically for IP-based weather; return shape unchanged_
    - _Requirements: 1.4, 1.5, 1.7, 2.4, 2.5, 2.7_

  - [x] 5.2 Update Navigation.jsx to pass destination city to useWeather
    - In `frontend/src/components/layout/Navigation.jsx`, update the `useWeather` call:
      - When `destCity` (from destinationStore) is set, call `useWeather({ city: destCity, unit: tempUnit })`
      - When no destination is set, call `useWeather({ lat, lng, unit: tempUnit })` (current IP-based behavior)
    - _Expected_Behavior: Navbar temperature reflects selected destination city; falls back to IP-based weather when no destination_
    - _Preservation: °C/°F toggle continues to work; weather popover details unchanged_
    - _Requirements: 2.4, 2.5, 3.3_

  - [ ] 5.3 Verify city-level temperature exploration test now passes
    - **Property 1: Expected Behavior** - City-Level Temperature Display
    - **IMPORTANT**: Re-run the SAME city weather test from task 1 — do NOT write a new test
    - **EXPECTED OUTCOME**: Test PASSES (confirms city-name weather fetching works)
    - _Requirements: 2.4, 2.5_

  - [ ] 5.4 Verify preservation tests still pass after dual-mode weather fix
    - **Property 2: Preservation** - Weather and Temperature Unchanged Behaviors
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 — do NOT write new tests
    - Confirm °C/°F toggle, IP-based weather fallback, and weather popover details all unchanged
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions from weather fix)

- [ ] 6. Fix 4 — API caching (single ip-api fetch, localStorage caching)
  - [x] 6.1 Implement module-level promise deduplication in `useLocation`
    - In `frontend/src/hooks/useLocation.js`, add module-scoped variables:
      - `let locationPromise = null` — holds the in-flight or resolved fetch promise
      - `let cachedData = null` — holds the resolved IP data for instant access
    - On first call to `fetchFromIP()`, assign the fetch promise to `locationPromise`
    - On subsequent calls, if `cachedData` exists, return it immediately; if `locationPromise` exists, await the existing promise instead of creating a new fetch
    - This ensures all components calling `useLocation()` share a single `ip-api.com` request
    - _Bug_Condition: isBugCondition(input) where input.type == "componentMount" AND input.ipApiFetchCount > 1_
    - _Expected_Behavior: ip-api.com fetched exactly once; all useLocation() consumers share the same data_
    - _Preservation: Return shape unchanged; location data values unchanged_
    - _Requirements: 1.6, 2.6_

  - [x] 6.2 Implement localStorage caching in `useCurrency`
    - In `frontend/src/hooks/useCurrency.js`, add localStorage caching with 1-hour TTL:
      - Cache key: `currency_${from}_${to}`
      - Before fetching, check localStorage for cached rate with valid timestamp (< 3600000ms old)
      - If cache hit, set state from cache immediately, then fetch in background (stale-while-revalidate)
      - After fresh fetch, write rate + timestamp to localStorage
    - Keep the same return shape: `{ rate, loading, error }`
    - _Bug_Condition: isBugCondition(input) where input.currencyCacheAge < 3600000 AND input.currencyFetchTriggered_
    - _Expected_Behavior: Cached exchange rates served within 1-hour TTL; fresh fetch after expiry_
    - _Preservation: Rate calculation unchanged; error handling unchanged; same-currency shortcut (rate=1) unchanged_
    - _Requirements: 1.8, 2.8_

  - [ ] 6.3 Verify API caching exploration test now passes
    - **Property 1: Expected Behavior** - Single IP Fetch and API Caching
    - **IMPORTANT**: Re-run the SAME caching tests from task 1 — do NOT write new tests
    - **EXPECTED OUTCOME**: Test PASSES (confirms single IP fetch and localStorage caching work)
    - _Requirements: 2.6, 2.7, 2.8_

  - [ ] 6.4 Verify preservation tests still pass after caching fix
    - **Property 2: Preservation** - API Data and Hook Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 — do NOT write new tests
    - Confirm location data, weather data, and currency data values are unchanged; only fetch frequency changes
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions from caching fix)

- [x] 7. Checkpoint — Ensure all tests pass
  - Run the full test suite to confirm all exploration tests (Property 1) now PASS
  - Run the full preservation tests (Property 2) to confirm no regressions
  - Verify end-to-end: select destination → navbar currency + temperature update → clear destination → navbar reverts to IP-based data
  - Verify edge cases: slow geocode → timeout → fallback grid → click card → successful search
  - Ask the user if questions arise
