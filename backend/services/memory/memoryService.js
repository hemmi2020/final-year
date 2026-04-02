const { getRedisClient } = require('../../config/redis');

const CONVERSATION_TTL = 24 * 60 * 60; // 24 hours
const MAX_MESSAGES = 20;

/**
 * Get conversation history for a user
 */
exports.getConversation = async (userId) => {
    try {
        const redis = getRedisClient();
        if (!redis) return [];

        const data = await redis.get(`conv:${userId}`);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.warn('Memory get error:', error.message);
        return [];
    }
};

/**
 * Add a message to conversation history
 */
exports.addMessage = async (userId, role, content) => {
    try {
        const redis = getRedisClient();
        if (!redis) return;

        const conversation = await exports.getConversation(userId);
        conversation.push({ role, content, timestamp: Date.now() });

        // Keep only last N messages
        const trimmed = conversation.slice(-MAX_MESSAGES);
        await redis.set(`conv:${userId}`, JSON.stringify(trimmed), 'EX', CONVERSATION_TTL);
    } catch (error) {
        console.warn('Memory add error:', error.message);
    }
};

/**
 * Clear conversation history
 */
exports.clearConversation = async (userId) => {
    try {
        const redis = getRedisClient();
        if (!redis) return;
        await redis.del(`conv:${userId}`);
    } catch (error) {
        console.warn('Memory clear error:', error.message);
    }
};

/**
 * Store user interaction pattern (frequently searched destinations, etc.)
 */
exports.trackInteraction = async (userId, type, value) => {
    try {
        const redis = getRedisClient();
        if (!redis) return;
        await redis.zincrby(`patterns:${userId}`, 1, `${type}:${value}`);
        await redis.expire(`patterns:${userId}`, 30 * 24 * 60 * 60); // 30 days
    } catch (error) {
        console.warn('Memory track error:', error.message);
    }
};

/**
 * Get user interaction patterns
 */
exports.getPatterns = async (userId, limit = 10) => {
    try {
        const redis = getRedisClient();
        if (!redis) return [];
        return await redis.zrevrange(`patterns:${userId}`, 0, limit - 1, 'WITHSCORES');
    } catch (error) {
        console.warn('Memory patterns error:', error.message);
        return [];
    }
};
