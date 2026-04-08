# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** — Missing Frontend Hooks and AI Function Calling
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing cases:
    - Assert `frontend/src/hooks/useLocation.js` exports a hook that calls `navigator.geolocation` and `externalAPI.reverseGeocode`
    - Assert `frontend/src/hooks/useWeather.js` exports a hook that calls `externalAPI.weather(lat, lng)` and returns `{ temp, description, icon, loading, error }`
    - Assert `frontend/src/hooks/useCurrency.js` exports a hook that calls `externalAPI.currency(from, to)` and returns `{ rate, loading, error }`, skipping fetch when `from === to`
    - Assert `backend/controllers/externalController.js` exports a `reverseGeocode` handler that calls `mapsService.reverseGeocode(lat, lng)`
    - Assert `backend/routes/external.js` registers `GET /reverse-geocode` route
    - Assert `frontend/src/lib/api.js` `externalAPI` object contains a `reverseGeocode` method
    - Assert `backend/services/ai/agent.js` `chat()` function includes `tools` parameter in the OpenAI call with `searchNearbyPlaces` defined
  - Run test on UNFIXED code — expect FAILURE (this confirms the bug exists)
  - Document counterexamples found (e.g., "useLocation.js does not exist", "agent.chat() has no tools parameter", "externalAPI has no reverseGeocode method")
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** — Existing Preference Store, Chat Flow, and Navbar Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code:
    - `usePreferenceStore.setCurrency("EUR")` updates store `currency` to `"EUR"` and persists via Zustand middleware
    - `usePreferenceStore.setTempUnit("F")` updates store `tempUnit` to `"F"` and persists via Zustand middleware
    - `chatAPI.send("hello")` sends POST to `/api/chat` with `{ message: "hello" }` and returns `{ success, data: { message } }`
    - Navigation component renders all existing elements: nav links (Home, Trip Planner, AI Chat, Community, Destinations, About), currency pill, temp toggle, user dropdown, mobile hamburger
    - `externalAPI.weather(lat, lng)` attaches JWT token via axios interceptor
    - Backend weather/currency/places services return `null` or `[]` gracefully on API errors without throwing
  - Write property-based tests:
    - For all valid currency codes in `["USD","EUR","GBP","PKR","AED","INR"]`, `setCurrency(code)` sets `usePreferenceStore.getState().currency` to that code
    - For all temp units in `["C","F"]`, `setTempUnit(unit)` sets `usePreferenceStore.getState().tempUnit` to that unit
    - Navigation renders exactly 6 nav links with correct labels and hrefs
    - Navigation renders currency pill, temp toggle button, and user avatar button
    - Backend `getCurrentWeather` returns `null` when `OPENWEATHER_API_KEY` is unset
    - Backend `getExchangeRate` returns `null` when `EXCHANGE_RATE_API_KEY` is unset
  - Verify tests PASS on UNFIXED code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 3. Backend: Add reverse-geocode endpoint
  - [x] 3.1 Add `reverseGeocode` controller function in `backend/controllers/externalController.js`
    - Accept `lat` and `lng` query params, return 400 if missing
    - Call `mapsService.reverseGeocode(parseFloat(lat), parseFloat(lng))`
    - Return `{ success: true, data }` with location name/address
    - _Bug_Condition: isBugCondition({ context: "navbar-load" }) — no reverse geocode endpoint exists_
    - _Expected_Behavior: GET /api/external/reverse-geocode?lat=&lng= returns location name from Nominatim_
    - _Preservation: Existing geocode, weather, places, currency, attractions endpoints unchanged_
    - _Requirements: 2.2_
  - [x] 3.2 Register route in `backend/routes/external.js`
    - Import `reverseGeocode` from externalController
    - Add `router.get('/reverse-geocode', reverseGeocode)` alongside existing routes
    - _Requirements: 2.2_

- [x] 4. Frontend: Add `reverseGeocode` to externalAPI
  - [x] 4.1 Add `reverseGeocode` method to `externalAPI` in `frontend/src/lib/api.js`
    - Add `reverseGeocode: (lat, lng) => api.get('/api/external/reverse-geocode', { params: { lat, lng } })`
    - Do NOT modify any other methods in the file
    - _Bug_Condition: externalAPI has no reverseGeocode method_
    - _Expected_Behavior: externalAPI.reverseGeocode(lat, lng) calls backend reverse-geocode endpoint_
    - _Preservation: All existing externalAPI methods unchanged_
    - _Requirements: 2.2_

- [x] 5. Frontend: Create `useLocation` hook
  - [x] 5.1 Create `frontend/src/hooks/useLocation.js`
    - Use `navigator.geolocation.getCurrentPosition()` to get lat/lng on mount
    - On success: call `externalAPI.reverseGeocode(lat, lng)` to get city name from `data.address.city || data.address.town || data.name`
    - Return `{ lat, lng, city, loading, error }` state
    - Handle permission denial: set `error` state, no crash, `loading: false`
    - Handle unsupported browser: set `error` state gracefully
    - Use `'use client'` directive
    - _Bug_Condition: No useLocation hook exists — geolocation never requested_
    - _Expected_Behavior: Hook requests geolocation, reverse geocodes, returns city/coords_
    - _Preservation: No changes to existing hooks or components_
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 6. Frontend: Create `useWeather` hook
  - [x] 6.1 Create `frontend/src/hooks/useWeather.js`
    - Accept `lat`, `lng`, `unit` parameters (`unit` is "C" or "F")
    - Map unit: "C" → pass as-is, "F" → pass as-is (backend handles unit via user prefs, but pass `units` query param if needed)
    - Call `externalAPI.weather(lat, lng)` when lat/lng are truthy
    - Return `{ temp, description, icon, loading, error }` state
    - Re-fetch when `lat`, `lng`, or `unit` changes (useEffect dependency array)
    - Skip fetch if `lat` or `lng` is null/undefined
    - Use `'use client'` directive
    - _Bug_Condition: No useWeather hook exists — weather never fetched_
    - _Expected_Behavior: Hook fetches weather data and re-fetches on coordinate/unit change_
    - _Preservation: No changes to existing hooks or backend weather service_
    - _Requirements: 2.4, 2.5, 2.6_

- [x] 7. Frontend: Create `useCurrency` hook
  - [x] 7.1 Create `frontend/src/hooks/useCurrency.js`
    - Accept `from` (default "USD") and `to` (selected currency code) parameters
    - Call `externalAPI.currency(from, to)` to get exchange rate
    - Return `{ rate, loading, error }` state
    - Skip fetch when `from === to` (rate is 1.0)
    - Re-fetch when `from` or `to` changes (useEffect dependency array)
    - Use `'use client'` directive
    - _Bug_Condition: No useCurrency hook exists — exchange rates never fetched_
    - _Expected_Behavior: Hook fetches exchange rate, skips when same currency_
    - _Preservation: No changes to existing preference store or currency dropdown behavior_
    - _Requirements: 2.9, 2.10_

- [x] 8. Frontend: Wire hooks into Navigation.jsx
  - [x] 8.1 Import and integrate hooks in `frontend/src/components/layout/Navigation.jsx`
    - Import `useLocation` from `@/hooks/useLocation`
    - Import `useWeather` from `@/hooks/useWeather`
    - Import `useCurrency` from `@/hooks/useCurrency`
    - Call `useLocation()` to get `{ lat, lng, city, loading: locLoading, error: locError }`
    - Call `useWeather(lat, lng, tempUnit)` to get `{ temp, description, icon, loading: weatherLoading }`
    - Call `useCurrency('USD', currency)` to get `{ rate, loading: rateLoading }`
    - Display city name near the country flag button (show city text or fallback to "🇺🇸" if no city)
    - Display temperature and weather icon next to the °C/°F toggle (e.g., "22° ☀️")
    - Display exchange rate near the currency pill (e.g., "1 USD = 0.92 EUR")
    - Add subtle loading states (e.g., "..." while fetching)
    - Do NOT change any existing styling, layout structure, class names, or UI element positioning
    - _Bug_Condition: Navigation never calls any external API — no live data displayed_
    - _Expected_Behavior: Navigation displays live city, weather, and exchange rate data_
    - _Preservation: All existing nav links, dropdowns, toggles, mobile menu, and styling unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.9, 2.10_

- [x] 9. Backend: Add function calling to agent.chat()
  - [x] 9.1 Add `searchNearbyPlaces` as a function tool in `backend/services/ai/agent.js` `chat()` function
    - Import `searchNearbyPlaces` from `../ai/tools`
    - Define tool schema for OpenAI function calling:
      ```
      tools: [{
        type: "function",
        function: {
          name: "searchNearbyPlaces",
          description: "Search for restaurants, cafes, and other places near a destination",
          parameters: {
            type: "object",
            properties: {
              destination: { type: "string", description: "Place name to search near" },
              type: { type: "string", enum: ["restaurant","cafe","hotel","museum","attraction","park"], description: "Type of place" },
              dietary: { type: "array", items: { type: "string" }, description: "Dietary preferences like halal, vegan, vegetarian" }
            },
            required: ["destination"]
          }
        }
      }]
      ```
    - Implement tool-call loop: if `response.choices[0].message.tool_calls` exists, execute each tool call by invoking `tools.searchNearbyPlaces(destination, type, dietary)`, append tool results as `{ role: "tool", tool_call_id, content }` messages, then call `openai.chat.completions.create()` again for the final response
    - Save final response to memory (existing behavior preserved)
    - _Bug_Condition: agent.chat() has no tools parameter — restaurant search never invoked_
    - _Expected_Behavior: agent.chat() can invoke searchNearbyPlaces and include real place data in responses_
    - _Preservation: Non-restaurant queries continue to work identically; memory saving unchanged_
    - _Requirements: 2.7, 2.8_

- [x] 10. Verify bug condition exploration test now passes
  - [x] 10.1 Re-run bug condition exploration test from task 1
    - **Property 1: Expected Behavior** — Frontend Hooks Fetch Live External Data
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied:
      - `useLocation.js` exists and exports a hook
      - `useWeather.js` exists and exports a hook
      - `useCurrency.js` exists and exports a hook
      - `externalAPI.reverseGeocode` method exists
      - `reverseGeocode` controller and route exist
      - `agent.chat()` includes `tools` parameter with `searchNearbyPlaces`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 10.2 Verify preservation tests still pass
    - **Property 2: Preservation** — Existing Preference Store, Chat Flow, and Navbar Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
