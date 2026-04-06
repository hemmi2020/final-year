const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const { register, login, logout, refresh, getProfile, verifyOTP, resendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules, handleValidation } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Email/password auth
router.post('/register', authLimiter, ...registerRules, handleValidation, register);
router.post('/verify', authLimiter, verifyOTP);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/login', authLimiter, ...loginRules, handleValidation, login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.get('/profile', protect, getProfile);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/login?error=google_failed' }),
    (req, res) => {
        // Generate JWT token for the Google user
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Redirect to frontend with token
        res.redirect(`${frontendURL}/auth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&id=${req.user._id}`);
    }
);

module.exports = router;
