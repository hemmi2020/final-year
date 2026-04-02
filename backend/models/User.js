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
    preferences: {
        dietary: { type: [String], default: [] },           // ['halal', 'vegan', 'vegetarian']
        budget: { type: String, enum: ['budget', 'moderate', 'luxury'], default: 'moderate' },
        preferredCurrency: { type: String, default: 'USD' },
        temperatureUnit: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
        interests: { type: [String], default: [] },          // ['history', 'food', 'adventure']
        travelStyle: { type: String, enum: ['solo', 'family', 'couple', 'group'], default: 'solo' },
    },
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
