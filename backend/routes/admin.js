const router = require('express').Router();
const { getUsers, getUser, updateUser, deleteUser, getStats, getTrips } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// All admin routes require auth + admin role
router.use(protect, admin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/trips', getTrips);

module.exports = router;
