const router = require('express').Router();
const { getAll, getById, create, invite, acceptInvite } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAll);
router.post('/', create);
router.get('/:id', getById);
router.post('/:id/invite', invite);
router.post('/join/:inviteCode', acceptInvite);

module.exports = router;
