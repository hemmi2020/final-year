# Implementation Plan: Navbar Enhancements

## Overview

Enhance the TravelAI Navbar component with VPN-aware IP-based geolocation, interactive flag tooltip, temperature detail popover, real-time currency conversion display, always-on box shadow, and proper loading states. Implementation modifies `useLocation.js`, `useWeather.js`, `useCurrency.js`, `preferenceStore.js`, and `Navigation.jsx`. Property-based tests use `fast-check` to validate 6 correctness properties.

## Tasks

- [x] 1. Set up test infrastructure and install dependencies
  - Install `fast-check`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` as dev dependencies
  - Create `vitest.config.js` at `frontend/` root with jsdom environment and path aliases matching `jsconfig.json`
  - Add `"test": "vitest --run"` script to `frontend/package.json`
  - Verify the test runner works with a trivial test
  - _Requirements: 9.1_

- [x] 2. Refactor useLocation hook to IP-only detection and add currency field
  - [x] 2.1 Rewrite `frontend/src/hooks/useLocation.js` to remove all browser geolocation code
    - Remove `navigator.geolocation` usage entirely
    - Fetch only from `https://ip-api.com/json/?fields=lat,lon,city,country,countryCode,currency`
    - Add `currency` field (e.g., "PKR") to the returned state object
    - Map `lon` from the API response to `lng` in the state
    - Set `loading: true` initially, `loading: false` after fetch completes or fails
    - On fetch failure, set `error` to a descriptive message and all location fields to `null`
    - Export the `countryCodeToFlag` function so it can be tested independently
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1_

  - [ ]\* 2.2 Write property test: IP-API response field extraction preserves all fields
    - **Property 1: IP-API response field extraction preserves all fields**
    - Generate random IP-API response objects with `lat`, `lon`, `city`, `country`, `countryCode`, `currency` fields using `fast-check` arbitraries
    - Pass through the extraction logic and verify each returned field matches the source, with `lon` mapped to `lng`
    - Minimum 100 iterations
    - **Validates: Requirements 2.2, 2.5, 6.1, 6.4**

  - [ ]\* 2.3 Write property test: Country code to flag emoji conversion
    - **Property 2: Country code to flag emoji conversion**
    - Generate random valid 2-letter uppercase strings using `fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), {minLength: 2, maxLength: 2})`
    - Verify the output consists of exactly two regional indicator Unicode code points matching the input letters
    - Verify invalid/missing codes return "🌍"
    - Minimum 100 iterations
    - **Validates: Requirements 3.1**

- [x] 3. Expand useWeather hook to return detailed weather fields
  - [x] 3.1 Update `frontend/src/hooks/useWeather.js` to return additional fields
    - Add `feelsLike` (from `main.feels_like`), `humidity` (from `main.humidity`), `windSpeed` (from `wind.speed`), `condition` (from `weather[0].description`), and `city` (from `name`) to the state
    - Initialize all new fields as `null`
    - Populate them from the OpenWeatherMap response on successful fetch
    - Keep existing error handling for missing API key, non-200 cod, and network failure
    - _Requirements: 4.3, 4.4, 6.2, 8.1, 8.3_

  - [ ]\* 3.2 Write property test: Weather response field extraction preserves all fields
    - **Property 5: Weather response field extraction preserves all fields**
    - Generate random OWM-shaped response objects with `main.temp`, `main.feels_like`, `main.humidity`, `wind.speed`, `weather[0].description`, `name`, and `cod: 200`
    - Pass through extraction logic and verify `temp` is rounded from `main.temp`, and all other fields match their source
    - Minimum 100 iterations
    - **Validates: Requirements 4.4**

- [x] 4. Update preferenceStore and useCurrency calling convention
  - [x] 4.1 Refactor `frontend/src/store/preferenceStore.js`
    - Rename `currency` to `destinationCurrency` and `setCurrency` to `setDestinationCurrency`
    - Remove the `country` field and `setCountry` action
    - Keep `tempUnit` and `setTempUnit` unchanged
    - Default `destinationCurrency` to `"USD"`
    - _Requirements: 5.4_

  - [x] 4.2 Verify `frontend/src/hooks/useCurrency.js` needs no structural changes
    - The hook signature `useCurrency(from, to)` remains the same
    - Only the calling convention in `Navigation.jsx` changes: `useCurrency(homeCurrency, destinationCurrency)` where `homeCurrency` comes from `useLocation().currency`
    - _Requirements: 5.2, 5.3, 6.3_

- [x] 5. Checkpoint — Ensure all hooks and store are updated
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update Navigation.jsx — Box shadow and flag tooltip
  - [x] 6.1 Apply always-on box shadow
    - Remove the scroll-dependent `boxShadow` ternary and `isScrolled` variable (and `useScrollPosition` import if no longer needed)
    - Set `boxShadow: "0 2px 12px rgba(0,0,0,0.08)"` as a constant style on the `<nav>` element
    - Keep sticky positioning, background color, and 64px height unchanged
    - _Requirements: 1.1, 1.2_

  - [x] 6.2 Implement flag hover tooltip
    - Add `flagTooltip` state toggled by `onMouseEnter`/`onMouseLeave` on the flag button
    - Change loading fallback from `"🌍"` to `"🌐"`
    - Render a tooltip div below the flag showing `📍 {city}` and `🌍 {country}` when hovered
    - Remove the inline city text from the flag pill (tooltip replaces it)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1_

  - [ ]\* 6.3 Write property test: Flag tooltip content formatting
    - **Property 3: Flag tooltip content formatting**
    - Generate random non-null city and country name strings using `fc.string({minLength: 1})`
    - Verify the tooltip content contains the city prefixed with "📍" and the country prefixed with "🌍"
    - Minimum 100 iterations
    - **Validates: Requirements 3.4**

- [x] 7. Update Navigation.jsx — Temperature display with detail popover
  - [x] 7.1 Implement temperature display and popover
    - Update the temperature display to show `"{temp}°{unit}"` format (e.g., "28°C") using data from `useWeather`
    - Show `"—"` while `weatherLoading` is true
    - Add `tempPopover` state toggled by `onClick` on the temperature display
    - Render a popover showing: 🌡️ Feels like, 💧 Humidity, 🌬️ Wind speed, ☁️ Condition, 📍 City
    - Close the popover on outside click (extend existing `useEffect` handler)
    - Keep the °C/°F toggle button
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7, 7.2_

  - [ ]\* 7.2 Write property test: Temperature display formatting
    - **Property 4: Temperature display formatting**
    - Generate random numeric temperature values (`fc.integer({min: -60, max: 60})`) and unit strings (`fc.constantFrom("C", "F")`)
    - Verify the display string matches `"{temp}°{unit}"` where `{temp}` is the rounded integer
    - Minimum 100 iterations
    - **Validates: Requirements 4.1**

- [x] 8. Update Navigation.jsx — Currency display with conversion dropdown
  - [x] 8.1 Implement currency display and dropdown
    - Change the currency display format from `1$={rate}` to `{homeCurrency} 1 = {destinationCurrency} {rate}`
    - Wire `useCurrency(homeCurrency, destinationCurrency)` where `homeCurrency` is from `useLocation().currency` and `destinationCurrency` from `preferenceStore`
    - Show `"—"` while `rateLoading` is true
    - Update the currency dropdown to include a text input for changing the destination currency code
    - Show live conversion result in the dropdown
    - Close on outside click (existing behavior)
    - Update all references from `setCurrency` to `setDestinationCurrency` and `currency` to `destinationCurrency` in the component
    - _Requirements: 5.1, 5.2, 5.5, 5.6, 5.7, 5.8, 5.9, 6.3, 7.3_

  - [ ]\* 8.2 Write property test: Currency display formatting
    - **Property 6: Currency display formatting**
    - Generate random 3-letter uppercase currency codes (`fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), {minLength: 3, maxLength: 3})`) and positive rates (`fc.float({min: 0.0001, noNaN: true})`)
    - Verify the display string matches `"{homeCurrency} 1 = {destinationCurrency} {rate}"`
    - Minimum 100 iterations
    - **Validates: Requirements 5.1**

- [x] 9. Ensure .env.local contains the weather API key variable
  - Verify `frontend/.env.local` contains `NEXT_PUBLIC_OPENWEATHER_API_KEY`
  - If not present, add it with a placeholder value and a comment
  - _Requirements: 8.1, 8.2_

- [x] 10. Final checkpoint — Ensure all tests pass and no regressions
  - Ensure all tests pass, ask the user if questions arise.
  - Verify no files outside the allowed scope were modified (Navigation.jsx, useLocation.js, useWeather.js, useCurrency.js, preferenceStore.js, .env.local, and new test files)
  - _Requirements: 9.1, 9.2_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 6 universal correctness properties defined in the design document using `fast-check`
- The `useCurrency` hook itself needs no structural changes — only the calling convention in `Navigation.jsx` changes
