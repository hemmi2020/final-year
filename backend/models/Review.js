const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, trim: true },
}, { timestamps: true });

reviewSchema.index({ location: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
