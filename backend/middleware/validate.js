const { body, validationResult } = require('express-validator');

/**
 * Check validation results and return errors if any
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('[validation] Failed:', req.path, JSON.stringify(req.body), errors.array().map(e => e.msg));
        return res.status(400).json({ success: false, errors: errors.array().map(e => e.msg) });
    }
    next();
};

const registerRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

const tripRules = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('destination').trim().notEmpty().withMessage('Destination is required'),
];

const generateRules = [
    body('destination').trim().notEmpty().withMessage('Destination is required'),
    body('days').optional().isInt({ min: 1, max: 30 }).withMessage('Days must be between 1 and 30'),
];

const preferencesRules = [
    body('dietary').optional().isArray().withMessage('Dietary must be an array'),
    body('budget').optional().isIn(['budget', 'moderate', 'luxury']).withMessage('Invalid budget level'),
    body('preferredCurrency').optional().isString().withMessage('Currency must be a string'),
    body('temperatureUnit').optional().isIn(['metric', 'imperial']).withMessage('Invalid temperature unit'),
    body('interests').optional().isArray().withMessage('Interests must be an array'),
    body('travelStyle').optional().isIn(['solo', 'family', 'couple', 'group']).withMessage('Invalid travel style'),
];

module.exports = {
    handleValidation,
    registerRules,
    loginRules,
    tripRules,
    generateRules,
    preferencesRules,
};
