const router = require('express').Router();
const { register, login, logout, refresh, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules, handleValidation } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Express 5 requires spreading arrays of middleware
router.post('/register', authLimiter, ...registerRules, handleValidation, register);
router.post('/login', authLimiter, ...loginRules, handleValidation, login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.get('/profile', protect, getProfile);

module.exports = router;
