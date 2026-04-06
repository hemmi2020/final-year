const router = require('express').Router();
const { getPublicTrips, getPublicTrip, publishTrip, unpublishTrip, cloneTrip, likeTrip } = require('../controllers/communityController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes (anyone can browse)
router.get('/trips', optionalAuth, getPublicTrips);
router.get('/trips/:id', optionalAuth, getPublicTrip);

// Protected routes (need login)
router.post('/trips/:id/publish', protect, publishTrip);
router.post('/trips/:id/unpublish', protect, unpublishTrip);
router.post('/trips/:id/clone', protect, cloneTrip);
router.post('/trips/:id/like', protect, likeTrip);

module.exports = router;
