const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    coordinates: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    type: { type: String, enum: ['restaurant', 'attraction', 'hotel', 'mosque', 'temple', 'museum', 'park', 'market', 'other'], default: 'other' },
    description: String,
    isUNESCO: { type: Boolean, default: false },
    address: String,
    rating: { type: Number, min: 0, max: 5 },
    tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
