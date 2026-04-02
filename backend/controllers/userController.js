const User = require('../models/User');

// GET /api/users/profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, avatar } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (avatar) updates.avatar = avatar;

        const user = await User.findByIdAndUpdate(req.user._id, updates, { returnDocument: 'after', runValidators: true });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/preferences
exports.updatePreferences = async (req, res, next) => {
    try {
        const { dietary, budget, preferredCurrency, temperatureUnit, interests, travelStyle } = req.body;
        const prefs = {};
        if (dietary !== undefined) prefs['preferences.dietary'] = dietary;
        if (budget !== undefined) prefs['preferences.budget'] = budget;
        if (preferredCurrency !== undefined) prefs['preferences.preferredCurrency'] = preferredCurrency;
        if (temperatureUnit !== undefined) prefs['preferences.temperatureUnit'] = temperatureUnit;
        if (interests !== undefined) prefs['preferences.interests'] = interests;
        if (travelStyle !== undefined) prefs['preferences.travelStyle'] = travelStyle;

        const user = await User.findByIdAndUpdate(req.user._id, { $set: prefs }, { returnDocument: 'after' });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// POST /api/users/avatar
exports.uploadAvatar = async (req, res, next) => {
    try {
        const { avatar } = req.body;
        if (!avatar) return res.status(400).json({ success: false, error: 'Avatar URL required' });

        const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { returnDocument: 'after' });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};
