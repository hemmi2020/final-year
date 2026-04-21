const OpenAI = require('openai');
const { graphRAGSearch, getPersonalizedRecommendations } = require('../graph/graphService');
const { semanticSearch } = require('../vector/vectorService');
const { getConversation, addMessage, trackInteraction, getLongTermMemory, saveTripToMemory, addInsight } = require('../memory/memoryService');
const { getCurrentWeather } = require('../external/weatherService');
const { getExchangeRate } = require('../external/currencyService');
const { geocode } = require('../external/mapsService');
const { getPreferences, buildSearchTags, cacheAIResponse, getCachedAIResponse, generateCacheKey } = require('../preferenceEngine');
const { itineraryPrompt, chatPrompt } = require('./prompts');
const { searchNearbyPlaces } = require('./tools');

// Destination images — real Unsplash photo URLs (source.unsplash.com is deprecated)
const DESTINATION_IMAGES = {
    istanbul: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80&fit=crop',
    paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&fit=crop',
    dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80&fit=crop',
    tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80&fit=crop',
    london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80&fit=crop',
    bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80&fit=crop',
    rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80&fit=crop',
    barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80&fit=crop',
    'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80&fit=crop',
    bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80&fit=crop',
    maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80&fit=crop',
    singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80&fit=crop',
    lahore: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80&fit=crop',
    karachi: 'https://images.unsplash.com/photo-1572688824905-5b0e8c13e8d0?w=800&q=80&fit=crop',
    islamabad: 'https://images.unsplash.com/photo-1603912699214-92627f304eb6?w=800&q=80&fit=crop',
    marrakech: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80&fit=crop',
    cairo: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80&fit=crop',
    athens: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80&fit=crop',
    amsterdam: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80&fit=crop',
    sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80&fit=crop',
    'kuala lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80&fit=crop',
    seoul: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80&fit=crop',
    petra: 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=800&q=80&fit=crop',
    santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80&fit=crop',
    prague: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80&fit=crop',
    vienna: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80&fit=crop',
    lisbon: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80&fit=crop',
};
const DEFAULT_TRAVEL_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80&fit=crop';
const DEFAULT_HOTEL_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80&fit=crop';

function getDestinationImage(destination, type = 'city') {
    if (!destination) return type === 'hotel' ? DEFAULT_HOTEL_IMAGE : DEFAULT_TRAVEL_IMAGE;
    const key = destination.toLowerCase().trim();
    const img = DESTINATION_IMAGES[key];
    if (img) return img;
    // Try partial match
    for (const [k, v] of Object.entries(DESTINATION_IMAGES)) {
        if (key.includes(k) || k.includes(key)) return v;
    }
    return type === 'hotel' ? DEFAULT_HOTEL_IMAGE : DEFAULT_TRAVEL_IMAGE;
}

let openai = null;
const getOpenAI = () => {
    if (!openai && process.env.OPENAI_API_KEY) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
};

/**
 * Full AI Agent pipeline for itinerary generation
 * Orchestrates: Preferences → Graph → Vector → Weather → Currency → LLM
 */
exports.generateItinerary = async (user, params) => {
    const { destination, days, budget, interests, dietary, origin: paramOrigin, travelCompanion, vibe, dates } = params;
    const client = getOpenAI();
    if (!client) throw new Error('OpenAI API key not configured');

    // Step 1: Load preferences (merge stored + request overrides)
    const preferences = getPreferences(user, { budget, interests, dietary });
    const searchTags = buildSearchTags(preferences);

    // Step 1b: Check Redis cache for similar itinerary
    const cacheKey = generateCacheKey(destination, days, preferences);
    const cached = await getCachedAIResponse(cacheKey);
    if (cached) {
        console.log('Cache hit for itinerary:', cacheKey);
        return cached;
    }

    // Step 2: Query Knowledge Graph
    const graphResults = await graphRAGSearch(destination, searchTags);

    // Step 2b: Get personalized recommendations from graph
    let personalizedRecs = [];
    if (user) {
        personalizedRecs = await getPersonalizedRecommendations(user._id.toString(), preferences, destination);
    }

    // Step 2c: Load long-term memory
    let longTermMemory = null;
    if (user) {
        longTermMemory = await getLongTermMemory(user._id.toString());
    }

    // Step 3: Semantic search in Vector Store
    const vectorResults = await semanticSearch(
        `${destination} ${preferences.interests.join(' ')} ${preferences.dietary.join(' ')}`,
        5,
        {}
    );

    // Step 4: Get real-time weather (geocode destination first)
    const geo = await geocode(destination);
    const weather = geo
        ? await getCurrentWeather(geo.lat, geo.lng, preferences.temperatureUnit)
        : null;

    // Step 5: Get currency rate
    let currencyRate = null;
    if (preferences.preferredCurrency !== 'USD') {
        currencyRate = await getExchangeRate('USD', preferences.preferredCurrency);
    }

    // Step 5b: Get real flight and hotel data from RapidAPI
    const { searchFlights } = require('../external/flightService');
    const { searchHotels } = require('../external/hotelService');

    let flightData = [];
    let hotelData = [];
    try {
        // Use origin from Trip_State params, falling back to user preferences or default
        const userCity = paramOrigin || user?.preferences?.homeCity || 'Karachi';
        const departDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        const returnDate = new Date(Date.now() + (7 + days) * 86400000).toISOString().split('T')[0];

        [flightData, hotelData] = await Promise.allSettled([
            searchFlights(userCity, destination, departDate, { currency: preferences.preferredCurrency }),
            searchHotels(destination, departDate, returnDate, { currency: preferences.preferredCurrency }),
        ]).then(results => [
            results[0].status === 'fulfilled' ? results[0].value : [],
            results[1].status === 'fulfilled' ? results[1].value : [],
        ]);
    } catch (e) { console.log('Flight/hotel fetch failed:', e.message); }

    // Step 6: Get conversation history (if user is authenticated)
    let conversationHistory = [];
    if (user) {
        conversationHistory = await getConversation(user._id.toString());
    }

    // Step 7: Build prompt with ALL context and call LLM
    const origin = paramOrigin || user?.preferences?.homeCity || 'Karachi';
    const prompt = itineraryPrompt({
        destination, days, preferences,
        graphResults, weather, currencyRate, vectorResults, conversationHistory,
        flightData, hotelData, origin, travelCompanion, vibe,
    });

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'You are an expert travel planner. Always respond with valid JSON.' },
            { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
    });

    const itinerary = JSON.parse(response.choices[0].message.content);

    // Build flight and returnFlight from real flight data or AI-generated data
    const firstFlight = flightData && flightData.length > 0 ? flightData[0] : null;
    const flight = itinerary.flight || (firstFlight ? {
        airline: firstFlight.airline,
        from: firstFlight.originCode || origin,
        to: firstFlight.destinationCode || destination,
        departure: firstFlight.departure,
        arrival: firstFlight.arrival,
        price: firstFlight.price,
        duration: firstFlight.duration,
        stops: firstFlight.stops,
        airlineLogo: firstFlight.airlineLogo || '',
    } : null);

    const returnFlight = itinerary.returnFlight || (firstFlight ? {
        airline: firstFlight.airline,
        from: firstFlight.destinationCode || destination,
        to: firstFlight.originCode || origin,
        departure: firstFlight.departure,
        arrival: firstFlight.arrival,
        price: firstFlight.price,
        duration: firstFlight.duration,
        stops: firstFlight.stops,
        airlineLogo: firstFlight.airlineLogo || '',
    } : null);

    // Build heroImage — use Unsplash source API for destination-specific photo
    const heroImage = itinerary.heroImage && !itinerary.heroImage.includes('placeholder')
        ? itinerary.heroImage
        : getDestinationImage(destination);

    // Also add destination-specific hotel image if missing
    const hotel = itinerary.hotel || null;
    if (hotel && !hotel.image) {
        hotel.image = getDestinationImage(destination, 'hotel');
    }

    // Cache the result for 24 hours
    await cacheAIResponse(cacheKey, {
        ...itinerary,
        flight,
        returnFlight,
        hotel: hotel || itinerary.hotel,
        heroImage,
        aiGenerated: true,
        metadata: {
            graphResultsUsed: graphResults.restaurants.length + graphResults.attractions.length,
            vectorResultsUsed: vectorResults.length,
            weatherAvailable: !!weather,
            currencyConverted: !!currencyRate,
            cached: false,
        },
    });

    // Step 8: Save to memory and track interaction
    if (user) {
        await addMessage(user._id.toString(), 'user', `Generate ${days}-day trip to ${destination}`);
        await addMessage(user._id.toString(), 'assistant', `Generated itinerary for ${destination}`);
        await trackInteraction(user._id.toString(), 'destination', destination);
        await saveTripToMemory(user._id.toString(), destination, 0, `${days}-day trip generated`);
        await addInsight(user._id.toString(), `User interested in ${destination} with ${preferences.dietary.join(', ')} food`, 0.8, 'itinerary_generation');
    }

    return {
        ...itinerary,
        flight,
        returnFlight,
        hotel: hotel || itinerary.hotel,
        heroImage,
        aiGenerated: true,
        metadata: {
            graphResultsUsed: graphResults.restaurants.length + graphResults.attractions.length,
            vectorResultsUsed: vectorResults.length,
            weatherAvailable: !!weather,
            currencyConverted: !!currencyRate,
        },
    };
};

/**
 * AI Chat — conversational with memory + function calling for restaurant search
 */
exports.chat = async (user, message, tripState) => {
    const client = getOpenAI();
    if (!client) throw new Error('OpenAI API key not configured');

    // Build context from memory
    let contextParts = [];
    if (user) {
        const history = await getConversation(user._id.toString());
        if (history.length > 0) {
            contextParts.push('Recent conversation:\n' + history.map(m => `${m.role}: ${m.content}`).join('\n'));
        }
        const prefs = getPreferences(user);
        contextParts.push(`User preferences: dietary=${prefs.dietary.join(',')}, budget=${prefs.budget}, style=${prefs.travelStyle}`);
    }

    const tools = [{
        type: "function",
        function: {
            name: "searchNearbyPlaces",
            description: "Search for restaurants, cafes, hotels, and other places near a travel destination. Use this when the user asks about food, restaurants, halal food, cafes, or places to eat/stay near a destination.",
            parameters: {
                type: "object",
                properties: {
                    destination: { type: "string", description: "Place name or city to search near" },
                    type: { type: "string", enum: ["restaurant", "cafe", "hotel", "museum", "attraction", "park"], description: "Type of place to search for" },
                    dietary: { type: "array", items: { type: "string" }, description: "Dietary preferences like halal, vegan, vegetarian" }
                },
                required: ["destination"]
            }
        }
    }];

    let messages = [
        { role: 'system', content: chatPrompt(message, contextParts.join('\n\n'), tripState) },
        { role: 'user', content: message },
    ];

    let response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools,
        max_tokens: 1500,
    });

    let assistantMsg = response.choices[0].message;

    // Handle tool calls (function calling loop)
    if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
        messages.push(assistantMsg);

        for (const toolCall of assistantMsg.tool_calls) {
            if (toolCall.function.name === 'searchNearbyPlaces') {
                try {
                    const args = JSON.parse(toolCall.function.arguments);
                    const places = await searchNearbyPlaces(
                        args.destination,
                        args.type || 'restaurant',
                        args.dietary || []
                    );
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(places.slice(0, 10)),
                    });
                } catch (err) {
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ error: 'Failed to search places' }),
                    });
                }
            }
        }

        // Second LLM call with tool results
        response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            max_tokens: 1500,
        });
        assistantMsg = response.choices[0].message;
    }

    const reply = assistantMsg.content;

    // Save to memory
    if (user) {
        await addMessage(user._id.toString(), 'user', message);
        await addMessage(user._id.toString(), 'assistant', reply);
    }

    return { message: reply };
};
