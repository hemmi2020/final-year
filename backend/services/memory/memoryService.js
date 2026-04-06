const { getRedisClient } = require('../../config/redis');
const UserMemory = require('../../models/UserMemory');

const CONVERSATION_TTL = 86400; // 24 hours
const MAX_MESSAGES = 20;

/**
 * Get conversation history for a user (Redis short-term)
 */
exports.getConversation = async (userId) => {
    try {
        const redis = getRedisClient();
        if (!redis) return [];
        const data = await redis.get(`chat:${userId}`);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Memory get error:', error.message);
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
        // Keep last N messages
        const trimmed = conversation.slice(-MAX_MESSAGES);
        await redis.set(`chat:${userId}`, JSON.stringify(trimmed), 'EX', CONVERSATION_TTL);
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Memory add error:', error.message);
    }
};

/**
 * Clear conversation history
 */
exports.clearConversation = async (userId) => {
    try {
        const redis = getRedisClient();
        if (!redis) return;
        await redis.del(`chat:${userId}`);
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Memory clear error:', error.message);
    }
};

/**
 * Store user interaction pattern (Redis short-term)
 */
exports.trackInteraction = async (userId, type, value) => {
    try {
        const redis = getRedisClient();
        if (redis) {
            await redis.zincrby(`interactions:${userId}:${type}`, 1, value);
            await redis.expire(`interactions:${userId}:${type}`, CONVERSATION_TTL * 30);
        }
        // Also persist to MongoDB for long-term memory
        await UserMemory.findOneAndUpdate(
            { userId },
            {
                $push: {
                    interactions: {
                        entityType: type,
                        entityName: value,
                        interaction: 'searched',
                        timestamp: new Date(),
                    },
                },
            },
            { upsert: true }
        );
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Track interaction error:', error.message);
    }
};

/**
 * Get user interaction patterns (Redis)
 */
exports.getPatterns = async (userId, limit = 10) => {
    try {
        const redis = getRedisClient();
        if (!redis) return [];
        const destinations = await redis.zrevrange(`interactions:${userId}:destination`, 0, limit - 1, 'WITHSCORES');
        const result = [];
        for (let i = 0; i < destinations.length; i += 2) {
            result.push({ value: destinations[i], count: parseInt(destinations[i + 1]) });
        }
        return result;
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Get patterns error:', error.message);
        return [];
    }
};

/**
 * Save trip to long-term memory (MongoDB)
 */
exports.saveTripToMemory = async (userId, destination, satisfaction, notes) => {
    try {
        await UserMemory.findOneAndUpdate(
            { userId },
            {
                $push: {
                    tripHistory: { destination, satisfaction, notes, date: new Date() },
                },
            },
            { upsert: true }
        );
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Save trip memory error:', error.message);
    }
};

/**
 * Add insight from conversation analysis
 */
exports.addInsight = async (userId, insight, confidence, source) => {
    try {
        await UserMemory.findOneAndUpdate(
            { userId },
            {
                $push: {
                    insights: { insight, confidence, source, timestamp: new Date() },
                },
            },
            { upsert: true }
        );
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Add insight error:', error.message);
    }
};

/**
 * Get long-term memory (MongoDB)
 */
exports.getLongTermMemory = async (userId) => {
    try {
        const memory = await UserMemory.findOne({ userId });
        return memory || null;
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Get long-term memory error:', error.message);
        return null;
    }
};

/**
 * Update learned preferences based on behavior
 */
exports.updateLearnedPreferences = async (userId, preferences) => {
    try {
        await UserMemory.findOneAndUpdate(
            { userId },
            { $set: { learnedPreferences: preferences } },
            { upsert: true }
        );
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Update learned prefs error:', error.message);
    }
};
