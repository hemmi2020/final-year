const router = require('express').Router();
const { getAll, create, remove, createReview, getReviews } = require('../controllers/locationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAll);
router.post('/', create);
router.delete('/:id', remove);
router.post('/:id/reviews', createReview);
router.get('/:id/reviews', getReviews);

module.exports = router;
