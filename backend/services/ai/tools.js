/**
 * AI Agent Tools — used by the LangGraph agent pipeline
 * Each tool wraps a service call for the AI orchestrator
 */

const { graphRAGSearch, findNearby } = require('../graph/graphService');
const { semanticSearch } = require('../vector/vectorService');
const { getCurrentWeather, getForecast } = require('../external/weatherService');
const { searchPlaces, geocode, findAttractions } = require('../external/mapsService');
const { convertCurrency, getExchangeRate } = require('../external/currencyService');
const { getConversation, getPatterns } = require('../memory/memoryService');

/**
 * Tool: Search Knowledge Graph for destinations, restaurants, attractions by tags
 */
exports.graphSearch = async (destination, tags) => {
    return graphRAGSearch(destination, tags);
};

/**
 * Tool: Semantic vector search for travel content
 */
exports.vectorSearch = async (query, topK = 5, filter = {}) => {
    return semanticSearch(query, topK, filter);
};

/**
 * Tool: Get current weather for a location
 */
exports.getWeather = async (destination, units = 'metric') => {
    const geo = await geocode(destination);
    if (!geo) return null;
    return getCurrentWeather(geo.lat, geo.lng, units);
};

/**
 * Tool: Get multi-day forecast
 */
exports.getWeatherForecast = async (destination, days = 7, units = 'metric') => {
    const geo = await geocode(destination);
    if (!geo) return null;
    return getForecast(geo.lat, geo.lng, days, units);
};

/**
 * Tool: Search places near a destination
 */
exports.searchNearbyPlaces = async (destination, type = 'restaurant', dietary = []) => {
    const geo = await geocode(destination);
    if (!geo) return [];
    return searchPlaces(destination, geo.lat, geo.lng, { type, dietary });
};

/**
 * Tool: Find attractions near a destination
 */
exports.findNearbyAttractions = async (destination) => {
    const geo = await geocode(destination);
    if (!geo) return [];
    return findAttractions(geo.lat, geo.lng);
};

/**
 * Tool: Convert currency
 */
exports.convertCurrency = async (from, to, amount = 1) => {
    return convertCurrency(from, to, amount);
};

/**
 * Tool: Get exchange rate
 */
exports.getRate = async (from, to) => {
    return getExchangeRate(from, to);
};

/**
 * Tool: Get user's conversation memory
 */
exports.getUserMemory = async (userId) => {
    if (!userId) return { history: [], patterns: [] };
    const history = await getConversation(userId);
    const patterns = await getPatterns(userId);
    return { history, patterns };
};

/**
 * Tool: Geocode a place name to coordinates
 */
exports.geocodePlace = async (placeName) => {
    return geocode(placeName);
};
