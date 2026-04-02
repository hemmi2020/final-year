const router = require('express').Router();
const { weather, forecast, places, currency, geocodePlace, attractions } = require('../controllers/externalController');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.get('/weather', weather);
router.get('/forecast', forecast);
router.get('/places', places);
router.get('/currency', currency);
router.get('/geocode', geocodePlace);
router.get('/attractions', attractions);

module.exports = router;
