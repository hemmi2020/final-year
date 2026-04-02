# Final Year Project II — 5th Week to 10th Week

## Project Progress Report (PRF#2)

### Department of Computer Science / Software Engineering

**Date Range:** 10th Jan 2026 to 27th March 2026

**Group #:** ******\_\_******

**FYP Title:** TravelFy AI — Intelligent AI-Powered Travel Planning Platform with Graph RAG, Vector Search, and Context-Aware Preference Engine

---

## FYP-2 Timeline

| Week        | Phase                                       | Status                      |
| ----------- | ------------------------------------------- | --------------------------- |
| Weeks 1–2   | Planning and Requirements Finalization      | Submitted Already           |
| Weeks 3–4   | System Design and Setup                     | Submitted Already           |
| Weeks 5–7   | Development Phase I (Core Modules)          | ✅ Completed                |
| Weeks 8–9   | Development Phase II and Integration        | ✅ Completed                |
| Weeks 10–11 | Testing and Debugging                       | 🔄 In Progress (Test Phase) |
| Week 12     | Final Documentation (Draft)                 | Upcoming                    |
| Week 13     | Final Refinements and Blue Book Preparation | Upcoming                    |
| Week 14     | Final Submission                            | Upcoming                    |

---

## 1. Tasks Planned for Week 5th and 6th

- **Task A:** Build the complete frontend UI using Next.js 13+ (App Router) with Tailwind CSS v4, including reusable UI component library (Button, Card, Input, Modal, Select, Checkbox, Radio, Textarea), layout components (Navigation, Footer), and landing page sections (Hero, Destinations, Quiz, Testimonials).

- **Task B:** Set up frontend state management (Zustand stores with persist middleware for auth and trips), API layer (Axios client with JWT interceptors), smooth scrolling provider (Lenis), and implement the AI Chat Interface allowing anonymous users to chat without login.

---

## 2. Tasks Completed During Week 5th to 9th

### Week 5–6: Frontend Development (Core UI & Architecture)

- Built complete theme system with CSS custom properties for single-point color changes across the entire application
- Created 8+ reusable UI components with JSDoc documentation: Button, Card, Input, Modal, Select, Checkbox, Radio, Textarea
- Implemented responsive Navigation with mobile hamburger menu and sticky scroll behavior
- Built landing page with Hero section, Destinations carousel, Travel Quiz section, and Testimonials
- Set up Zustand stores (authStore, tripStore) with localStorage persistence
- Configured Axios API client with automatic JWT token injection and 401 error handling
- Integrated Lenis smooth scrolling provider

### Week 6–7: Frontend Features & Auth System

- Built AI Chat Interface component with real-time messaging UI — anonymous users can chat freely, login prompt appears only for save/book actions
- Implemented modal-based authentication system (Login Modal + Register Modal) instead of separate pages for better UX
- Created protected Dashboard page with trip statistics, recent trips, and quick actions
- Built Destinations page and Profile page
- Installed all required packages: lucide-react, zustand, @tanstack/react-query, axios, react-hook-form, zod, socket.io-client

### Week 7–8: Backend Foundation & Core APIs

- Initialized Node.js/Express 5 backend with full middleware stack (Helmet, CORS, Compression, Morgan, Rate Limiting)
- Created all database connection configs with graceful degradation: MongoDB (Mongoose), Neo4j (Knowledge Graph), Pinecone (Vector Store), Redis (Memory)
- Built 5 Mongoose models: User (with full preferences schema — dietary, budget, currency, temperature unit, interests, travel style), Trip (with itinerary/weather/currency data), Location, Group (with invite codes), Review
- Implemented complete authentication system: JWT-based register/login/logout/refresh with bcrypt password hashing
- Created auth middleware (protect + optionalAuth), admin middleware, input validation middleware (express-validator), and rate limiting (general + auth-specific)
- Built User profile and preferences management API (CRUD + avatar upload)
- Built Trip CRUD API with pagination

### Week 8–9: Advanced AI Architecture & External API Integration

- **Knowledge Graph (Neo4j):** Built Graph RAG service with Cypher queries for tag-based search (e.g., "halal restaurants NEAR family-friendly attractions in Tokyo"), proximity queries, and seeded sample data for Tokyo, Istanbul, and Paris with restaurants, attractions, tags, and NEAR relationships
- **Vector Store (Pinecone):** Built vector service with OpenAI text-embedding-ada-002 for semantic search, upsert operations, and metadata filtering
- **Memory Service (Redis):** Built conversation persistence with message storage/retrieval, interaction tracking, and user behavior pattern analysis
- **Preference Engine:** Built context-aware preference engine that loads user preferences from MongoDB, merges with request-time overrides, and injects into ALL service calls (weather shows user's temp unit, currency converts to user's preferred currency, maps filter by dietary preferences)
- **External APIs (all preference-aware):**
  - OpenWeatherMap integration — returns weather in user's preferred temperature unit (metric/imperial)
  - ExchangeRate-API integration — pair conversion and rate lookup between any supported currencies
  - Google Maps/Places integration (placeholder for paid API) — searches filtered by user's dietary and budget preferences
- **AI Agent Pipeline:** Built full orchestration pipeline: User Request → Load Preferences + Memory → Graph RAG Search → Vector Semantic Search → Weather API → Currency API → GPT-4o-mini LLM Generation → Save to Memory → Return Personalized Itinerary
- Built AI Chat controller with anonymous + authenticated modes and auto-save itinerary as draft trip
- **Group Trip Management:** Create groups, invite members by email, join via invite code, member role management
- **Socket.io Real-Time:** JWT-authenticated connections, live location tracking, group chat rooms, trip collaboration rooms
- **Admin Panel API:** User management (CRUD with search/pagination), dashboard statistics, trip listing

### Week 9–10: Integration & API Testing

- Connected and verified all external API keys: MongoDB Atlas, Neo4j Aura, Pinecone, OpenWeatherMap, ExchangeRate-API
- Verified graceful degradation — server runs even if Neo4j, Pinecone, or Redis are unavailable
- Tested ExchangeRate API (USD→PKR = 279.29 confirmed working)
- Tested OpenWeather API (Tokyo weather data confirmed working)
- Tested Pinecone connection (travel-app index with 1536 dimensions confirmed)
- Tested Neo4j Aura connection (knowledge graph confirmed working)

---

## 3. Pending / In-Progress Tasks

- OpenAI API billing/credits need to be added for AI itinerary generation to function (key is valid, quota exceeded)
- Google Maps/Places API integration pending (paid API — will evaluate alternatives or use free tier with $200 monthly credit)
- Redis cloud instance setup for production memory service (currently using graceful degradation)
- Frontend-Backend full integration testing (API endpoints are built, frontend API layer is configured)
- Socket.io real-time features end-to-end testing with frontend
- Neo4j Knowledge Graph seeding with more destination data beyond Tokyo, Istanbul, Paris

---

## 4. Problems or Challenges Encountered in Testing (10th Week)

- **Description:** OpenAI API quota exceeded during testing phase. The GPT-4o-mini model calls for itinerary generation and chat responses return 429 (rate limit) errors. This blocks the core AI functionality testing.
- **Proposed Solutions:** Add billing credits to OpenAI platform account ($5-10 sufficient for testing). As a fallback, implement response caching to reduce API calls during development.

- **Description:** Google Maps and Places API requires billing setup (paid API). Cannot test location-based search and place recommendations without it.
- **Proposed Solutions:** The system uses graceful degradation — Maps features return empty results when API key is unavailable. Will evaluate Google's $200/month free credit tier or use OpenStreetMap/Nominatim as a free alternative.

- **Description:** Neo4j Aura free tier has connection limits and occasional cold-start delays (instance pauses after inactivity).
- **Proposed Solutions:** Implemented graceful degradation in the connection config — server continues without Knowledge Graph if Neo4j is unavailable. Added reconnection logic.

---

## 5. Goals for Next Week 11th and 12th

- Complete frontend-backend integration testing for all API endpoints (auth, trips, chat, external APIs)
- Add OpenAI billing credits and perform end-to-end AI itinerary generation testing
- Test Socket.io real-time features (location tracking, group chat) with multiple connected clients
- Seed Neo4j Knowledge Graph with additional destination data (10+ cities with restaurants, attractions, and relationship data)
- Begin final documentation draft — system architecture diagrams, API documentation, user manual
- Implement any bug fixes discovered during integration testing

---

## 6. Signatures

| S. No | Group Member's Name  | Student ID   | Student Sign |
| ----- | -------------------- | ------------ | ------------ |
| 1     | ********\_\_******** | ****\_\_**** | ****\_\_**** |
| 2     | ********\_\_******** | ****\_\_**** | ****\_\_**** |
| 3     | ********\_\_******** | ****\_\_**** | ****\_\_**** |
| 4     | ********\_\_******** | ****\_\_**** | ****\_\_**** |

---

This is to certify that the above students of Bachelor of Science (BS) in Computer Science / Software Engineering have been completed the above mentioned tasks of Final Year Project (FYP-II) in accordance with the rules and regulations of the department and the university.

**Supervisor's Signature:** ************\_\_************

**Name:** ************\_\_************

**Designation:** ************\_\_************

**Date:** ************\_\_************

---

**Head of Department (HoD):** ************\_\_************

**Signature:** ************\_\_************

**Date:** ************\_\_************

**Official Stamp:** (Department / University Seal)
