# TravelAI — Complete Project Reference

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 14 — App Router)                         │
│  Port: 3000 | Deployed: Vercel/Netlify                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Pages    │ │Components│ │ Hooks    │ │ Stores   │       │
│  │ (app/)   │ │ (UI/Chat)│ │(location │ │(Zustand) │       │
│  │          │ │          │ │ weather) │ │          │       │
│  └────┬─────┘ └──────────┘ └────┬─────┘ └──────────┘       │
│       │                         │                           │
│       └─────── api.js (axios) ──┘                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (REST)
┌──────────────────────┴──────────────────────────────────────┐
│  BACKEND (Express.js + Socket.IO)                           │
│  Port: 5000 | Deployed: Render                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Routes   │ │Controllers│ │ Services │ │Middleware│       │
│  │ (9 files)│ │(9 files) │ │(AI/Graph │ │(auth,    │       │
│  │          │ │          │ │ Memory)  │ │ admin)   │       │
│  └──────────┘ └──────────┘ └────┬─────┘ └──────────┘       │
│                                 │                           │
│  ┌──────────┐ ┌──────────┐ ┌───┴──────┐ ┌──────────┐       │
│  │ MongoDB  │ │ Redis    │ │ Neo4j    │ │ Pinecone │       │
│  │ (Users,  │ │ (Chat    │ │(Knowledge│ │ (Vector  │       │
│  │  Trips)  │ │  Memory) │ │  Graph)  │ │  Search) │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer           | Technology                                                           |
| --------------- | -------------------------------------------------------------------- |
| Frontend        | Next.js 14 (App Router), React, Zustand, Axios                       |
| Backend         | Express.js, Socket.IO, Passport.js                                   |
| Database        | MongoDB (Mongoose)                                                   |
| Cache/Memory    | Redis (ioredis)                                                      |
| Knowledge Graph | Neo4j                                                                |
| Vector Store    | Pinecone + OpenAI Embeddings                                         |
| AI              | OpenAI GPT-4o-mini                                                   |
| Email           | Brevo (Sendinblue) HTTP API                                          |
| External APIs   | Overpass (OSM), OpenWeatherMap, RapidAPI (Flights/Hotels), freeipapi |
| Auth            | JWT + Google OAuth (Passport)                                        |

---

## BACKEND

### Entry Point: `backend/server.js`

```
Express app → HTTP server → Socket.IO
Middleware: helmet, compression, morgan, cors, passport
Connects: MongoDB (required), Neo4j, Pinecone, Redis (optional/graceful)
```

### Database Models

#### User (`backend/models/User.js`)

```js
{
  name, email, password (hashed bcrypt),
  role: 'user' | 'admin',
  avatar, bio, phone,
  preferences: { dietary[], budget, preferredCurrency, temperatureUnit,
                 interests[], travelStyle, cuisines[], pace, favoriteDestinations[] },
  emailVerified, otp, otpExpires,
  resetPasswordToken, resetPasswordExpires,
  googleId, isActive, lastLogin
}
// Pre-save: hash password | Method: comparePassword()
```

#### Trip (`backend/models/Trip.js`)

```js
{
  user (ref User), title, destination,
  startDate, endDate,
  itinerary: [{ day, date, weather, activities: [{ time, name, description, location, type, cost, tags, period }] }],
  budget: { total, currency },
  status: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled',
  aiGenerated, preferences, weatherSnapshot, currencySnapshot,
  tags[], notes, isPublic,
  origin, travelCompanion, vibe[],
  flightData: { airline, from, to, departure, arrival, price, duration, stops, airlineLogo },
  returnFlightData: { ... same ... },
  hotelData: { name, stars, rating, pricePerNight, image, address, distance },
  heroImage, communityNote, isAnonymous
}
```

#### Group (`backend/models/Group.js`)

```js
{
  name, description, trip (ref Trip), creator (ref User),
  members: [{ user, role: 'creator'|'admin'|'member', status: 'pending'|'accepted'|'declined', joinedAt }],
  inviteCode (auto-generated hex)
}
```

#### Location (`backend/models/Location.js`)

```js
{
  user (ref User), name,
  coordinates: { lat, lng },
  type: 'restaurant'|'attraction'|'hotel'|'mosque'|...|'other',
  description, isUNESCO, address, rating, tags[]
}
```

#### Review (`backend/models/Review.js`)

```js
{ user (ref User), location (ref Location), rating (1-5), text }
// Unique index: location + user (one review per user per location)
```

#### UserMemory (`backend/models/UserMemory.js`)

```js
{
  userId (string, unique),
  learnedPreferences: { preferredBudget, commonDietary[], favoriteActivities[], ... },
  tripHistory: [{ destination, satisfaction, notes, date }],
  interactions: [{ entityType, entityId, entityName, interaction, rating, timestamp }],
  insights: [{ insight, confidence, source, timestamp }]
}
```

---

### API Routes

#### Auth Routes (`/api/auth`)

| Method | Path               | Auth           | Controller       | Description                               |
| ------ | ------------------ | -------------- | ---------------- | ----------------------------------------- |
| POST   | `/register`        | ❌ + rateLimit | `register`       | Register → sends OTP email                |
| POST   | `/verify`          | ❌ + rateLimit | `verifyOTP`      | Verify OTP → returns JWT                  |
| POST   | `/resend-otp`      | ❌ + rateLimit | `resendOTP`      | Resend verification code                  |
| POST   | `/login`           | ❌ + rateLimit | `login`          | Login → returns JWT                       |
| POST   | `/logout`          | ✅ protect     | `logout`         | Logout (stateless)                        |
| POST   | `/refresh`         | ❌             | `refresh`        | Refresh JWT token                         |
| GET    | `/profile`         | ✅ protect     | `getProfile`     | Get current user profile                  |
| POST   | `/forgot-password` | ❌ + rateLimit | `forgotPassword` | Send reset email                          |
| POST   | `/reset-password`  | ❌ + rateLimit | `resetPassword`  | Reset password with token                 |
| GET    | `/google`          | ❌             | Passport         | Start Google OAuth                        |
| GET    | `/google/callback` | ❌             | Passport         | Google OAuth callback → redirect with JWT |

```
PSEUDO: register(name, email, password)
  → check existing user
  → generate 6-digit OTP
  → create/update User (emailVerified=false)
  → send OTP via Brevo API
  → return { requiresVerification: true }

PSEUDO: login(email, password)
  → find user, compare password
  → if !emailVerified → resend OTP, return 403
  → generate JWT (7d expiry)
  → return { user, token }
```

#### User Routes (`/api/users`) — All require `protect`

| Method | Path               | Controller          | Description                            |
| ------ | ------------------ | ------------------- | -------------------------------------- |
| GET    | `/profile`         | `getProfile`        | Get full user profile                  |
| PUT    | `/profile`         | `updateProfile`     | Update name, avatar, bio, phone        |
| PUT    | `/preferences`     | `updatePreferences` | Update dietary, budget, currency, etc. |
| POST   | `/avatar`          | `uploadAvatar`      | Set avatar URL                         |
| PUT    | `/change-password` | `changePassword`    | Change password (requires current)     |

#### Trip Routes (`/api/trips`) — All require `protect`

| Method | Path        | Controller          | Description                                 |
| ------ | ----------- | ------------------- | ------------------------------------------- |
| GET    | `/`         | `getAll`            | List user's trips (sorted by newest)        |
| GET    | `/:id`      | `getById`           | Get single trip (owner only)                |
| POST   | `/`         | `create`            | Create trip manually                        |
| PUT    | `/:id`      | `update`            | Update trip                                 |
| DELETE | `/:id`      | `remove`            | Delete trip                                 |
| POST   | `/generate` | `generateItinerary` | AI-generate itinerary (rate limited: 1/10s) |

```
PSEUDO: generateItinerary(destination, duration, budget, vibe, ...)
  → rate limit check (1 per 10s per user)
  → parse duration string → numDays
  → call AI agent pipeline (see AI Agent section)
  → auto-save as Trip (status: draft)
  → return { trip, itinerary }
```

#### Chat Routes (`/api/chat`)

| Method | Path | Auth         | Controller    | Description                     |
| ------ | ---- | ------------ | ------------- | ------------------------------- |
| POST   | `/`  | optionalAuth | `sendMessage` | Send message to AI chat         |
| DELETE | `/`  | ✅ protect   | `clearChat`   | Clear Redis conversation memory |

```
PSEUDO: sendMessage(message, tripState)
  → call AI chat() with user context
  → return { message: aiResponse }

PSEUDO: clearChat()
  → clearConversation(userId) from Redis
  → return { success: true }
```

#### Community Routes (`/api/community`)

| Method | Path                   | Auth         | Controller       | Description                                 |
| ------ | ---------------------- | ------------ | ---------------- | ------------------------------------------- |
| GET    | `/trips`               | optionalAuth | `getPublicTrips` | Browse public trips (paginated, searchable) |
| GET    | `/trips/:id`           | optionalAuth | `getPublicTrip`  | View single public trip                     |
| POST   | `/trips/:id/publish`   | ✅ protect   | `publishTrip`    | Make trip public                            |
| POST   | `/trips/:id/unpublish` | ✅ protect   | `unpublishTrip`  | Make trip private                           |
| POST   | `/trips/:id/clone`     | ✅ protect   | `cloneTrip`      | Clone public trip to own trips              |
| POST   | `/trips/:id/like`      | ✅ protect   | `likeTrip`       | Toggle like on public trip                  |

#### Group Routes (`/api/groups`) — All require `protect`

| Method | Path                | Controller     | Description                              |
| ------ | ------------------- | -------------- | ---------------------------------------- |
| GET    | `/`                 | `getAll`       | List user's groups                       |
| POST   | `/`                 | `create`       | Create group (auto-generates inviteCode) |
| GET    | `/:id`              | `getById`      | Get group details (members only)         |
| POST   | `/:id/invite`       | `invite`       | Invite user by email                     |
| POST   | `/join/:inviteCode` | `acceptInvite` | Join group via invite code               |

#### Location Routes (`/api/locations`) — All require `protect`

| Method | Path           | Controller     | Description                 |
| ------ | -------------- | -------------- | --------------------------- |
| GET    | `/`            | `getAll`       | List user's saved locations |
| POST   | `/`            | `create`       | Save a location             |
| DELETE | `/:id`         | `remove`       | Remove saved location       |
| POST   | `/:id/reviews` | `createReview` | Add review to location      |
| GET    | `/:id/reviews` | `getReviews`   | Get reviews for location    |

#### External API Routes (`/api/external`) — All use `optionalAuth`

| Method | Path                   | Controller           | Description                        |
| ------ | ---------------------- | -------------------- | ---------------------------------- |
| GET    | `/detect-location`     | `detectLocation`     | IP-based location detection        |
| GET    | `/nearby-all`          | `nearbyAll`          | All nearby categories via Overpass |
| GET    | `/nearby`              | `nearby`             | Single category nearby (legacy)    |
| GET    | `/weather`             | `weather`            | Current weather (OpenWeatherMap)   |
| GET    | `/forecast`            | `forecast`           | Weather forecast                   |
| GET    | `/places`              | `places`             | Search places (Google Maps)        |
| GET    | `/geocode`             | `geocodePlace`       | Geocode place name → lat/lng       |
| GET    | `/reverse-geocode`     | `reverseGeocode`     | lat/lng → place name               |
| GET    | `/currency`            | `currency`           | Currency conversion                |
| GET    | `/attractions`         | `attractions`        | Find attractions near coordinates  |
| GET    | `/flights`             | `flights`            | Search flights (RapidAPI)          |
| GET    | `/hotels`              | `hotels`             | Search hotels (RapidAPI)           |
| GET    | `/booking-attractions` | `bookingAttractions` | Booking.com attractions            |

```
PSEUDO: detectLocation()
  → get client IP from x-forwarded-for header
  → try freeipapi.com/api/json/{ip}
  → fallback: ip-api.com/json/{ip}
  → hard fallback: Karachi, PK
  → return { lat, lng, city, country, countryCode, currency, timezone }

PSEUDO: nearbyAll(lat, lng, radius, countryCode)
  → check in-memory cache (30min TTL)
  → Overpass servers: [overpass-api.de, overpass.private.coffee]
  → Batch 1: mosques + hospitals
  → wait 1.5s
  → Batch 2: ATMs + fuel + police + pharmacy + restaurants
  → categorize halal (Muslim countries → all restaurants)
  → parse elements → { name, lat, lng, distance, distanceText }
  → cache if ≥4 categories have data
  → return { mosques[], hospitals[], pharmacy[], police[], halal[], atms[], fuel[] }
```

#### Admin Routes (`/api/admin`) — All require `protect` + `admin`

| Method | Path         | Controller   | Description                            |
| ------ | ------------ | ------------ | -------------------------------------- |
| GET    | `/stats`     | `getStats`   | Dashboard stats (users, trips, groups) |
| GET    | `/users`     | `getUsers`   | List all users (paginated, searchable) |
| GET    | `/users/:id` | `getUser`    | Get single user                        |
| PUT    | `/users/:id` | `updateUser` | Update user (name, email, role)        |
| DELETE | `/users/:id` | `deleteUser` | Delete user + their trips              |
| GET    | `/trips`     | `getTrips`   | List all trips (paginated)             |

---

### Middleware

| File              | Export             | Description                                     |
| ----------------- | ------------------ | ----------------------------------------------- |
| `auth.js`         | `protect`          | Verify JWT → attach `req.user` (401 if invalid) |
| `auth.js`         | `optionalAuth`     | Attach user if token present, continue if not   |
| `admin.js`        | `admin`            | Check `req.user.role === 'admin'` (403 if not)  |
| `rateLimiter.js`  | `authLimiter`      | 10 req/15min for auth endpoints                 |
| `rateLimiter.js`  | `generalLimiter`   | 100 req/15min general                           |
| `validate.js`     | `handleValidation` | Check express-validator results                 |
| `validate.js`     | `registerRules`    | name, email, password(6+)                       |
| `validate.js`     | `loginRules`       | email, password                                 |
| `validate.js`     | `tripRules`        | title, destination                              |
| `validate.js`     | `generateRules`    | destination, days(1-30)                         |
| `validate.js`     | `preferencesRules` | dietary, budget, currency, etc.                 |
| `errorHandler.js` | `notFound`         | 404 handler                                     |
| `errorHandler.js` | `errorHandler`     | Global error handler (Mongoose, JWT, etc.)      |

---

### Services

#### AI Agent (`backend/services/ai/agent.js`)

```
PSEUDO: generateItinerary(user, params)
  1. Load preferences (merge user stored + request overrides)
  2. Check Redis cache (key: destination:days:budget:dietary:style)
  3. Query Neo4j Knowledge Graph (restaurants, attractions by tags)
  4. Get personalized recommendations from graph
  5. Load long-term memory (MongoDB UserMemory)
  6. Semantic search in Pinecone vector store
  7. Geocode destination → get weather
  8. Get currency exchange rate
  9. Search flights + hotels via RapidAPI
  10. Get conversation history from Redis
  11. Build prompt with ALL context → call GPT-4o-mini (JSON mode)
  12. Parse response, attach flight/hotel/heroImage data
  13. Cache result in Redis (24h TTL)
  14. Save to memory (conversation, interaction, trip, insight)
  → return itinerary object

PSEUDO: chat(user, message, tripState)
  1. Load conversation history from Redis
  2. Load user preferences
  3. Build system prompt with context
  4. Call GPT-4o-mini with function calling (searchNearbyPlaces tool)
  5. If tool called → execute → second LLM call with results
  6. Save messages to Redis memory
  → return { message: aiResponse }
```

#### Memory Service (`backend/services/memory/memoryService.js`)

```
Redis key: chat:{userId} → JSON array of messages (max 20, 24h TTL)

getConversation(userId) → message[]
addMessage(userId, role, content) → void
clearConversation(userId) → void (deletes Redis key)
trackInteraction(userId, type, value) → Redis sorted set + MongoDB
saveTripToMemory(userId, destination, satisfaction, notes) → MongoDB
addInsight(userId, insight, confidence, source) → MongoDB
getLongTermMemory(userId) → MongoDB UserMemory document
```

#### Preference Engine (`backend/services/preferenceEngine.js`)

```
getPreferences(user, overrides) → merged preferences object
buildSearchTags(preferences) → string[] for graph search
cacheAIResponse(key, data) → Redis set (24h TTL)
getCachedAIResponse(key) → cached data or null
generateCacheKey(destination, days, preferences) → string
```

#### Email Service (`backend/services/emailService.js`)

```
sendVerificationEmail(email, otp, name) → Brevo HTTP API
sendPasswordResetEmail(email, token, name) → Brevo HTTP API
generateOTP() → 6-digit string
```

#### External Services

| File                 | Functions                                                      | API Used                |
| -------------------- | -------------------------------------------------------------- | ----------------------- |
| `weatherService.js`  | `getCurrentWeather`, `getForecast`                             | OpenWeatherMap          |
| `currencyService.js` | `convertCurrency`, `getExchangeRate`                           | ExchangeRate API        |
| `mapsService.js`     | `geocode`, `reverseGeocode`, `searchPlaces`, `findAttractions` | Google Maps / Nominatim |
| `flightService.js`   | `searchFlights`                                                | RapidAPI Sky Scanner    |
| `hotelService.js`    | `searchHotels`, `searchAttractions`                            | RapidAPI Booking.com    |

#### Graph Service (`backend/services/graph/graphService.js`)

```
graphRAGSearch(destination, tags) → { restaurants[], attractions[] }
getPersonalizedRecommendations(userId, preferences, destination) → recommendations[]
```

#### Vector Service (`backend/services/vector/vectorService.js`)

```
semanticSearch(query, topK, filter) → results[] (Pinecone + OpenAI embeddings)
upsertContent(id, text, metadata) → boolean
```

---

### Socket.IO (`backend/sockets/index.js`)

```
Events:
  location:update → broadcast to trip room members
  group:join → join group chat room
  group:leave → leave group chat room
  message:send → broadcast to group room
  trip:join → join trip collaboration room
  trip:leave → leave trip room

Auth: Optional JWT via socket.handshake.auth.token
Rooms: user:{userId}, group:{groupId}, trip:{tripId}
```

### Config Files

| File          | Purpose                               |
| ------------- | ------------------------------------- |
| `db.js`       | MongoDB connection (mongoose.connect) |
| `redis.js`    | Redis connection (ioredis) with retry |
| `neo4j.js`    | Neo4j driver connection               |
| `pinecone.js` | Pinecone vector DB connection         |
| `passport.js` | Google OAuth strategy                 |

---

## FRONTEND

### Layout (`frontend/src/app/layout.jsx`)

```
RootLayout → html > body
  → ToastProvider
    → LoadingBar
    → SmoothScrollProvider
      → Navigation (top navbar)
      → {children} (page content)
      → Footer
      → ScrollToTop
```

### Pages (App Router)

| Route              | File                       | Auth     | Description                             |
| ------------------ | -------------------------- | -------- | --------------------------------------- |
| `/`                | `page.jsx`                 | ❌       | Landing page / hero                     |
| `/chat`            | `chat/page.jsx`            | ✅       | AI trip planner (main feature)          |
| `/planner`         | `planner/page.jsx`         | ❌       | Trip planner input → redirects to /chat |
| `/dashboard`       | `dashboard/page.jsx`       | ✅       | User dashboard (nearby, weather, trips) |
| `/trips`           | `trips/page.jsx`           | ✅       | List all user trips                     |
| `/trips/[id]`      | `trips/[id]/page.jsx`      | ✅       | Trip detail view                        |
| `/profile`         | `profile/page.jsx`         | ✅       | User profile                            |
| `/settings`        | `settings/page.jsx`        | ✅       | Account settings                        |
| `/community`       | `community/page.jsx`       | ❌       | Browse public trips                     |
| `/community/[id]`  | `community/[id]/page.jsx`  | ❌       | View public trip                        |
| `/destinations`    | `destinations/page.jsx`    | ❌       | Explore destinations                    |
| `/admin`           | `admin/page.jsx`           | ✅ admin | Admin dashboard                         |
| `/auth/callback`   | `auth/callback/page.jsx`   | ❌       | Google OAuth callback handler           |
| `/login`           | `login/`                   | ❌       | Login page                              |
| `/signup`          | `signup/`                  | ❌       | Signup page                             |
| `/forgot-password` | `forgot-password/page.jsx` | ❌       | Forgot password                         |
| `/reset-password`  | `reset-password/page.jsx`  | ❌       | Reset password (with token)             |
| `/about`           | `about/`                   | ❌       | About page                              |
| `/blog`            | `blog/page.jsx`            | ❌       | Blog                                    |
| `/careers`         | `careers/page.jsx`         | ❌       | Careers                                 |
| `/guides`          | `guides/page.jsx`          | ❌       | Travel guides                           |
| `/help`            | `help/page.jsx`            | ❌       | Help center                             |
| `/api-docs`        | `api-docs/page.jsx`        | ❌       | API documentation                       |
| `/privacy`         | `privacy/page.jsx`         | ❌       | Privacy policy                          |
| `/terms`           | `terms/page.jsx`           | ❌       | Terms of service                        |
| `/cookies`         | `cookies/page.jsx`         | ❌       | Cookie policy                           |
| `/quiz`            | `quiz/`                    | ❌       | Travel quiz                             |

### Frontend API Client (`frontend/src/lib/api.js`)

```js
// Base: axios with JWT auto-attach + 401 auto-logout

authAPI    → login, register, verify, resendOTP, logout, refreshToken, getProfile, forgotPassword, resetPassword
tripsAPI   → getAll, getById, create, update, delete, generate
chatAPI    → send(message, tripState), clear()
usersAPI   → getProfile, updateProfile, updatePreferences, uploadAvatar, changePassword
externalAPI → geocode, reverseGeocode, weather, forecast, places, attractions, currency, flights, hotels, bookingAttractions
groupsAPI  → getAll, getById, create, invite, join
locationsAPI → getAll, save, remove, addReview, getReviews
adminAPI   → getUsers, getUser, updateUser, deleteUser, getStats, getTrips
communityAPI → getTrips, getTrip, publish, unpublish, clone, like
shareAPI   → shareTrip(id)
```

### Stores (Zustand)

#### `authStore.js`

```js
{
  (user, token, isAuthenticated, hasHydrated);
}
(setUser(user, token), updateUser(data), logout(), isAdmin());
// Persisted to localStorage via zustand/persist
```

#### `tripStore.js`

```js
{ trips[], currentTrip, loading, error }
fetchTrips(), fetchTrip(id), createTrip(data), deleteTrip(id), generateItinerary(prefs)
```

#### `preferenceStore.js`

```js
{
  (destinationCurrency, tempUnit);
}
(setDestinationCurrency(c), setTempUnit(u));
// Persisted to localStorage
```

#### `destinationStore.js`

```js
{
  (city, country, currency);
}
(setDestination({ city, country, currency }), clearDestination());
```

### Hooks

#### `useLocation.js`

```
IP-based location detection (no GPS needed)
Flow: backend /detect-location → freeipapi.com → ipwhois.app → hard fallback (Karachi)
Returns: { lat, lng, city, country, countryCode, currency, flag, timezone, loading }
Caches at module level, clears on tab visibility change (VPN detection)
```

#### `useWeather.js`

```
Weather data for given coordinates/city
Flow: OpenWeatherMap (if API key) → wttr.in (free fallback)
Returns: { temp, feelsLike, humidity, windSpeed, condition, icon, loading }
Caches in localStorage (10min TTL)
```

#### `useCurrency.js`

```
Currency exchange rate
Flow: backend /currency → open.er-api.com (free fallback)
Returns: { rate, loading, error }
Caches in localStorage (1hr TTL)
```

#### `useTripState.js`

```
Trip planning state machine (sessionStorage-backed)
Fields: destination, origin, duration, travelCompanion, vibe, budget
Question sequence: destination → duration → companion → vibe → budget
Exports: useTripState(location), extractFields(text), getNextQuestionFromState(state)
extractFields: regex-based NLP for destination, duration, companion, vibe, budget
```

#### `useAuthGuard.js`

```
Redirects to /login if not authenticated
Returns: isAuthenticated boolean
```

#### `useMediaQuery.js`

```
Viewport breakpoint detection
Returns: { isMobile, isTablet, isDesktop }
```

#### `useScrollPosition.js`

```
Scroll Y position tracking (debounced 10ms)
Returns: number (scrollY)
```

---

## Key Data Flows

### 1. Trip Generation Flow

```
User fills 5 fields (destination, duration, companion, vibe, budget)
  → isComplete = true
  → triggerGenerationWithState(tripState)
  → POST /api/trips/generate
  → AI Agent Pipeline (10 steps)
  → Trip saved to MongoDB
  → Itinerary displayed in right panel
```

### 2. New Trip Reset Flow (Fixed)

```
User clicks "+ New Trip"
  → chatAPI.clear() (fire-and-forget → DELETE /api/chat → Redis cleared)
  → reset() (sessionStorage cleared, React state reset)
  → wasCompleteOnMount = true (blocks stale generation)
  → setTimeout 100ms → re-initialize greeting
  → wasCompleteOnMount = false
```

### 3. Location Detection Flow

```
Frontend useLocation hook
  → GET /api/external/detect-location
  → Backend reads x-forwarded-for IP
  → freeipapi.com → ip-api.com → hard fallback
  → Returns { lat, lng, city, country, countryCode, currency, timezone }
  → Dashboard uses this for nearby, weather, emergency contacts
```

### 4. Nearby Places Flow

```
Dashboard mounts → useLocation() gets coordinates
  → GET /api/external/nearby-all?lat=X&lng=Y&radius=5000&countryCode=XX
  → Backend queries Overpass API (2 batches with 1.5s gap)
  → Categorizes: mosques, hospitals, pharmacy, police, halal, atms, fuel
  → Parses elements → calculates distance → sorts by nearest → top 10 each
  → Caches in-memory (30min) + frontend localStorage (15min)
```

### 5. Auth Flow

```
Register → OTP email (Brevo) → Verify OTP → JWT token
Login → JWT token (7d expiry)
Google OAuth → Passport → redirect with JWT
All protected routes: Authorization: Bearer {token}
Frontend: Zustand authStore persists to localStorage
```
