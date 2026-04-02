const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/tripController');
const { generateItinerary } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { tripRules, generateRules, handleValidation } = require('../middleware/validate');

router.use(protect);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', ...tripRules, handleValidation, create);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/generate', ...generateRules, handleValidation, generateItinerary);

module.exports = router;
