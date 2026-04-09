# Requirements Document

## Introduction

This specification covers enhancements to the existing TravelAI Navbar component (`Navigation.jsx`). The changes add VPN-aware IP-based geolocation, a flag hover tooltip, a temperature detail popover, a real-time currency from/to conversion display, an always-on box shadow, and proper loading states. No changes are made to the logo, nav links, user icon, or overall navbar layout.

## Glossary

- **Navbar**: The sticky top navigation bar rendered by `frontend/src/components/layout/Navigation.jsx`.
- **IP_Location_Service**: The external API at `https://ip-api.com/json` that returns geolocation data (country, city, currency, lat/lng) based on the caller's IP address.
- **Weather_Service**: The OpenWeatherMap API at `https://api.openweathermap.org/data/2.5/weather` that returns weather data for given coordinates.
- **Exchange_Rate_Service**: The ExchangeRate API at `https://api.exchangerate-api.com/v4/latest/{FROM_CURRENCY}` that returns live currency exchange rates.
- **useLocation_Hook**: The custom React hook at `frontend/src/hooks/useLocation.js` responsible for detecting the user's location.
- **useWeather_Hook**: The custom React hook at `frontend/src/hooks/useWeather.js` responsible for fetching weather data.
- **useCurrency_Hook**: The custom React hook at `frontend/src/hooks/useCurrency.js` responsible for fetching exchange rate data.
- **Home_Currency**: The currency code returned by the IP_Location_Service for the user's detected country (e.g., "PKR" for Pakistan).
- **Destination_Currency**: The target currency for conversion, configurable by the user, defaulting to "USD".
- **Flag_Tooltip**: A styled popover element that appears below the country flag on hover, displaying city and country name.
- **Temperature_Popover**: A styled dropdown element that appears on click of the temperature display, showing detailed weather information.
- **Currency_Dropdown**: A styled dropdown element that appears on click of the currency display, allowing the user to change the Destination_Currency and view live conversion.
- **Preference_Store**: The Zustand store at `frontend/src/store/preferenceStore.js` managing persisted user preferences for currency and temperature unit.

## Requirements

### Requirement 1: Always-On Navbar Box Shadow

**User Story:** As a user, I want the navbar to have a subtle visual separation from page content, so that the navigation area is clearly distinguished at all times.

#### Acceptance Criteria

1. THE Navbar SHALL render with a box shadow of `0 2px 12px rgba(0,0,0,0.08)` at all times, regardless of scroll position.
2. THE Navbar SHALL retain the existing sticky positioning, background color, and 64px height without modification.

### Requirement 2: IP-First VPN-Aware Location Detection

**User Story:** As a user, I want my location to be detected from my IP address automatically, so that the navbar reflects my current network location including when I use a VPN.

#### Acceptance Criteria

1. WHEN the Navbar mounts, THE useLocation_Hook SHALL fetch location data from the IP_Location_Service as the primary detection method, without requesting browser geolocation permission.
2. WHEN the IP_Location_Service responds successfully, THE useLocation_Hook SHALL extract and return the country code, country name, city, currency code, latitude, and longitude from the response.
3. IF the IP_Location_Service request fails, THEN THE useLocation_Hook SHALL set the error state to a descriptive message and set loading to false.
4. THE useLocation_Hook SHALL perform location detection once on component mount and SHALL NOT poll the IP_Location_Service at any interval.
5. THE useLocation_Hook SHALL NOT use any hardcoded country, city, or currency values.

### Requirement 3: Country Flag with Hover Tooltip

**User Story:** As a user, I want to see my country's flag in the navbar and view my city and country on hover, so that I can confirm my detected location at a glance.

#### Acceptance Criteria

1. THE Navbar SHALL display the country flag emoji derived from the country code returned by the useLocation_Hook.
2. WHILE the useLocation_Hook is in a loading state, THE Navbar SHALL display the 🌐 globe emoji as a fallback in place of the country flag.
3. WHEN the user hovers over the flag element, THE Navbar SHALL display the Flag_Tooltip below the flag element.
4. THE Flag_Tooltip SHALL display the city name prefixed with "📍" and the country name prefixed with "🌍" (e.g., "📍 Karachi" and "🌍 Pakistan").
5. WHEN the user moves the cursor away from the flag element, THE Navbar SHALL hide the Flag_Tooltip.

### Requirement 4: Temperature Display with Detail Popover

**User Story:** As a user, I want to see the current temperature in the navbar and click it for detailed weather info, so that I can quickly check weather conditions for my detected location.

#### Acceptance Criteria

1. THE Navbar SHALL display the current temperature value with the unit symbol (e.g., "28°C") using data from the useWeather_Hook.
2. WHILE the useWeather_Hook is in a loading state, THE Navbar SHALL display "—" as a placeholder for the temperature value.
3. THE useWeather_Hook SHALL fetch weather data from the Weather_Service using the latitude and longitude provided by the useLocation_Hook.
4. THE useWeather_Hook SHALL return the temperature, feels-like temperature, humidity percentage, wind speed, weather condition description, and city name from the Weather_Service response.
5. WHEN the user clicks the temperature display, THE Navbar SHALL show the Temperature_Popover.
6. THE Temperature_Popover SHALL display: feels-like temperature (prefixed with 🌡️), humidity (prefixed with 💧), wind speed (prefixed with 🌬️), weather condition (prefixed with ☁️), and city name (prefixed with 📍).
7. WHEN the user clicks outside the Temperature_Popover, THE Navbar SHALL close the Temperature_Popover.

### Requirement 5: Real-Time Currency From/To Conversion

**User Story:** As a user, I want to see a live exchange rate from my home currency to a destination currency in the navbar, so that I can quickly reference conversion rates while planning travel.

#### Acceptance Criteria

1. THE Navbar SHALL display the exchange rate in the format "{Home_Currency} 1 = {Destination_Currency} {rate}" (e.g., "PKR 1 = USD 0.0036").
2. THE useCurrency_Hook SHALL use the Home_Currency detected by the useLocation_Hook as the source currency for conversion.
3. THE useCurrency_Hook SHALL fetch exchange rate data from the Exchange_Rate_Service using the Home_Currency as the base currency.
4. THE Destination_Currency SHALL default to "USD" when no destination has been set by the user.
5. WHEN the user clicks the currency display, THE Navbar SHALL show the Currency_Dropdown.
6. THE Currency_Dropdown SHALL contain an input field allowing the user to change the Destination_Currency code.
7. THE Currency_Dropdown SHALL display the live conversion result for the selected Destination_Currency.
8. WHEN the user clicks outside the Currency_Dropdown, THE Navbar SHALL close the Currency_Dropdown.
9. WHILE the useCurrency_Hook is in a loading state, THE Navbar SHALL display "—" as a placeholder for the exchange rate value.

### Requirement 6: VPN-Aware Data Consistency

**User Story:** As a user who uses a VPN, I want all navbar data to reflect my VPN's exit country, so that location, weather, and currency information are consistent with my apparent network location.

#### Acceptance Criteria

1. THE useLocation_Hook SHALL derive all location data exclusively from the IP_Location_Service response, which inherently reflects the current IP address including VPN exit nodes.
2. THE useWeather_Hook SHALL use the latitude and longitude from the useLocation_Hook to fetch weather data, ensuring weather reflects the IP-detected location.
3. THE useCurrency_Hook SHALL use the currency code from the useLocation_Hook as the Home_Currency, ensuring the home currency reflects the IP-detected country.
4. THE Navbar SHALL NOT contain any hardcoded country, city, or currency values for location-dependent displays.

### Requirement 7: Loading State Indicators

**User Story:** As a user, I want to see clear placeholder indicators while data is loading, so that I understand the navbar is fetching live information.

#### Acceptance Criteria

1. WHILE the useLocation_Hook is loading, THE Navbar SHALL display 🌐 in place of the country flag emoji.
2. WHILE the useWeather_Hook is loading, THE Navbar SHALL display "—" in place of the temperature value.
3. WHILE the useCurrency_Hook is loading, THE Navbar SHALL display "—" in place of the exchange rate value.

### Requirement 8: API Key Configuration

**User Story:** As a developer, I want API keys stored in environment variables, so that secrets are not committed to source control.

#### Acceptance Criteria

1. THE Weather_Service integration SHALL read the API key from the `NEXT_PUBLIC_OPENWEATHER_API_KEY` environment variable.
2. THE `.env.local` file SHALL contain the `NEXT_PUBLIC_OPENWEATHER_API_KEY` variable.
3. IF the `NEXT_PUBLIC_OPENWEATHER_API_KEY` environment variable is not set, THEN THE useWeather_Hook SHALL set an error state indicating the missing API key and SHALL NOT make a request to the Weather_Service.

### Requirement 9: Scope Constraint — No Changes Outside Navbar

**User Story:** As a developer, I want the enhancement scope limited to the Navbar and its hooks, so that no other components or pages are affected.

#### Acceptance Criteria

1. THE implementation SHALL modify only the following files: `Navigation.jsx`, `useLocation.js`, `useWeather.js`, `useCurrency.js`, `preferenceStore.js`, and `.env.local`.
2. THE implementation SHALL NOT modify the Navbar logo, navigation links, user icon button, or overall navbar layout structure.
