const router = require('express').Router();
const { sendMessage } = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, sendMessage);

module.exports = router;
