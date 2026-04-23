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
        const { name, avatar, bio, phone, age, gender } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (avatar) updates.avatar = avatar;
        if (bio !== undefined) updates.bio = bio;
        if (phone !== undefined) updates.phone = phone;
        if (age !== undefined) updates.age = age;
        if (gender !== undefined) updates.gender = gender;

        const user = await User.findByIdAndUpdate(req.user._id, updates, { returnDocument: 'after', runValidators: true });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/change-password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Current password and new password are required' });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, data: { message: 'Password changed successfully' } });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/preferences
exports.updatePreferences = async (req, res, next) => {
    try {
        const { dietary, budget, preferredCurrency, temperatureUnit, interests, travelStyle, preferredDestinationTypes, accommodationType, travelActivities, budgetRange } = req.body;
        const prefs = {};
        if (dietary !== undefined) prefs['preferences.dietary'] = dietary;
        if (budget !== undefined) prefs['preferences.budget'] = budget;
        if (preferredCurrency !== undefined) prefs['preferences.preferredCurrency'] = preferredCurrency;
        if (temperatureUnit !== undefined) prefs['preferences.temperatureUnit'] = temperatureUnit;
        if (interests !== undefined) prefs['preferences.interests'] = interests;
        if (travelStyle !== undefined) prefs['preferences.travelStyle'] = travelStyle;
        if (preferredDestinationTypes !== undefined) prefs['preferences.preferredDestinationTypes'] = preferredDestinationTypes;
        if (accommodationType !== undefined) prefs['preferences.accommodationType'] = accommodationType;
        if (travelActivities !== undefined) prefs['preferences.travelActivities'] = travelActivities;
        if (budgetRange !== undefined) prefs['preferences.budgetRange'] = budgetRange;

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
