/**
 * 404 handler for unknown routes
 */
const notFound = (req, res, next) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.originalUrl}` });
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
    // Only log unexpected errors (not validation/cast/auth)
    if (!['ValidationError', 'CastError', 'JsonWebTokenError', 'TokenExpiredError'].includes(err.name) && err.code !== 11000) {
        console.error('❌ Error:', err.stack);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, errors: messages });
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, error: `Invalid ${err.path}: ${err.value}` });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({ success: false, error: `${field} already exists` });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired' });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
};

module.exports = { notFound, errorHandler };
