const rateLimit = require('express-rate-limit');

// General API rate limit: 100 requests per 15 minutes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests — please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limit: 10 requests per 15 minutes (brute-force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, error: 'Too many auth attempts — please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };
