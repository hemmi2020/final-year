const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, generateOTP } = require('../services/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register — sends OTP email
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.emailVerified) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        let user;
        if (existingUser && !existingUser.emailVerified) {
            // Update existing unverified user
            existingUser.name = name;
            existingUser.password = password;
            existingUser.otp = otp;
            existingUser.otpExpires = otpExpires;
            await existingUser.save();
            user = existingUser;
        } else {
            user = await User.create({ name, email, password, otp, otpExpires });
        }

        // Send OTP email
        await sendVerificationEmail(email, otp, name);

        res.status(201).json({
            success: true,
            data: {
                message: 'Verification code sent to your email',
                userId: user._id,
                email: user.email,
                requiresVerification: true,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/verify — verify OTP and complete registration
exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, error: 'Email and OTP required' });

        const user = await User.findOne({ email }).select('+otp +otpExpires');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        if (user.emailVerified) {
            const token = generateToken(user._id);
            return res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token } });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ success: false, error: 'Invalid verification code' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, error: 'Verification code expired. Please register again.' });
        }

        // Verify user
        user.emailVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.isActive = true;
        await user.save();

        const token = generateToken(user._id);
        res.json({
            success: true,
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/resend-otp — resend verification code
exports.resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        if (user.emailVerified) return res.status(400).json({ success: false, error: 'Email already verified' });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendVerificationEmail(email, otp, user.name);
        res.json({ success: true, data: { message: 'New verification code sent' } });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        if (!user.emailVerified) {
            // Resend OTP automatically
            const otp = generateOTP();
            user.otp = otp;
            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            await sendVerificationEmail(email, otp, user.name);
            return res.status(403).json({ success: false, error: 'Email not verified. New code sent.', requiresVerification: true, email });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);
        res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, preferences: user.preferences }, token } });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
    res.json({ success: true, data: { message: 'Logged out successfully' } });
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ success: false, error: 'Refresh token required' });
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ success: false, error: 'User not found' });
        const token = generateToken(user._id);
        res.json({ success: true, data: { token } });
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user._id, name: req.user.name, email: req.user.email,
                role: req.user.role, avatar: req.user.avatar, preferences: req.user.preferences,
                emailVerified: req.user.emailVerified,
            },
        },
    });
};
