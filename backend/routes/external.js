const router = require('express').Router();
const { weather, forecast, places, currency, geocodePlace, attractions, reverseGeocode, flights, hotels, bookingAttractions, detectLocation, nearby, nearbyAll, unesco } = require('../controllers/externalController');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.get('/detect-location', detectLocation);
router.get('/nearby-all', nearbyAll);
router.get('/nearby', nearby);
router.get('/weather', weather);
router.get('/forecast', forecast);
router.get('/places', places);
router.get('/currency', currency);
router.get('/reverse-geocode', reverseGeocode);
router.get('/geocode', geocodePlace);
router.get('/attractions', attractions);
router.get('/unesco', unesco);
router.get('/flights', flights);
router.get('/hotels', hotels);
router.get('/booking-attractions', bookingAttractions);

module.exports = router;
