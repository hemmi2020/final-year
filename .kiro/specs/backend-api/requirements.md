# Requirements Document

## Introduction

This document defines the requirements for the complete Node.js/Express backend of the AI-based Travel Application. The backend serves as the API layer for a Next.js frontend, providing authentication, trip/itinerary management with AI-powered generation via an intelligent agent system (Graph RAG + LangGraph), external API integrations (Google Maps, Weather, Currency), real-time features via Socket.io, and admin management capabilities. The system uses a Knowledge Graph (Neo4j) for relationship-aware queries, a Vector Store (Pinecone) for semantic search, and a Memory layer (Redis) for user context persistence. All external API results and AI generation are driven by user preferences (dietary, budget, currency, interests). The frontend expects all API endpoints at `http://localhost:5000` with Bearer token authentication.

## Glossary

- **Backend_Server**: The Node.js/Express application serving the REST API on port 5000
- **Auth_System**: The JWT-based authentication module handling registration, login, logout, and token refresh
- **User_Model**: The Mongoose schema representing a user with profile, preferences, auth credentials, and role
- **Trip_Model**: The Mongoose schema representing a trip/itinerary with destinations, activities, dates, and AI-generated content
- **Location_Model**: The Mongoose schema representing saved places and UNESCO sites
- **Group_Model**: The Mongoose schema representing group trips with members and invitations
- **Review_Model**: The Mongoose schema representing user reviews and ratings for destinations
- **AI_Service**: The OpenAI integration service that generates itineraries using GPT-4o-mini
- **AI_Agent**: The LangGraph-based intelligent agent that orchestrates multiple tools (graph search, vector search, weather, maps, currency) to produce context-aware itineraries
- **Graph_Service**: The Neo4j Knowledge Graph service storing relationships between destinations, restaurants, attractions, and tags (halal, family-friendly, UNESCO, etc.)
- **Vector_Service**: The Pinecone vector store service for semantic similarity search over travel content embeddings
- **Memory_Service**: The Redis/Upstash-based memory layer that persists user conversation context, past preferences, and interaction history across sessions
- **Maps_Service**: The Google Maps/Places API proxy service for location search and directions
- **Weather_Service**: The OpenWeatherMap API proxy service for weather data
- **Currency_Service**: The ExchangeRate-API proxy service for currency conversion
- **Preference_Engine**: The middleware/service layer that injects user preferences (dietary, budget, currency, temperature unit, interests) into every external API call and AI generation request
- **Socket_Server**: The Socket.io server handling real-time location tracking, group chat, and notifications
- **Auth_Middleware**: The Express middleware that validates JWT tokens and attaches user data to requests
- **Admin_Middleware**: The Express middleware that verifies the requesting user has the admin role
- **Rate_Limiter**: The express-rate-limit middleware that throttles API requests
- **Validation_Layer**: The express-validator or Zod-based input validation middleware

## Requirements

### Requirement 1: Server Initialization and Configuration

**User Story:** As a developer, I want the backend server to start with proper configuration, so that all services are correctly initialized and the API is accessible.

#### Acceptance Criteria

1. WHEN the Backend_Server starts, THE Backend_Server SHALL connect to MongoDB using the MONGODB_URI environment variable
2. WHEN the Backend_Server starts, THE Backend_Server SHALL listen on the port specified by the PORT environment variable, defaulting to 5000
3. THE Backend_Server SHALL enable CORS for the origin specified by the FRONTEND_URL environment variable with credentials support
4. THE Backend_Server SHALL parse JSON request bodies using Express JSON middleware
5. THE Backend_Server SHALL initialize the Socket_Server on the same HTTP server instance
6. IF the MongoDB connection fails, THEN THE Backend_Server SHALL log the error and exit the process with a non-zero code
7. THE Backend_Server SHALL load environment variables from a .env file using dotenv
8. WHEN the Backend_Server starts, THE Backend_Server SHALL connect to Neo4j using the NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD environment variables
9. WHEN the Backend_Server starts, THE Backend_Server SHALL initialize the Pinecone client using the PINECONE_API_KEY environment variable and connect to the "travel-app" index
10. WHEN the Backend_Server starts, THE Backend_Server SHALL connect to Redis using the REDIS_URL environment variable for the Memory_Service
11. IF any database connection (MongoDB, Neo4j, Pinecone, Redis) fails, THEN THE Backend_Server SHALL log the specific connection error but continue starting with degraded functionality for non-critical services

### Requirement 2: User Registration

**User Story:** As a new user, I want to register an account, so that I can access the travel application features.

#### Acceptance Criteria

1. WHEN a POST request is received at /api/auth/register with name, email, and password, THE Auth_System SHALL create a new User_Model document in the database
2. WHEN registering a new user, THE Auth_System SHALL hash the password using bcryptjs before storing the User_Model
3. IF the provided email already exists in the database, THEN THE Auth_System SHALL return a 400 status with an error message indicating the email is already registered
4. WHEN registration is successful, THE Auth_System SHALL return a 201 status with the user object containing id, name, email, and role fields, along with a JWT access token
5. THE Validation_Layer SHALL validate that the registration request contains a non-empty name, a valid email format, and a password of at least 6 characters
6. IF validation fails on the registration request, THEN THE Auth_System SHALL return a 400 status with descriptive validation error messages
7. WHEN creating a new user, THE Auth_System SHALL assign the default role of "user" to the User_Model

### Requirement 3: User Login

**User Story:** As a registered user, I want to log in, so that I can access my account and travel data.

#### Acceptance Criteria

1. WHEN a POST request is received at /api/auth/login with email and password, THE Auth_System SHALL authenticate the user against stored credentials
2. WHEN the email and password match a User_Model record, THE Auth_System SHALL return a 200 status with the user object containing id, name, email, and role fields, along with a JWT access token
3. IF the provided email does not match any User_Model record, THEN THE Auth_System SHALL return a 401 status with an "Invalid credentials" error message
4. IF the provided password does not match the stored hash, THEN THE Auth_System SHALL return a 401 status with an "Invalid credentials" error message
5. THE Auth_System SHALL generate JWT access tokens with a configurable expiration time using the JWT_SECRET environment variable

### Requirement 4: Token Refresh and Logout

**User Story:** As a logged-in user, I want to refresh my token and log out, so that my session remains secure.

#### Acceptance Criteria

1. WHEN a POST request is received at /api/auth/refresh with a valid refresh token, THE Auth_System SHALL return a new JWT access token
2. IF the refresh token is invalid or expired, THEN THE Auth_System SHALL return a 401 status with an error message
3. WHEN a POST request is received at /api/auth/logout, THE Auth_System SHALL invalidate the current session and return a 200 status with a success message
4. WHEN a GET request is received at /api/auth/profile with a valid Bearer token, THE Auth_System SHALL return the authenticated user's profile data

### Requirement 5: Authentication Middleware

**User Story:** As a developer, I want protected routes to require valid authentication, so that unauthorized access is prevented.

#### Acceptance Criteria

1. WHEN a request includes a valid Bearer token in the Authorization header, THE Auth_Middleware SHALL decode the token and attach the user data to the request object
2. IF a request to a protected route does not include an Authorization header, THEN THE Auth_Middleware SHALL return a 401 status with an "Access denied" error message
3. IF a request includes an expired or malformed JWT token, THEN THE Auth_Middleware SHALL return a 401 status with an "Invalid token" error message
4. THE Admin_Middleware SHALL verify that the authenticated user has the "admin" role before allowing access to admin routes
5. IF a non-admin user attempts to access an admin route, THEN THE Admin_Middleware SHALL return a 403 status with a "Forbidden" error message

### Requirement 6: User Profile Management

**User Story:** As a user, I want to view and update my profile and preferences, so that I can personalize my travel experience.

#### Acceptance Criteria

1. WHEN a GET request is received at /api/users/profile with a valid token, THE Backend_Server SHALL return the authenticated user's profile data excluding the password field
2. WHEN a PUT request is received at /api/users/profile with updated fields, THE Backend_Server SHALL update the authenticated user's User_Model and return the updated profile
3. WHEN a PUT request is received at /api/users/preferences with preference data, THE Backend_Server SHALL update the user's travel preferences including dietary restrictions, budget range, and interests
4. WHEN a POST request is received at /api/users/avatar with multipart form data, THE Backend_Server SHALL process the uploaded image and update the user's avatar URL
5. THE Validation_Layer SHALL validate that profile update fields contain valid data types and lengths

### Requirement 7: Database Models

**User Story:** As a developer, I want well-structured database models, so that data is stored consistently and efficiently.

#### Acceptance Criteria

1. THE User_Model SHALL store fields for name, email, password hash, role (defaulting to "user"), avatar URL, travel preferences (dietary as array of strings, budget level, preferred currency, temperature unit, interests as array of strings, travel style), and timestamps
2. THE Trip_Model SHALL store fields for user reference, title, destination, start date, end date, itinerary (array of day objects with activities), budget, status, AI-generated content, weather data snapshot, currency conversion data, and timestamps
3. THE Location_Model SHALL store fields for name, coordinates (latitude and longitude), type, description, UNESCO status, and user reference for saved locations
4. THE Group_Model SHALL store fields for name, description, trip reference, creator reference, members array with roles and status, and invitation codes
5. THE Review_Model SHALL store fields for user reference, location reference, rating (1-5), review text, and timestamps
6. THE User_Model SHALL define a unique index on the email field
7. THE Trip_Model SHALL define an index on the user reference field for efficient query of user trips

### Requirement 8: Trip CRUD Operations

**User Story:** As a user, I want to create, read, update, and delete trips, so that I can manage my travel plans.

#### Acceptance Criteria

1. WHEN a GET request is received at /api/trips with a valid token, THE Backend_Server SHALL return all trips belonging to the authenticated user
2. WHEN a GET request is received at /api/trips/:id with a valid token, THE Backend_Server SHALL return the trip matching the provided ID if the trip belongs to the authenticated user
3. WHEN a POST request is received at /api/trips with trip data, THE Backend_Server SHALL create a new Trip_Model document associated with the authenticated user and return the created trip with a 201 status
4. WHEN a PUT request is received at /api/trips/:id with updated fields, THE Backend_Server SHALL update the specified trip and return the updated trip data
5. WHEN a DELETE request is received at /api/trips/:id, THE Backend_Server SHALL delete the specified trip and return a 200 status with a success message
6. IF a user attempts to access or modify a trip that does not belong to the user, THEN THE Backend_Server SHALL return a 404 status with a "Trip not found" error message
7. THE Validation_Layer SHALL validate that trip creation requests include a title and destination at minimum

### Requirement 9: AI-Powered Itinerary Generation via Intelligent Agent

**User Story:** As a user, I want to generate AI-powered travel itineraries that consider my preferences, real-time weather, currency rates, and relationship-aware place recommendations, so that I get truly personalized day-by-day travel plans.

#### Acceptance Criteria

1. WHEN a POST request is received at /api/trips/generate with travel preferences, THE AI_Agent SHALL orchestrate a multi-step pipeline: load user preferences, query the Knowledge Graph, fetch real-time weather, get currency rates, search the Vector Store, and generate the itinerary via OpenAI GPT-4o-mini
2. THE AI_Agent SHALL load the authenticated user's preferences from the User_Model and the Memory_Service to include dietary restrictions, budget level, preferred currency, temperature unit, and past travel patterns
3. THE AI_Agent SHALL query the Graph_Service to find destinations, restaurants, and attractions that match the user's tags (e.g., halal restaurants NEAR family-friendly attractions)
4. THE AI_Agent SHALL fetch real-time weather data from the Weather_Service for the destination and optimize the itinerary based on weather conditions (e.g., indoor activities on rainy days)
5. THE AI_Agent SHALL fetch the current currency exchange rate from the Currency_Service and convert all cost estimates to the user's preferred currency
6. THE AI_Agent SHALL query the Vector_Service for semantically similar travel content and recommendations based on the user's query
7. THE AI_Agent SHALL combine all gathered context (graph results, weather, currency, vector results, user preferences) into a structured prompt and send it to the OpenAI API using GPT-4o-mini with JSON response format
8. WHEN itinerary generation is successful, THE Backend_Server SHALL return the generated itinerary with day-by-day schedules, restaurant recommendations filtered by dietary preferences, UNESCO sites, weather-optimized activities, and cost estimates in the user's preferred currency
9. IF any individual tool call (weather, maps, currency) fails, THEN THE AI_Agent SHALL continue generation with available data and note the missing information in the response
10. IF the OpenAI API call fails, THEN THE AI_Agent SHALL return a 500 status with a descriptive error message

### Requirement 10: External API - Google Maps and Places (Preference-Aware)

**User Story:** As a user, I want to search for places filtered by my preferences, so that I find relevant locations matching my dietary needs, budget, and interests.

#### Acceptance Criteria

1. WHEN a search request is received, THE Maps_Service SHALL query the Google Maps Places API with the provided search term, location parameters, AND the user's preference filters (dietary tags, budget level)
2. THE Maps_Service SHALL support searching for specific place types including halal restaurants, tourist attractions, hotels, and UNESCO sites, filtered by user preferences
3. WHEN the Google Maps API returns results, THE Maps_Service SHALL format the response with place name, address, coordinates, rating, photos, and price level converted to the user's preferred currency
4. IF the Google Maps API call fails, THEN THE Maps_Service SHALL return a 500 status with an error message
5. THE Maps_Service SHALL use the GOOGLE_MAPS_API_KEY environment variable for authentication with the Google API

### Requirement 11: External API - Weather (Preference-Aware)

**User Story:** As a user, I want weather data in my preferred temperature unit, so that I can plan my trip with familiar measurements.

#### Acceptance Criteria

1. WHEN a weather request is received with latitude and longitude, THE Weather_Service SHALL query the OpenWeatherMap API for current weather data
2. WHEN a forecast request is received with latitude and longitude, THE Weather_Service SHALL query the OpenWeatherMap API for multi-day forecast data
3. THE Weather_Service SHALL return temperature converted to the user's preferred unit (metric or imperial based on user preferences), weather description, humidity, and wind speed
4. IF the OpenWeatherMap API call fails, THEN THE Weather_Service SHALL return a 500 status with an error message
5. THE Weather_Service SHALL use the OPENWEATHER_API_KEY environment variable for authentication

### Requirement 12: External API - Currency Conversion

**User Story:** As a user, I want to convert currencies, so that I can understand costs in my local currency while traveling.

#### Acceptance Criteria

1. WHEN a currency conversion request is received with source currency, target currency, and amount, THE Currency_Service SHALL query the ExchangeRate-API for current exchange rates
2. WHEN the exchange rate is retrieved, THE Currency_Service SHALL calculate and return the converted amount along with the exchange rate used
3. IF the ExchangeRate-API call fails, THEN THE Currency_Service SHALL return a 500 status with an error message
4. THE Currency_Service SHALL use the EXCHANGE_RATE_API_KEY environment variable for authentication

### Requirement 13: Admin User Management

**User Story:** As an admin, I want to manage users and view platform statistics, so that I can administer the application.

#### Acceptance Criteria

1. WHEN a GET request is received at /api/admin/users with admin authentication, THE Backend_Server SHALL return a paginated list of all users
2. WHEN a GET request is received at /api/admin/users/:id with admin authentication, THE Backend_Server SHALL return the specified user's details
3. WHEN a PUT request is received at /api/admin/users/:id with admin authentication, THE Backend_Server SHALL update the specified user's data and return the updated user
4. WHEN a DELETE request is received at /api/admin/users/:id with admin authentication, THE Backend_Server SHALL delete the specified user and return a success message
5. WHEN a GET request is received at /api/admin/stats with admin authentication, THE Backend_Server SHALL return platform statistics including total users, total trips, and active users count
6. WHEN a GET request is received at /api/admin/trips with admin authentication, THE Backend_Server SHALL return a paginated list of all trips across all users
7. WHILE a request targets any /api/admin route, THE Admin_Middleware SHALL verify the requesting user has the "admin" role

### Requirement 14: Real-Time Features with Socket.io

**User Story:** As a user in a group trip, I want real-time location sharing and group chat, so that I can coordinate with my travel companions.

#### Acceptance Criteria

1. WHEN a client connects to the Socket_Server with a valid auth token, THE Socket_Server SHALL authenticate the connection and register the socket
2. WHEN a client emits a "group:join" event with a group ID, THE Socket_Server SHALL add the client to the specified group room
3. WHEN a client emits a "location:update" event with user ID, group ID, and coordinates, THE Socket_Server SHALL broadcast the location update to all other members in the group room
4. WHEN a client emits a "message:send" event with group ID and message content, THE Socket_Server SHALL broadcast the message to all members in the group room
5. WHEN a client disconnects, THE Socket_Server SHALL remove the client from all group rooms and notify remaining members
6. THE Socket_Server SHALL configure CORS to allow connections from the FRONTEND_URL origin with credentials

### Requirement 15: Group Trip Management

**User Story:** As a user, I want to create and manage group trips, so that I can plan travel with friends and family.

#### Acceptance Criteria

1. WHEN a POST request is received at /api/groups with group data, THE Backend_Server SHALL create a new Group_Model with the authenticated user as the creator and first member
2. WHEN a GET request is received at /api/groups with a valid token, THE Backend_Server SHALL return all groups where the authenticated user is a member
3. WHEN an invitation is sent for a group, THE Backend_Server SHALL generate a unique invitation code and add the invited user to the members array with a "pending" status
4. WHEN a user accepts a group invitation, THE Backend_Server SHALL update the member status from "pending" to "accepted"
5. IF a user attempts to access a group where the user is not a member, THEN THE Backend_Server SHALL return a 403 status with a "Forbidden" error message

### Requirement 16: Input Validation and Error Handling

**User Story:** As a developer, I want consistent input validation and error handling, so that the API is robust and returns meaningful error responses.

#### Acceptance Criteria

1. THE Validation_Layer SHALL validate all incoming request bodies, query parameters, and URL parameters before they reach the controller logic
2. WHEN validation fails, THE Validation_Layer SHALL return a 400 status with an array of descriptive error messages indicating which fields failed validation
3. THE Backend_Server SHALL implement a global error handling middleware that catches unhandled errors and returns a 500 status with a generic error message
4. THE Backend_Server SHALL log all unhandled errors with stack traces for debugging purposes
5. IF a request targets a non-existent route, THEN THE Backend_Server SHALL return a 404 status with a "Route not found" error message

### Requirement 17: Security and Rate Limiting

**User Story:** As a developer, I want the API to be secure and protected against abuse, so that the application remains reliable and safe.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL limit each IP address to a maximum of 100 requests per 15-minute window on general API routes
2. THE Rate_Limiter SHALL limit each IP address to a maximum of 10 requests per 15-minute window on authentication routes to prevent brute-force attacks
3. THE Backend_Server SHALL set appropriate security headers including Content-Type validation
4. THE Backend_Server SHALL sanitize all user inputs to prevent NoSQL injection attacks
5. THE Backend_Server SHALL provide a .env.example file documenting all required environment variables without actual secret values, including: PORT, MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, OPENAI_API_KEY, GOOGLE_MAPS_API_KEY, OPENWEATHER_API_KEY, EXCHANGE_RATE_API_KEY, FRONTEND_URL, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, PINECONE_API_KEY, and REDIS_URL

### Requirement 18: Location and Review Management

**User Story:** As a user, I want to save favorite locations and leave reviews, so that I can track places I love and share my experiences.

#### Acceptance Criteria

1. WHEN a POST request is received at /api/locations with location data, THE Backend_Server SHALL save the location to the authenticated user's saved locations
2. WHEN a GET request is received at /api/locations with a valid token, THE Backend_Server SHALL return the authenticated user's saved locations
3. WHEN a DELETE request is received at /api/locations/:id, THE Backend_Server SHALL remove the specified location from the user's saved locations
4. WHEN a POST request is received with review data for a location, THE Backend_Server SHALL create a new Review_Model associated with the authenticated user and the specified location
5. WHEN a GET request is received for reviews of a location, THE Backend_Server SHALL return all reviews for the specified location with user names and ratings

### Requirement 19: Knowledge Graph Service (Neo4j)

**User Story:** As a user, I want the system to understand relationships between places (e.g., halal restaurants NEAR family-friendly attractions), so that I get intelligent, relationship-aware recommendations.

#### Acceptance Criteria

1. THE Graph_Service SHALL connect to Neo4j Aura using the NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD environment variables
2. THE Graph_Service SHALL define a schema with nodes for Destination, Restaurant, Attraction, and Tag, and relationships such as HAS_RESTAURANT, NEAR_ATTRACTION, HAS_TAG, and IN_DESTINATION
3. THE Graph_Service SHALL support querying restaurants by tag (e.g., "halal") that are NEAR attractions matching another tag (e.g., "family-friendly") within a specified destination
4. THE Graph_Service SHALL support a Graph RAG search function that accepts a natural language query and user preference tags, and returns ranked results from the knowledge graph
5. THE Graph_Service SHALL provide a seed data function that populates the knowledge graph with sample destinations, restaurants, attractions, and tag relationships for development and testing
6. IF the Neo4j connection is unavailable, THEN THE Graph_Service SHALL return an empty result set and log a warning, allowing the AI_Agent to continue with other data sources

### Requirement 20: Vector Store Service (Pinecone)

**User Story:** As a user, I want the system to find semantically similar travel content based on my queries, so that I get relevant recommendations even when I don't use exact keywords.

#### Acceptance Criteria

1. THE Vector_Service SHALL connect to Pinecone using the PINECONE_API_KEY environment variable and target the "travel-app" index with 1536-dimension vectors
2. THE Vector_Service SHALL generate text embeddings using the OpenAI embeddings API (text-embedding-ada-002) for indexing and querying
3. WHEN travel content (destinations, activities, reviews) is created or updated, THE Vector_Service SHALL generate an embedding and upsert it into the Pinecone index with metadata including destination, type, tags, and rating
4. WHEN a semantic search query is received, THE Vector_Service SHALL generate an embedding for the query, search the Pinecone index, and return the top-K most similar results with their metadata
5. THE Vector_Service SHALL support filtering search results by metadata fields (destination, type, tags) to narrow results based on user preferences
6. IF the Pinecone connection is unavailable, THEN THE Vector_Service SHALL return an empty result set and log a warning

### Requirement 21: Memory Service (Redis)

**User Story:** As a user, I want the system to remember my past interactions and preferences across sessions, so that recommendations improve over time and I don't have to repeat myself.

#### Acceptance Criteria

1. THE Memory_Service SHALL connect to Redis using the REDIS_URL environment variable
2. WHEN a user interacts with the AI chat or generates an itinerary, THE Memory_Service SHALL store the conversation context (last N messages) keyed by user ID with a configurable TTL (default 24 hours)
3. WHEN the AI_Agent processes a new request, THE Memory_Service SHALL retrieve the user's recent conversation history and include it as context for the AI generation
4. THE Memory_Service SHALL store user interaction patterns (frequently searched destinations, preferred activity types) and make them available to the Preference_Engine
5. IF the Redis connection is unavailable, THEN THE Memory_Service SHALL operate without memory context and log a warning, allowing the AI_Agent to function with only the current request data

### Requirement 22: Context-Aware Preference Engine

**User Story:** As a user, I want every feature of the app to automatically use my preferences (dietary, budget, currency, interests), so that I get a fully personalized experience without manually specifying preferences each time.

#### Acceptance Criteria

1. THE Preference_Engine SHALL load the authenticated user's preferences from the User_Model on every request to a preference-aware endpoint
2. THE Preference_Engine SHALL inject dietary preferences into all restaurant and food-related searches via the Maps_Service and Graph_Service
3. THE Preference_Engine SHALL inject budget level into place searches to filter results by price range
4. THE Preference_Engine SHALL inject the user's preferred currency into all cost-related responses, converting amounts via the Currency_Service
5. THE Preference_Engine SHALL inject the user's preferred temperature unit into all weather responses via the Weather_Service
6. WHEN a user has not set preferences, THE Preference_Engine SHALL use sensible defaults (metric units, USD currency, no dietary restrictions, moderate budget)
7. THE Preference_Engine SHALL merge user-stored preferences with any request-level overrides, giving priority to request-level parameters

### Requirement 23: AI Chat with Context Memory

**User Story:** As a user, I want to have a conversational AI chat that remembers what I said earlier in the conversation, so that I can naturally refine my travel plans through dialogue.

#### Acceptance Criteria

1. WHEN a POST request is received at /api/chat with a message and optional conversation ID, THE AI_Agent SHALL retrieve the conversation history from the Memory_Service and include it as context
2. THE AI_Agent SHALL process the user's message through the full agent pipeline (preferences, graph, vector, external APIs) based on the intent detected in the message
3. WHEN the AI_Agent generates a response, THE Memory_Service SHALL append both the user message and AI response to the conversation history
4. IF the user is not authenticated, THE AI_Agent SHALL still process the chat request but without user preferences or memory persistence (anonymous chat mode)
5. WHEN the user is authenticated and sends a chat message, THE AI_Agent SHALL use the user's stored preferences and past interaction patterns to personalize the response
6. THE Backend_Server SHALL return the AI response along with any structured data (itinerary, places, weather) extracted during processing
