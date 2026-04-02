const Location = require('../models/Location');
const Review = require('../models/Review');

// GET /api/locations
exports.getAll = async (req, res, next) => {
    try {
        const locations = await Location.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: locations });
    } catch (error) {
        next(error);
    }
};

// POST /api/locations
exports.create = async (req, res, next) => {
    try {
        const location = await Location.create({ ...req.body, user: req.user._id });
        res.status(201).json({ success: true, data: location });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/locations/:id
exports.remove = async (req, res, next) => {
    try {
        const location = await Location.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!location) return res.status(404).json({ success: false, error: 'Location not found' });
        res.json({ success: true, data: { message: 'Location removed' } });
    } catch (error) {
        next(error);
    }
};

// POST /api/locations/:id/reviews
exports.createReview = async (req, res, next) => {
    try {
        const review = await Review.create({
            user: req.user._id,
            location: req.params.id,
            rating: req.body.rating,
            text: req.body.text || req.body.comment,
        });
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
};

// GET /api/locations/:id/reviews
exports.getReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ location: req.params.id })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        next(error);
    }
};
