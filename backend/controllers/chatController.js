const { chat, generateItinerary: generateAI } = require('../services/ai/agent');
const Trip = require('../models/Trip');

// POST /api/chat
exports.sendMessage = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

        const result = await chat(req.user || null, message);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// POST /api/trips/generate
exports.generateItinerary = async (req, res, next) => {
    try {
        const { destination, days, budget, interests, dietary } = req.body;

        const itinerary = await generateAI(req.user, { destination, days, budget, interests, dietary });

        // Auto-save as draft trip
        const trip = await Trip.create({
            user: req.user._id,
            title: itinerary.title || `${days}-day ${destination} trip`,
            destination,
            itinerary: itinerary.days || [],
            budget: itinerary.totalBudget || { total: 0, currency: 'USD' },
            status: 'draft',
            aiGenerated: true,
        });

        res.json({ success: true, data: { trip, itinerary } });
    } catch (error) {
        next(error);
    }
};
