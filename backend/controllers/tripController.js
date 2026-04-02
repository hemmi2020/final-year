const Trip = require('../models/Trip');

// GET /api/trips
exports.getAll = async (req, res, next) => {
    try {
        const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: trips });
    } catch (error) {
        next(error);
    }
};

// GET /api/trips/:id
exports.getById = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
        if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
        res.json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
};

// POST /api/trips
exports.create = async (req, res, next) => {
    try {
        const trip = await Trip.create({ ...req.body, user: req.user._id });
        res.status(201).json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
};

// PUT /api/trips/:id
exports.update = async (req, res, next) => {
    try {
        const trip = await Trip.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { returnDocument: 'after', runValidators: true }
        );
        if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
        res.json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/trips/:id
exports.remove = async (req, res, next) => {
    try {
        const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
        res.json({ success: true, data: { message: 'Trip deleted' } });
    } catch (error) {
        next(error);
    }
};
