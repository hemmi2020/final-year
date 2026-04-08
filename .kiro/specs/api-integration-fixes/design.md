# API Integration Fixes — Bugfix Design

## Overview

The TravelAI frontend has four non-functional external API integrations: geolocation/reverse-geocode, weather, currency exchange rates, and restaurant/places search in AI chat. The backend services and API endpoints are fully implemented and working. The frontend has an `externalAPI` client with all necessary methods but none are ever called. The fix involves creating three new React hooks (`useLocation`, `useWeather`, `useCurrency`), wiring them into the Navigation component, expanding the preference store, and enabling the AI chat agent to invoke the restaurant search tool.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — the frontend never calls any external API endpoints despite having a fully functional backend and a pre-built API client (`externalAPI`)
- **Property (P)**: The desired behavior — frontend hooks fetch live data (location, weather, currency) and display it in the navbar; AI chat can invoke restaurant search
- **Preservation**: Existing preference store persistence, currency dropdown UI, temp toggle UI, chat message flow, trip planner redirect, backend error handling, and navbar layout must remain unchanged
- **`externalAPI`**: The API client object in `frontend/src/lib/api.js` with methods `weather()`, `forecast()`, `places()`, `currency()`, `geocode()`, `attractions()` — all pre-built but never called
- **`usePreferenceStore`**: Zustand store in `frontend/src/store/preferenceStore.js` managing `currency`, `tempUnit`, `country` — currently has no location/weather/rate state
- **`Navigation`**: The navbar component in `frontend/src/components/layout/Navigation.jsx` — has currency dropdown and temp toggle UI but no data fetching
- **`agent.chat()`**: The AI chat function in `backend/services/ai/agent.js` — simple prompt-response with no function calling or tool invocation

## Bug Details

### Bug Condition

The bug manifests when the frontend app loads and renders the Navigation bar, or when the AI chat processes messages. The frontend API client methods exist but are never invoked by any hook or component. No `useLocation`, `useWeather`, or `useCurrency` hooks exist. The AI chat function uses a simple prompt-response pattern without function calling, so the `searchNearbyPlaces` tool is never invoked.

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type { context: "navbar-load" | "chat-message" | "currency-change" | "temp-toggle" | "location-change" }
  OUTPUT: boolean

  IF input.context == "navbar-load"
    RETURN NOT hookExists("useLocation")
           OR NOT hookExists("useWeather")
           OR NOT hookExists("useCurrency")

  IF input.context == "chat-message"
    RETURN NOT agentHasFunctionCalling("chat")
           AND NOT agentInvokesTool("searchNearbyPlaces")

  IF input.context == "currency-change"
    RETURN NOT fetchesCurrencyRate(input.selectedCurrency)

  IF input.context == "temp-toggle"
    RETURN NOT refetchesWeather(input.newUnit)

  IF input.context == "location-change"
    RETURN NOT refetchesWeather(input.newCoordinates)

  RETURN false
END FUNCTION
```

### Examples

- **Location**: App loads → no geolocation permission requested → no city name in navbar → user sees static "🇺🇸" flag with no location context
- **Weather**: Navbar renders temp toggle (°C/°F) → no `GET /api/external/weather` call → toggle changes state but displays no temperature or weather icon
- **Currency**: User selects EUR in dropdown → preference store updates to EUR → no `GET /api/external/currency?from=USD&to=EUR` call → no exchange rate displayed
- **Restaurant**: User asks AI chat "find restaurants in Paris" → `POST /api/chat` sends message → `agent.chat()` generates text response with no actual restaurant data from Overpass API
- **Edge case**: User denies geolocation → should show fallback gracefully → currently no code handles this because geolocation is never requested

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- Currency dropdown must continue to update `usePreferenceStore.currency` and visually highlight the selected currency
- Temperature toggle must continue to update `usePreferenceStore.tempUnit` and toggle button styling
- Currency and temperature preferences must continue to persist across page navigations via Zustand persist middleware
- AI chat must continue to send messages to `POST /api/chat` and render responses with the existing `MessageRenderer` / generative UI
- Trip planner must continue to redirect to `/chat?q=` for processing
- Backend services must continue to return null/empty gracefully on API errors
- Navigation bar layout, styling, and all existing UI elements must remain identical on desktop and mobile
- `externalAPI` methods must continue to attach JWT tokens via the existing axios interceptor

**Scope:**
All inputs that do NOT involve the four missing integrations (location detection, weather fetching, currency rate fetching, restaurant tool invocation) should be completely unaffected by this fix. This includes:

- All existing page navigation and routing
- User authentication flow (login, register, logout)
- Trip CRUD operations
- Community features
- Profile and settings pages
- All existing backend endpoint behavior

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

1. **Missing Hooks**: No `useLocation`, `useWeather`, or `useCurrency` hooks exist in `frontend/src/hooks/`. The `externalAPI` client methods are defined but no component or hook ever calls them. The hooks directory only contains `useScrollPosition`, `useAuthGuard`, and `useMediaQuery`.

2. **Navigation Component Not Wired**: `Navigation.jsx` imports `usePreferenceStore` for currency/tempUnit state but has no data-fetching logic. The country flag button is hardcoded to "🇺🇸". No weather data is displayed. No exchange rate is displayed. The component only manages UI state (dropdowns, toggles) without any API calls.

3. **Preference Store Incomplete**: `usePreferenceStore` has `currency`, `tempUnit`, `country` but lacks `location` (lat/lng/city), `weather` (temp/icon/description), and `exchangeRate` fields. There's no place to store fetched data.

4. **AI Chat Has No Function Calling**: `agent.chat()` in `backend/services/ai/agent.js` uses a simple `openai.chat.completions.create()` call with no `tools` parameter. The `searchNearbyPlaces` tool exists in `backend/services/ai/tools.js` but is only used by `generateItinerary()` pipeline indirectly through graph search — it's never passed to the chat LLM as a callable function. The chat prompt mentions generative UI components but has no mechanism to inject real restaurant data.

## Correctness Properties

Property 1: Bug Condition — Frontend Hooks Fetch Live External Data

_For any_ app load or user interaction where the bug condition holds (missing hooks, missing API calls), the fixed frontend SHALL create and invoke `useLocation`, `useWeather`, and `useCurrency` hooks that call the corresponding `externalAPI` methods, store the results in component/store state, and display live location name, weather data, and exchange rates in the Navigation bar.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.9, 2.10**

Property 2: Bug Condition — AI Chat Restaurant Tool Invocation

_For any_ chat message where the user asks about a destination, the fixed AI chat agent SHALL have the `searchNearbyPlaces` tool available via function calling so that restaurant/places data from the Overpass API can be included in AI responses when relevant.

**Validates: Requirements 2.7, 2.8**

Property 3: Preservation — Existing UI and State Behavior

_For any_ input where the bug condition does NOT hold (existing preference store updates, existing chat flow, existing navbar layout, existing backend error handling), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality for preference persistence, chat messaging, trip planning, and visual layout.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `frontend/src/hooks/useLocation.js` (NEW)

**Purpose**: Create a hook that requests browser geolocation, then calls `externalAPI.geocode()` (reverse geocode) to get the city name.

**Specific Changes**:

1. Use `navigator.geolocation.getCurrentPosition()` to get lat/lng
2. Call backend reverse geocode via a new `externalAPI.reverseGeocode(lat, lng)` method (or use the existing geocode endpoint)
3. Return `{ lat, lng, city, loading, error }` state
4. Handle permission denial gracefully with a fallback state
5. Note: The backend has a `reverseGeocode` function in `mapsService.js` but no route exposes it. We need to either add a route or use the Nominatim API directly from the existing geocode endpoint. Since the backend `externalController` doesn't have a reverse geocode endpoint, we'll add one.

**File**: `backend/controllers/externalController.js` (MODIFY)

**Function**: Add `reverseGeocode` endpoint

**Specific Changes**:

1. Add a `reverseGeocode` controller that accepts `lat` and `lng` query params
2. Calls `mapsService.reverseGeocode(lat, lng)` which already exists
3. Returns the location name/address

**File**: `backend/routes/external.js` (MODIFY)

**Specific Changes**:

1. Add `router.get('/reverse-geocode', reverseGeocode)` route

**File**: `frontend/src/lib/api.js` (MODIFY)

**Specific Changes**:

1. Add `reverseGeocode: (lat, lng) => api.get('/api/external/reverse-geocode', { params: { lat, lng } })` to `externalAPI`

**File**: `frontend/src/hooks/useWeather.js` (NEW)

**Purpose**: Create a hook that fetches weather data when location coordinates and temp unit are available.

**Specific Changes**:

1. Accept `lat`, `lng`, `unit` parameters
2. Call `externalAPI.weather(lat, lng)` with unit mapping (C→metric, F→imperial)
3. Return `{ temp, description, icon, loading, error }` state
4. Re-fetch when lat/lng or unit changes via `useEffect` dependency array

**File**: `frontend/src/hooks/useCurrency.js` (NEW)

**Purpose**: Create a hook that fetches exchange rates when the selected currency changes.

**Specific Changes**:

1. Accept `from` (default "USD") and `to` (selected currency) parameters
2. Call `externalAPI.currency(from, to)` to get the exchange rate
3. Return `{ rate, loading, error }` state
4. Re-fetch when `to` currency changes
5. Skip fetch when `from === to`

**File**: `frontend/src/components/layout/Navigation.jsx` (MODIFY)

**Purpose**: Wire the three new hooks into the navbar to display live data.

**Specific Changes**:

1. Import and call `useLocation()` to get user coordinates and city name
2. Import and call `useWeather(lat, lng, tempUnit)` to get weather data
3. Import and call `useCurrency('USD', currency)` to get exchange rate
4. Display city name near the country flag button (replace hardcoded "🇺🇸" with dynamic flag or city)
5. Display temperature value next to the °C/°F toggle
6. Display exchange rate near the currency pill
7. Add loading/error states for each data source
8. Do NOT change any existing styling, layout structure, or UI element positioning

**File**: `backend/services/ai/agent.js` (MODIFY)

**Function**: `chat()`

**Specific Changes**:

1. Add function calling tools to the `openai.chat.completions.create()` call
2. Define a `searchNearbyPlaces` function tool schema with parameters: `destination`, `type`, `dietary`
3. Handle tool call responses by invoking `tools.searchNearbyPlaces()` and feeding results back to the LLM
4. Implement a tool-call loop: if the LLM returns a tool call, execute it, append the result, and call the LLM again for the final response

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that verify the absence of hooks, the absence of API calls from the Navigation component, and the absence of function calling in the chat agent. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:

1. **Missing useLocation Hook Test**: Assert that `frontend/src/hooks/useLocation.js` does not exist (will confirm on unfixed code)
2. **Missing useWeather Hook Test**: Assert that `frontend/src/hooks/useWeather.js` does not exist (will confirm on unfixed code)
3. **Missing useCurrency Hook Test**: Assert that `frontend/src/hooks/useCurrency.js` does not exist (will confirm on unfixed code)
4. **Navigation No API Calls Test**: Render Navigation component and assert no `externalAPI` methods are called (will confirm on unfixed code)
5. **Chat No Function Calling Test**: Send a restaurant query to `agent.chat()` and assert the response contains no real Overpass API data (will confirm on unfixed code)

**Expected Counterexamples**:

- Hook files do not exist in the hooks directory
- Navigation component renders without any API calls to weather/currency/geocode
- Chat agent returns generic text about restaurants without actual place data
- Possible causes: hooks never created, Navigation never wired, chat agent lacks tool definitions

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**

```
FOR ALL input WHERE isBugCondition(input) DO
  IF input.context == "navbar-load"
    result := renderNavigation()
    ASSERT useLocation() returns { lat, lng, city } OR { error }
    ASSERT useWeather(lat, lng, unit) returns { temp, icon } OR { error }
    ASSERT useCurrency("USD", selectedCurrency) returns { rate } OR { error }
    ASSERT navbar displays city name, temperature, exchange rate

  IF input.context == "chat-message"
    result := agent.chat(user, "find restaurants in Paris")
    ASSERT result includes tool_calls OR result.message contains real place data

  IF input.context == "currency-change"
    ASSERT useCurrency re-fetches with new currency code
    ASSERT navbar updates displayed rate

  IF input.context == "temp-toggle"
    ASSERT useWeather re-fetches with new unit
    ASSERT navbar updates displayed temperature
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**

```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT preferenceStore.setCurrency(code) updates store identically
  ASSERT preferenceStore.setTempUnit(unit) updates store identically
  ASSERT chatAPI.send(message) sends to POST /api/chat identically
  ASSERT Navigation renders all existing UI elements identically
  ASSERT externalAPI methods attach JWT token identically
  ASSERT backend error handling returns null/empty identically
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:

- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for preference store updates, chat messaging, and navbar rendering, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Preference Store Preservation**: Verify that `setCurrency()` and `setTempUnit()` continue to update store state and persist via Zustand middleware after the fix
2. **Chat Flow Preservation**: Verify that sending a message to `POST /api/chat` continues to return an AI response and render it with `MessageRenderer` after the fix
3. **Navbar Layout Preservation**: Verify that all existing navbar elements (nav links, user dropdown, currency pill, temp toggle, mobile menu) render identically after the fix
4. **Backend Error Handling Preservation**: Verify that backend services continue to return null/empty on API errors without crashing

### Unit Tests

- Test `useLocation` hook: geolocation granted → returns lat/lng/city; geolocation denied → returns error state; geolocation unsupported → returns fallback
- Test `useWeather` hook: valid coords → returns weather data; API error → returns error state; unit change → re-fetches
- Test `useCurrency` hook: different currency → returns rate; same currency → skips fetch; API error → returns error state
- Test `reverseGeocode` controller: valid lat/lng → returns location name; missing params → returns 400
- Test `agent.chat()` with function calling: restaurant query → invokes searchNearbyPlaces tool; non-restaurant query → no tool call

### Property-Based Tests

- Generate random lat/lng pairs and verify `useLocation` + `useWeather` hooks handle all coordinate ranges without crashing
- Generate random currency code pairs and verify `useCurrency` hook handles all combinations (including same-currency, invalid codes)
- Generate random chat messages and verify `agent.chat()` returns valid responses whether or not tool calls are triggered
- Generate random preference store states and verify persistence behavior is unchanged

### Integration Tests

- Test full flow: app loads → geolocation granted → reverse geocode → weather fetch → currency fetch → navbar displays all live data
- Test currency change flow: user selects new currency → rate fetches → navbar updates
- Test temp toggle flow: user toggles unit → weather re-fetches → navbar updates temperature
- Test chat restaurant flow: user asks about restaurants → agent invokes tool → response includes place data
- Test geolocation denial flow: user denies permission → navbar shows fallback → no errors in console
