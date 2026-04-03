const mongoose = require('mongoose');

const userMemorySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },

    // Learned preferences over time
    learnedPreferences: {
        preferredBudget: String,
        commonDietary: [String],
        favoriteActivities: [String],
        preferredDuration: Number,
        bookingLeadTime: Number,
        timeOfYear: [String],
    },

    // Past trips summary
    tripHistory: [{
        destination: String,
        satisfaction: { type: Number, min: 1, max: 5 },
        notes: String,
        date: Date,
    }],

    // Entity interactions
    interactions: [{
        entityType: String,
        entityId: String,
        entityName: String,
        interaction: { type: String, enum: ['visited', 'saved', 'rated', 'searched'] },
        rating: Number,
        timestamp: { type: Date, default: Date.now },
    }],

    // Conversational insights
    insights: [{
        insight: String,
        confidence: Number,
        source: String,
        timestamp: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

module.exports = mongoose.model('UserMemory', userMemorySchema);
