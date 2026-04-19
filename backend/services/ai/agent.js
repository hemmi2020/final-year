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
    const { destination, days, budget, interests, dietary } = params;
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
        // Get user's home city from preferences or default
        const userCity = user?.preferences?.homeCity || 'Karachi';
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
    const prompt = itineraryPrompt({
        destination, days, preferences,
        graphResults, weather, currencyRate, vectorResults, conversationHistory,
        flightData, hotelData,
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

    // Cache the result for 24 hours
    await cacheAIResponse(cacheKey, {
        ...itinerary,
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
exports.chat = async (user, message) => {
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
        { role: 'system', content: chatPrompt(message, contextParts.join('\n\n')) },
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
