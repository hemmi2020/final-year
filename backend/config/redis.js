const Redis = require('ioredis');

let redisClient = null;

const connectRedis = async () => {
    try {
        if (!process.env.REDIS_URL) {
            console.warn('⚠️  Redis URL not set — Memory Service disabled');
            return null;
        }
        redisClient = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 200, 2000),
        });

        return new Promise((resolve) => {
            redisClient.on('connect', () => {
                console.log('✅ Redis connected');
                resolve(redisClient);
            });
            redisClient.on('error', (err) => {
                console.warn(`⚠️  Redis error: ${err.message} — Memory Service disabled`);
                redisClient = null;
                resolve(null);
            });
        });
    } catch (error) {
        console.warn(`⚠️  Redis connection failed: ${error.message} — Memory Service disabled`);
        return null;
    }
};

const getRedisClient = () => redisClient;

const closeRedis = async () => {
    if (redisClient) await redisClient.quit();
};

module.exports = { connectRedis, getRedisClient, closeRedis };
