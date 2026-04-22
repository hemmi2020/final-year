const router = require('express').Router();
const { sendMessage, clearChat } = require('../controllers/chatController');
const { optionalAuth, protect } = require('../middleware/auth');

router.post('/', optionalAuth, sendMessage);
router.delete('/', protect, clearChat);

module.exports = router;
