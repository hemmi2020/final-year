/**
 * Verify user has admin role — must be used after protect middleware
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ success: false, error: 'Forbidden — admin access required' });
};

module.exports = { admin };
