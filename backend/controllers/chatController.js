const { chat, generateItinerary: generateAI } = require('../services/ai/agent');
const Trip = require('../models/Trip');

// Simple per-user rate limiter for generate endpoint (max 1 request per 10 seconds)
const generateRateLimit = new Map();

// POST /api/chat
exports.sendMessage = async (req, res, next) => {
    try {
        const { message, tripState } = req.body;
        if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

        const result = await chat(req.user || null, message, tripState);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// POST /api/trips/generate
exports.generateItinerary = async (req, res, next) => {
    try {
        const { destination, days, budget, interests, dietary, origin, travelCompanion, vibe, dates, duration } = req.body;

        console.log('[generate] Request body:', JSON.stringify({ destination, origin, duration, travelCompanion, vibe, budget }));

        if (!destination) {
            return res.status(400).json({ success: false, error: 'destination is required' });
        }

        // Rate limit: 1 generate request per 10 seconds per user
        const userId = req.user?._id?.toString() || req.ip;
        const lastCall = generateRateLimit.get(userId);
        if (lastCall && Date.now() - lastCall < 10000) {
            return res.status(429).json({ success: false, error: 'Please wait before generating another trip' });
        }
        generateRateLimit.set(userId, Date.now());

        // Resolve numeric days from the duration string if days not provided
        let numDays = days;
        if (!numDays && duration) {
            const weekMatch = duration.match(/(\d+)\s*week/i);
            const dayMatch = duration.match(/(\d+)\s*day/i);
            if (weekMatch) {
                numDays = parseInt(weekMatch[1], 10) * 7;
            } else if (dayMatch) {
                numDays = parseInt(dayMatch[1], 10);
            } else if (/a\s+week/i.test(duration)) {
                numDays = 7;
            }
        }
        numDays = numDays || 7; // Default to 7 days if not resolved

        const itinerary = await generateAI(req.user, {
            destination,
            days: numDays,
            budget,
            interests,
            dietary,
            origin,
            travelCompanion,
            vibe,
            dates,
        });

        // Auto-save as draft trip with snapshots and extended fields
        const trip = await Trip.create({
            user: req.user._id,
            title: itinerary.title || `${numDays}-day ${destination} trip`,
            destination,
            itinerary: itinerary.days || [],
            budget: itinerary.totalBudget || { total: 0, currency: 'USD' },
            status: 'draft',
            aiGenerated: true,
            preferences: { budget, dietary, interests },
            weatherSnapshot: itinerary.metadata?.weatherAvailable ? { checkedAt: new Date() } : undefined,
            currencySnapshot: itinerary.metadata?.currencyConverted ? { checkedAt: new Date() } : undefined,
            // Extended Trip_State fields
            origin: origin || itinerary.origin || null,
            travelCompanion: travelCompanion || null,
            vibe: vibe || [],
            flightData: itinerary.flight || null,
            returnFlightData: itinerary.returnFlight || null,
            hotelData: itinerary.hotel || null,
            heroImage: itinerary.heroImage || null,
        });

        res.json({ success: true, data: { trip, itinerary } });
    } catch (error) {
        next(error);
    }
};
