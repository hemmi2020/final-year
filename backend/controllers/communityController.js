const Trip = require('../models/Trip');
const User = require('../models/User');

// GET /api/community/trips — list all public trips
exports.getPublicTrips = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const sort = req.query.sort || 'newest'; // newest, popular, budget-low, budget-high

        const filter = { isPublic: true };
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { destination: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        const sortMap = {
            newest: { createdAt: -1 },
            popular: { 'likes.length': -1, createdAt: -1 },
            'budget-low': { 'budget.total': 1 },
            'budget-high': { 'budget.total': -1 },
        };

        const [trips, total] = await Promise.all([
            Trip.find(filter)
                .populate('user', 'name avatar')
                .skip(skip).limit(limit)
                .sort(sortMap[sort] || sortMap.newest),
            Trip.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: trips,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/community/trips/:id/publish — make trip public
exports.publishTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
        if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

        trip.isPublic = true;
        if (req.body.description) trip.notes = req.body.description;
        if (req.body.tags) trip.tags = req.body.tags;
        await trip.save();

        res.json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
};

// POST /api/community/trips/:id/unpublish — make trip private
exports.unpublishTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
        if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

        trip.isPublic = false;
        await trip.save();

        res.json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
};

// GET /api/community/trips/:id — get single public trip (anyone can view)
exports.getPublicTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, isPublic: true })
            .populate('user', 'name avatar');
        if (!trip) return res.status(404).json({ success: false, error: 'Trip not found or not public' });
        res.json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
};

// POST /api/community/trips/:id/clone — clone a public trip to user's own trips
exports.cloneTrip = async (req, res, next) => {
    try {
        const original = await Trip.findOne({ _id: req.params.id, isPublic: true });
        if (!original) return res.status(404).json({ success: false, error: 'Trip not found' });

        const cloned = await Trip.create({
            user: req.user._id,
            title: `${original.title} (Cloned)`,
            destination: original.destination,
            startDate: original.startDate,
            endDate: original.endDate,
            itinerary: original.itinerary,
            budget: original.budget,
            status: 'draft',
            aiGenerated: original.aiGenerated,
            preferences: original.preferences,
            tags: original.tags,
            notes: original.notes,
            isPublic: false,
        });

        res.status(201).json({ success: true, data: cloned });
    } catch (error) {
        next(error);
    }
};

// POST /api/community/trips/:id/like — toggle like on a public trip
exports.likeTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, isPublic: true });
        if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

        // Use tags array to store likes (simple approach without schema change)
        const likeTag = `like:${req.user._id}`;
        if (trip.tags.includes(likeTag)) {
            trip.tags = trip.tags.filter(t => t !== likeTag);
        } else {
            trip.tags.push(likeTag);
        }
        await trip.save();

        const likeCount = trip.tags.filter(t => t.startsWith('like:')).length;
        const liked = trip.tags.includes(likeTag);

        res.json({ success: true, data: { liked, likeCount } });
    } catch (error) {
        next(error);
    }
};
