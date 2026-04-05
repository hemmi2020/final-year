const OpenAI = require('openai');
const { graphRAGSearch, getPersonalizedRecommendations } = require('../graph/graphService');
const { semanticSearch } = require('../vector/vectorService');
const { getConversation, addMessage, trackInteraction, getLongTermMemory, saveTripToMemory, addInsight } = require('../memory/memoryService');
const { getCurrentWeather } = require('../external/weatherService');
const { getExchangeRate } = require('../external/currencyService');
const { geocode } = require('../external/mapsService');
const { getPreferences, buildSearchTags, cacheAIResponse, getCachedAIResponse, generateCacheKey } = require('../preferenceEngine');
const { itineraryPrompt, chatPrompt } = require('./prompts');

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

    // Step 6: Get conversation history (if user is authenticated)
    let conversationHistory = [];
    if (user) {
        conversationHistory = await getConversation(user._id.toString());
    }

    // Step 7: Build prompt with ALL context and call LLM
    const prompt = itineraryPrompt({
        destination, days, preferences,
        graphResults, weather, currencyRate, vectorResults, conversationHistory,
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
 * AI Chat — conversational with memory
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

    const messages = [
        { role: 'system', content: chatPrompt(message, contextParts.join('\n\n')) },
        { role: 'user', content: message },
    ];

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1500,
    });

    const reply = response.choices[0].message.content;

    // Save to memory
    if (user) {
        await addMessage(user._id.toString(), 'user', message);
        await addMessage(user._id.toString(), 'assistant', reply);
    }

    return { message: reply };
};
