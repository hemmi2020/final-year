const { getRedisClient } = require('../config/redis');
const { convertCurrency, getExchangeRate } = require('./external/currencyService');
const { getCurrentWeather } = require('./external/weatherService');

const DEFAULT_PREFERENCES = {
    dietary: [],
    budget: 'moderate',
    preferredCurrency: 'USD',
    temperatureUnit: 'metric',
    interests: [],
    travelStyle: 'solo',
    cuisines: [],
    pace: 'moderate',
};

/**
 * Get merged preferences (user stored + request overrides)
 */
exports.getPreferences = (user, requestOverrides = {}) => {
    const stored = user?.preferences || {};
    return {
        dietary: requestOverrides.dietary || stored.dietary || DEFAULT_PREFERENCES.dietary,
        budget: requestOverrides.budget || stored.budget || DEFAULT_PREFERENCES.budget,
        preferredCurrency: requestOverrides.preferredCurrency || stored.preferredCurrency || DEFAULT_PREFERENCES.preferredCurrency,
        temperatureUnit: requestOverrides.temperatureUnit || stored.temperatureUnit || DEFAULT_PREFERENCES.temperatureUnit,
        interests: requestOverrides.interests || stored.interests || DEFAULT_PREFERENCES.interests,
        travelStyle: requestOverrides.travelStyle || stored.travelStyle || DEFAULT_PREFERENCES.travelStyle,
        cuisines: requestOverrides.cuisines || stored.cuisines || DEFAULT_PREFERENCES.cuisines,
        pace: requestOverrides.pace || stored.pace || DEFAULT_PREFERENCES.pace,
    };
};

/**
 * Build search tags from preferences (for Graph RAG)
 */
exports.buildSearchTags = (preferences) => {
    const tags = [...(preferences.dietary || []), ...(preferences.interests || [])];
    if (preferences.budget) tags.push(preferences.budget);
    if (preferences.travelStyle === 'family') tags.push('family-friendly');
    return [...new Set(tags)];
};

/**
 * Get weather with user's preferred temperature unit
 */
exports.getWeatherWithPreferences = async (lat, lng, userPrefs) => {
    const units = userPrefs?.temperatureUnit === 'imperial' ? 'imperial' : 'metric';
    return getCurrentWeather(lat, lng, units);
};

/**
 * Convert amount to user's preferred currency
 */
exports.convertToUserCurrency = async (amount, fromCurrency, userPrefs) => {
    const toCurrency = userPrefs?.preferredCurrency || 'USD';
    if (fromCurrency === toCurrency) return { amount, currency: toCurrency, rate: 1 };
    const result = await convertCurrency(fromCurrency, toCurrency, amount);
    return result || { amount, currency: fromCurrency, rate: null };
};

/**
 * Cache OpenAI response in Redis (24h TTL)
 */
exports.cacheAIResponse = async (key, data) => {
    try {
        const redis = getRedisClient();
        if (!redis) return;
        await redis.set(`ai:${key}`, JSON.stringify(data), 'EX', 86400);
    } catch (error) {
        console.warn('Cache set error:', error.message);
    }
};

/**
 * Get cached OpenAI response from Redis
 */
exports.getCachedAIResponse = async (key) => {
    try {
        const redis = getRedisClient();
        if (!redis) return null;
        const cached = await redis.get(`ai:${key}`);
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.warn('Cache get error:', error.message);
        return null;
    }
};

/**
 * Generate cache key from itinerary params
 */
exports.generateCacheKey = (destination, days, preferences) => {
    const parts = [destination, days, preferences.budget, preferences.dietary?.join(','), preferences.travelStyle];
    return parts.filter(Boolean).join(':').toLowerCase().replace(/\s+/g, '-');
};

exports.DEFAULT_PREFERENCES = DEFAULT_PREFERENCES;
