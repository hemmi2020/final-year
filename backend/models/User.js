const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    age: { type: Number, min: 13, max: 100 },
    gender: { type: String, enum: ['male', 'female', 'prefer_not_to_say'], default: null },
    preferences: {
        dietary: { type: [String], default: [] },
        budget: { type: String, enum: ['budget', 'moderate', 'luxury'], default: 'moderate' },
        preferredCurrency: { type: String, default: 'USD' },
        temperatureUnit: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
        interests: { type: [String], default: [] },
        travelStyle: { type: String, enum: ['solo', 'family', 'couple', 'group'], default: 'solo' },
        cuisines: { type: [String], default: [] },
        pace: { type: String, enum: ['relaxed', 'moderate', 'packed'], default: 'moderate' },
        favoriteDestinations: { type: [String], default: [] },
        preferredDestinationTypes: { type: [String], default: [] },
        accommodationType: { type: String, enum: ['budget', 'mid-range', 'luxury', 'hostel', 'resort'], default: null },
        travelActivities: { type: [String], default: [] },
        budgetRange: { type: String, enum: ['under_50k', '50k_150k', '150k_500k', '500k_plus'], default: null },
    },
    bio: { type: String, maxlength: 200, default: '' },
    phone: { type: String, default: '' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    googleId: { type: String },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    lastLogin: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
