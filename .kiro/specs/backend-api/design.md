# Technical Design

## Architecture Overview

The backend follows a layered architecture: Routes → Controllers → Services → Data Layer (MongoDB + Neo4j + Pinecone + Redis). An AI Agent layer (LangGraph) orchestrates multiple services to produce context-aware responses. Socket.io runs on the same HTTP server for real-time features.

```
Client (Next.js Frontend)
    │
    ▼
Express Server (port 5000)
    ├── Middleware (CORS, Auth, Rate Limit, Validation)
    ├── Routes → Controllers
    │     ├── /api/auth     → authController
    │     ├── /api/users    → userController
    │     ├── /api/trips    → tripController
    │     ├── /api/chat     → chatController
    │     ├── /api/locations→ locationController
    │     ├── /api/groups   → groupController
    │     ├── /api/external → externalController
    │     └── /api/admin    → adminController
    │
    ├── Services Layer
    │     ├── AI Agent (LangGraph orchestrator)
    │     │     ├── Tool: graphSearch (Neo4j)
    │     │     ├── Tool: vectorSearch (Pinecone)
    │     │     ├── Tool: getWeather (OpenWeatherMap)
    │     │     ├── Tool: searchPlaces (Google Maps)
    │     │     ├── Tool: convertCurrency (ExchangeRate)
    │     │     └── Tool: getUserMemory (Redis)
    │     ├── Graph Service (Neo4j)
    │     ├── Vector Service (Pinecone)
    │     ├── Memory Service (Redis)
    │     ├── Preference Engine
    │     └── External API Services (Maps, Weather, Currency)
    │
    ├── Data Layer
    │     ├── MongoDB (Mongoose models)
    │     ├── Neo4j (Knowledge Graph)
    │     ├── Pinecone (Vector embeddings)
    │     └── Redis (Session memory)
    │
    └── Socket.io Server
          ├── location:update
          ├── message:send
          └── group:join/leave
```

## Project Structure

```
backend/
├── server.js                    # Entry point
├── .env.example                 # Environment template
├── package.json
├── config/
│   ├── db.js                    # MongoDB connection
│   ├── neo4j.js                 # Neo4j connection
│   ├── pinecone.js              # Pinecone connection
│   └── redis.js                 # Redis connection
├── models/
│   ├── User.js
│   ├── Trip.js
│   ├── Location.js
│   ├── Group.js
│   └── Review.js
├── middleware/
│   ├── auth.js                  # JWT verification
│   ├── admin.js                 # Admin role check
│   ├── validate.js              # Input validation
│   ├── rateLimiter.js           # Rate limiting
│   └── errorHandler.js          # Global error handler
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── tripController.js
│   ├── chatController.js
│   ├── locationController.js
│   ├── groupController.js
│   ├── externalController.js
│   └── adminController.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── trips.js
│   ├── chat.js
│   ├── locations.js
│   ├── groups.js
│   ├── external.js
│   └── admin.js
├── services/
│   ├── ai/
│   │   ├── agent.js             # LangGraph AI agent
│   │   ├── tools.js             # Agent tools (graph, vector, weather, etc.)
│   │   └── prompts.js           # Prompt templates
│   ├── graph/
│   │   ├── graphService.js      # Neo4j queries
│   │   └── seed.js              # Seed knowledge graph data
│   ├── vector/
│   │   └── vectorService.js     # Pinecone operations
│   ├── memory/
│   │   └── memoryService.js     # Redis conversation memory
│   ├── external/
│   │   ├── mapsService.js       # Google Maps/Places
│   │   ├── weatherService.js    # OpenWeatherMap
│   │   └── currencyService.js   # ExchangeRate-API
│   └── preferenceEngine.js      # User preference injection
└── sockets/
    └── index.js                 # Socket.io setup
```

## Data Models

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique, indexed),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  avatar: String,
  preferences: {
    dietary: [String],           // ['halal', 'vegan', 'vegetarian']
    budget: String,              // 'budget', 'moderate', 'luxury'
    preferredCurrency: String,   // 'USD', 'EUR', 'PKR', default 'USD'
    temperatureUnit: String,     // 'metric', 'imperial', default 'metric'
    interests: [String],         // ['history', 'food', 'adventure']
    travelStyle: String          // 'solo', 'family', 'couple', 'group'
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Trip Model

```javascript
{
  user: ObjectId (ref: User, indexed),
  title: String (required),
  destination: String (required),
  startDate: Date,
  endDate: Date,
  itinerary: [{
    day: Number,
    date: Date,
    weather: { temp: Number, description: String, icon: String },
    activities: [{
      time: String,
      name: String,
      description: String,
      location: { lat: Number, lng: Number },
      type: String,
      cost: { amount: Number, currency: String },
      tags: [String]
    }]
  }],
  budget: { total: Number, currency: String },
  status: String (enum: ['draft', 'planned', 'active', 'completed']),
  aiGenerated: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Neo4j Knowledge Graph Schema

```
(:Destination {name, country, lat, lng})
(:Restaurant {name, lat, lng, priceLevel, rating})
(:Attraction {name, lat, lng, type, rating})
(:Tag {name})  // halal, family-friendly, unesco, budget, luxury

Relationships:
(Destination)-[:HAS_RESTAURANT]->(Restaurant)
(Destination)-[:HAS_ATTRACTION]->(Attraction)
(Restaurant)-[:HAS_TAG]->(Tag)
(Attraction)-[:HAS_TAG]->(Tag)
(Restaurant)-[:NEAR {distance}]->(Attraction)
```

## AI Agent Pipeline (LangGraph)

```
User Request
    │
    ▼
┌─────────────────────┐
│  Load User Prefs    │ ← MongoDB User.preferences + Redis memory
│  + Memory Context   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Graph RAG Search   │ ← Neo4j: "halal restaurants NEAR family attractions in Tokyo"
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Vector Search      │ ← Pinecone: semantic similarity for travel content
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Real-time Data     │ ← Weather API + Currency API + Maps API
│  (preference-aware) │    (filtered by user dietary, budget, currency, temp unit)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  LLM Generation     │ ← GPT-4o-mini combines ALL context into personalized itinerary
│  (OpenAI)           │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Save to Memory     │ ← Redis: store conversation for continuity
│  + Return Response  │
└─────────────────────┘
```

## Authentication Flow

```
Register: POST /api/auth/register
  → Validate input → Hash password → Create User → Generate JWT → Return {user, token}

Login: POST /api/auth/login
  → Validate input → Find user → Compare hash → Generate JWT → Return {user, token}

Protected Route:
  → Auth middleware extracts Bearer token → Verify JWT → Attach user to req → Next

Admin Route:
  → Auth middleware → Admin middleware checks role === 'admin' → Next
```

## API Response Format

```javascript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: "Error message" }

// Paginated
{ success: true, data: [...], pagination: { page, limit, total, pages } }
```

## Environment Variables

```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=
JWT_REFRESH_SECRET=
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=
OPENWEATHER_API_KEY=
EXCHANGE_RATE_API_KEY=
FRONTEND_URL=http://localhost:3000
NEO4J_URI=neo4j+s://...
NEO4J_USER=neo4j
NEO4J_PASSWORD=
PINECONE_API_KEY=
REDIS_URL=redis://...
```
