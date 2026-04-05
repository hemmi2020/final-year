const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    time: String,
    name: { type: String, required: true },
    description: String,
    location: { lat: Number, lng: Number },
    type: String,
    cost: { amount: Number, currency: String },
    tags: [String],
}, { _id: false });

const daySchema = new mongoose.Schema({
    day: Number,
    date: Date,
    weather: { temp: Number, description: String, icon: String },
    activities: [activitySchema],
}, { _id: false });

const tripSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    destination: { type: String, required: [true, 'Destination is required'], trim: true, index: true },
    startDate: Date,
    endDate: Date,
    itinerary: [daySchema],
    budget: { total: Number, currency: { type: String, default: 'USD' } },
    status: { type: String, enum: ['draft', 'planned', 'active', 'completed', 'cancelled'], default: 'draft' },
    aiGenerated: { type: Boolean, default: false },
    // Preferences used for this trip
    preferences: {
        budget: String,
        dietary: [String],
        interests: [String],
        travelStyle: String,
    },
    // Snapshots at time of planning
    weatherSnapshot: {
        forecast: [mongoose.Schema.Types.Mixed],
        checkedAt: Date,
    },
    currencySnapshot: {
        rate: Number,
        from: String,
        to: String,
        checkedAt: Date,
    },
    tags: [String],
    notes: String,
    isPublic: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
