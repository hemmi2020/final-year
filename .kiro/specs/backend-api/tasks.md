# Tasks

## Task 1: Project Setup, Dependencies, and Server Entry Point

- [x] Install all required dependencies (mongoose, cors, dotenv, bcryptjs, jsonwebtoken, socket.io, openai, express-rate-limit, express-validator, axios, helmet, compression, morgan, neo4j-driver, @pinecone-database/pinecone, ioredis, langchain, @langchain/core, @langchain/openai)
- [x] Create server.js entry point with Express + Socket.io + all DB connections
- [x] Create config/ files (db.js, neo4j.js, pinecone.js, redis.js)
- [x] Create .env.example with all required variables
- [x] Add npm scripts (start, dev) to package.json
- Requirements: 1

## Task 2: Database Models (Mongoose)

- [x] Create User model with preferences schema
- [x] Create Trip model with itinerary and weather/currency data
- [x] Create Location model with coordinates and UNESCO status
- [x] Create Group model with members and invitations
- [x] Create Review model with ratings
- Requirements: 7

## Task 3: Authentication System (Middleware + Routes + Controller)

- [x] Create auth middleware (JWT verification)
- [x] Create admin middleware (role check)
- [x] Create auth controller (register, login, logout, refresh, profile)
- [x] Create auth routes
- [x] Create validation middleware
- Requirements: 2, 3, 4, 5

## Task 4: User Profile and Preferences Management

- [x] Create user controller (getProfile, updateProfile, updatePreferences, uploadAvatar)
- [x] Create user routes
- Requirements: 6

## Task 5: Trip CRUD Operations

- [x] Create trip controller (getAll, getById, create, update, delete)
- [x] Create trip routes
- Requirements: 8

## Task 6: External API Services (Preference-Aware)

- [x] Create mapsService.js (Google Maps/Places with preference filtering)
- [x] Create weatherService.js (OpenWeatherMap with temp unit preference)
- [x] Create currencyService.js (ExchangeRate-API)
- [x] Create externalController.js and routes
- Requirements: 10, 11, 12

## Task 7: Knowledge Graph Service (Neo4j)

- [x] Create graphService.js with Neo4j queries (Graph RAG search, tag-based queries)
- [x] Create seed.js with sample data (destinations, restaurants, attractions, tags)
- Requirements: 19

## Task 8: Vector Store Service (Pinecone)

- [x] Create vectorService.js (embed, upsert, search with metadata filtering)
- Requirements: 20

## Task 9: Memory Service (Redis)

- [x] Create memoryService.js (store/retrieve conversation context, interaction patterns)
- Requirements: 21

## Task 10: Preference Engine

- [x] Create preferenceEngine.js (load user prefs, inject into all services, merge with request overrides)
- Requirements: 22

## Task 11: AI Agent (LangGraph) and Itinerary Generation

- [x] Create agent tools (graphSearch, vectorSearch, getWeather, searchPlaces, convertCurrency, getUserMemory)
- [x] Create LangGraph agent orchestrator
- [x] Create prompt templates
- [x] Create trip generate endpoint integration
- Requirements: 9

## Task 12: AI Chat with Context Memory

- [x] Create chatController.js (process messages, anonymous + authenticated modes)
- [x] Create chat routes
- Requirements: 23

## Task 13: Location and Review Management

- [x] Create location controller (save, list, delete locations)
- [x] Create review endpoints (create, list by location)
- [x] Create location and review routes
- Requirements: 18

## Task 14: Group Trip Management

- [x] Create group controller (create, list, invite, accept invitation)
- [x] Create group routes
- Requirements: 15

## Task 15: Real-Time Features (Socket.io)

- [x] Create sockets/index.js (auth, location tracking, group chat, notifications)
- Requirements: 14

## Task 16: Admin Management

- [x] Create admin controller (users CRUD, stats, trips list)
- [x] Create admin routes
- Requirements: 13

## Task 17: Security, Rate Limiting, and Error Handling

- [x] Create rateLimiter.js (general + auth-specific limits)
- [x] Create errorHandler.js (global error middleware)
- [x] Add security headers, input sanitization
- [x] Add 404 handler for unknown routes
- Requirements: 16, 17
