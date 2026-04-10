const router = require('express').Router();
const { getProfile, updateProfile, updatePreferences, uploadAvatar, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { preferencesRules, handleValidation } = require('../middleware/validate');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/preferences', ...preferencesRules, handleValidation, updatePreferences);
router.post('/avatar', uploadAvatar);
router.put('/change-password', changePassword);

module.exports = router;
