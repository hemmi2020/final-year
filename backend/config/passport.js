const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
        ? `${process.env.BACKEND_URL || 'https://travelfy-backend-bb5g.onrender.com'}/api/auth/google/callback`
        : 'http://localhost:5000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
        }

        // Create new user from Google profile
        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: `google_${profile.id}_${Date.now()}`, // random password for Google users
            avatar: profile.photos?.[0]?.value || '',
            isActive: true,
            lastLogin: new Date(),
        });

        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
