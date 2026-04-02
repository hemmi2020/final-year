const User = require('../models/User');
const Trip = require('../models/Trip');
const Group = require('../models/Group');

// GET /api/admin/users — list all users with pagination
exports.getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter).select('-password').skip(skip).limit(limit).sort('-createdAt'),
            User.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/users/:id — get single user
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/users/:id — update user (role, status, etc.)
exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, role } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (role && ['user', 'admin'].includes(role)) user.role = role;

        await user.save();
        const updated = user.toObject();
        delete updated.password;

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/users/:id — delete user
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
        }

        await User.findByIdAndDelete(req.params.id);
        // Clean up user's trips
        await Trip.deleteMany({ user: req.params.id });

        res.json({ success: true, data: { message: 'User and associated data deleted' } });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/stats — dashboard statistics
exports.getStats = async (req, res, next) => {
    try {
        const [totalUsers, totalTrips, totalGroups, recentUsers, tripsByStatus] = await Promise.all([
            User.countDocuments(),
            Trip.countDocuments(),
            Group.countDocuments(),
            User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
            Trip.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalTrips,
                totalGroups,
                recentUsers,
                tripsByStatus: tripsByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/trips — list all trips with pagination
exports.getTrips = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [trips, total] = await Promise.all([
            Trip.find()
                .populate('user', 'name email')
                .skip(skip)
                .limit(limit)
                .sort('-createdAt'),
            Trip.countDocuments(),
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
