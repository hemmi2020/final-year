# Requirements Document

## Introduction

This document specifies the requirements for overhauling the AI Chat trip generation flow in the TravelAI application. The current implementation suffers from a critical bug where the AI enters an infinite question loop, never progressing to itinerary generation. The overhaul addresses five core issues: fixing the conversation state machine, building a rich itinerary display in the right panel, verifying RapidAPI flight/hotel integration, implementing trip save functionality, and enabling community sharing. The existing orange theme (#FF4500), navbar, Mapbox setup, and other working pages remain unchanged.

## Glossary

- **Chat_Page**: The frontend page at `/chat` where users interact with the AI to plan trips (file: `frontend/src/app/chat/page.jsx`)
- **Trip_State**: A client-side object tracking which trip-planning fields have been collected from the user (destination, origin, duration, travelCompanion, vibe, budget, dates)
- **State_Machine**: The deterministic conversation controller on the frontend that decides which question to ask next based on Trip_State completeness
- **AI_Agent**: The backend service that processes chat messages via OpenAI GPT-4o-mini and returns responses (file: `backend/services/ai/agent.js`)
- **Chat_Controller**: The backend controller handling POST /api/chat and POST /api/trips/generate endpoints (file: `backend/controllers/chatController.js`)
- **Quick_Reply_Chips**: Clickable UI buttons displayed below AI messages that allow users to select predefined answers
- **Generating_Panel**: The animated right-panel overlay shown during itinerary generation with progress checklist and percentage counter
- **Itinerary_Card**: The rich right-panel display showing the complete generated trip with flights, hotels, day-by-day activities, and action buttons
- **Trip_Model**: The MongoDB document schema for saved trips (file: `backend/models/Trip.js`)
- **Community_Page**: The public page at `/community` where users browse shared trips
- **Share_Modal**: The modal dialog for sharing a trip via link, email, or community post (file: `frontend/src/components/chat/ShareTripModal.jsx`)
- **Flight_Service**: The backend service querying RapidAPI Sky Scrapper for flight data (file: `backend/services/external/flightService.js`)
- **Hotel_Service**: The backend service querying RapidAPI Booking.com for hotel data (file: `backend/services/external/hotelService.js`)
- **Session_Storage**: The browser sessionStorage API used to persist Trip_State across page refreshes within the same tab
- **PKR**: Pakistani Rupee, the default display currency for prices
- **Dashboard_Page**: The user dashboard at `/dashboard` showing trip counts and recent trips

## Requirements

### Requirement 1: Conversation State Machine

**User Story:** As a user, I want the AI chat to ask each trip-planning question exactly once and automatically generate my itinerary when all information is collected, so that I am not stuck in a repetitive question loop.

#### Acceptance Criteria

1. WHEN the Chat_Page loads, THE State_Machine SHALL initialize a Trip_State object with fields: destination (null), origin (null), duration (null), travelCompanion (null), vibe (null), budget (null), dates (null), and isComplete (false)
2. THE State_Machine SHALL ask trip-planning questions in the following strict order: destination, duration, travelCompanion, vibe, budget
3. WHEN the user provides a value for a Trip_State field, THE State_Machine SHALL store that value in Trip_State and mark the field as filled
4. WHEN a Trip_State field already contains a value, THE State_Machine SHALL skip the question for that field and proceed to the next unfilled field
5. WHEN the user sends a free-text message, THE State_Machine SHALL extract any recognizable trip-planning information and auto-fill the corresponding Trip_State fields
6. WHEN all required Trip_State fields (destination, duration, travelCompanion, vibe, budget) are filled, THE State_Machine SHALL set isComplete to true and automatically trigger itinerary generation without asking further questions
7. THE State_Machine SHALL populate the origin field from the user location detected by the useLocation hook
8. WHEN the Chat_Page loads with an existing Trip_State in Session_Storage, THE State_Machine SHALL restore the Trip_State from Session_Storage
9. WHEN any Trip_State field changes, THE State_Machine SHALL persist the updated Trip_State to Session_Storage
10. WHEN the user clicks the "New Trip" button, THE State_Machine SHALL clear Trip_State from Session_Storage and reset all fields to null

### Requirement 2: Quick Reply Chips

**User Story:** As a user, I want to see clickable option chips below AI questions so that I can quickly select answers without typing.

#### Acceptance Criteria

1. WHEN the AI_Agent asks about duration, THE Chat_Page SHALL display Quick_Reply_Chips with options: "3 days", "1 week", "2 weeks", "Custom"
2. WHEN the AI_Agent asks about travel companion, THE Chat_Page SHALL display Quick_Reply_Chips with options: "Solo", "With friends", "Family", "Couple"
3. WHEN the AI_Agent asks about vibe, THE Chat_Page SHALL display multi-select Quick_Reply_Chips with options including: "History", "Food", "Shopping", "Adventure", "Nature", "Nightlife", "Culture", "Relaxation"
4. WHEN the AI_Agent asks about budget, THE Chat_Page SHALL display Quick_Reply_Chips with options: "Budget", "Mid-range", "Luxury"
5. WHEN the user clicks a Quick_Reply_Chip, THE State_Machine SHALL auto-fill the corresponding Trip_State field with the selected value
6. WHEN the user clicks a Quick_Reply_Chip, THE Chat_Page SHALL display the selected value as a user message in the chat

### Requirement 3: Itinerary Generation Loading Screen

**User Story:** As a user, I want to see an engaging animated loading screen while my itinerary is being generated, so that I know the system is working and I stay engaged.

#### Acceptance Criteria

1. WHEN itinerary generation is triggered, THE Generating_Panel SHALL display immediately in the right panel with an orange gradient background (#FF4500 to #FF6B35 to #FF8C00)
2. THE Generating_Panel SHALL display a heading in the format "{ORIGIN} to {DESTINATION} Trip" using values from Trip_State
3. THE Generating_Panel SHALL display four travel-related images in an overlapping tilted card layout sourced from Unsplash
4. THE Generating_Panel SHALL display an animated progress checklist with items: "Optimizing your route", "Finding halal restaurants", "Searching best hotels", "Building day-by-day plan"
5. THE Generating_Panel SHALL animate checklist items to check off sequentially over an 8-second period at 25%, 50%, 75%, and 100% progress
6. THE Generating_Panel SHALL display a percentage counter that counts from 0 to 100 over the 8-second period
7. THE Generating_Panel SHALL display a progress bar that fills from 0% to 100% width over the 8-second period

### Requirement 4: Full Itinerary Card Display

**User Story:** As a user, I want to see my generated itinerary displayed as a rich, detailed card in the right panel, so that I can review all trip details including flights, hotels, and daily activities.

#### Acceptance Criteria

1. WHEN itinerary generation completes, THE Itinerary_Card SHALL replace the Generating_Panel in the right panel
2. THE Itinerary_Card SHALL display a destination hero image at the top
3. THE Itinerary_Card SHALL display a trip summary section showing: total days, city count, number of experiences, hotels, and transport options
4. THE Itinerary_Card SHALL display a route bar showing: Origin → Destination → Origin with travel dates
5. THE Itinerary_Card SHALL display a Mapbox mini map with a route arc between origin and destination
6. THE Itinerary_Card SHALL display a destination description section with photos
7. WHEN flight data is available from Flight_Service, THE Itinerary_Card SHALL display a flight card with airline name, departure and arrival times, price in PKR, and "Change" and "Lock" action buttons
8. WHEN hotel data is available from Hotel_Service, THE Itinerary_Card SHALL display a hotel card with hotel image, star rating, guest rating, price per night in PKR, and hotel name
9. THE Itinerary_Card SHALL display day-by-day expandable cards, where each card shows the day number, theme, and a list of activities grouped by time of day (morning, lunch, afternoon, dinner)
10. WHEN the user clicks on a collapsed day card, THE Itinerary_Card SHALL expand the card to show all activities for that day
11. THE Itinerary_Card SHALL display a return flight card at the bottom of the itinerary
12. THE Itinerary_Card SHALL display sticky bottom action buttons: "Save Trip", "Share to Community", and "Modify Plan"

### Requirement 5: Backend Itinerary Generation with Trip State

**User Story:** As a user, I want the backend to receive my complete trip preferences and generate a comprehensive itinerary using all collected information, so that the generated plan matches my exact requirements.

#### Acceptance Criteria

1. WHEN the frontend triggers itinerary generation, THE Chat_Page SHALL send the complete Trip_State object (destination, origin, duration, travelCompanion, vibe, budget, dates) to the backend via POST /api/trips/generate
2. THE AI_Agent SHALL use all Trip_State fields when constructing the itinerary generation prompt for GPT-4o-mini
3. THE AI_Agent SHALL include real flight data from Flight_Service in the generated itinerary when available
4. THE AI_Agent SHALL include real hotel data from Hotel_Service in the generated itinerary when available
5. THE Chat_Controller SHALL save the generated itinerary as a Trip_Model document with status "draft" and aiGenerated set to true
6. THE Chat_Controller SHALL return the saved trip ID along with the generated itinerary data in the API response

### Requirement 6: RapidAPI Flight and Hotel Integration Verification

**User Story:** As a user, I want to see real flight and hotel prices in my itinerary, so that I can make informed booking decisions.

#### Acceptance Criteria

1. THE Flight_Service SHALL query the RapidAPI Sky Scrapper endpoint for flights from the origin city to the destination city
2. THE Hotel_Service SHALL query the RapidAPI Booking.com endpoint for hotels in the destination city
3. THE Flight_Service SHALL return flight results including: airline name, origin airport code, destination airport code, departure time, arrival time, duration, number of stops, and price
4. THE Hotel_Service SHALL return hotel results including: hotel name, star rating, guest rating, price per night, distance from city center, and hotel image URL
5. IF the RapidAPI quota is exceeded or the API call fails, THEN THE Flight_Service SHALL return mock flight data as a fallback
6. IF the RapidAPI quota is exceeded or the API call fails, THEN THE Hotel_Service SHALL return mock hotel data as a fallback
7. THE Flight_Service SHALL return prices converted to PKR
8. THE Hotel_Service SHALL return prices converted to PKR

### Requirement 7: Save Trip Functionality

**User Story:** As a user, I want to save my generated itinerary to my account, so that I can access it later from my dashboard.

#### Acceptance Criteria

1. WHEN the user clicks "Save Trip" on the Itinerary_Card, THE Chat_Page SHALL call the POST /api/trips/generate endpoint if the trip has not been saved yet
2. WHEN the trip is saved successfully, THE Chat_Page SHALL display a toast notification confirming the save
3. WHEN the trip is saved successfully, THE Chat_Page SHALL update the "Save Trip" button to show a "Saved" state with a checkmark icon
4. WHEN the trip is saved successfully, THE Dashboard_Page trip count SHALL reflect the new trip on the next page load
5. WHEN the trip is saved successfully, THE trip SHALL appear in the "Recent Trips" section of the Dashboard_Page on the next page load
6. IF the save operation fails, THEN THE Chat_Page SHALL display an error toast notification with a descriptive message

### Requirement 8: Share to Community

**User Story:** As a user, I want to share my trip with the community, so that other travelers can discover and clone my itinerary.

#### Acceptance Criteria

1. WHEN the user clicks "Share to Community" on the Itinerary_Card, THE Chat_Page SHALL open the Share_Modal
2. THE Share_Modal SHALL display a preview of the trip with the destination name and trip title
3. THE Share_Modal SHALL provide an option to add a personal note to the shared trip
4. THE Share_Modal SHALL provide a toggle to share anonymously
5. WHEN the user confirms sharing, THE Share_Modal SHALL call the POST /api/community/trips/:id/publish endpoint to make the trip public
6. WHEN the trip is published successfully, THE trip SHALL appear on the Community_Page in the trip grid
7. THE Community_Page SHALL display shared trips in a grid layout with destination image, trip title, author name, like count, and action buttons (Like, Clone, View)
8. THE Community_Page SHALL provide filter options to search by destination and sort by newest, most popular, or budget

### Requirement 9: Chat Message Rendering with State Awareness

**User Story:** As a user, I want the AI chat messages to be contextually aware of what information has already been collected, so that the conversation feels natural and progressive.

#### Acceptance Criteria

1. WHEN the State_Machine sends a message to the AI_Agent, THE Chat_Page SHALL include the current Trip_State as context in the API request
2. THE AI_Agent SHALL acknowledge previously collected information in responses rather than asking for information already present in Trip_State
3. WHEN the user provides multiple pieces of information in a single message, THE State_Machine SHALL extract and fill all recognizable Trip_State fields from that message
4. WHEN the user clicks "Modify Plan" after itinerary generation, THE State_Machine SHALL allow the user to update specific Trip_State fields and re-trigger generation
