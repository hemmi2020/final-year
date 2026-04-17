const { getCurrentWeather, getForecast } = require('../services/external/weatherService');
const { searchPlaces, geocode, findAttractions, reverseGeocode: reverseGeocodeService } = require('../services/external/mapsService');
const { convertCurrency, getExchangeRate } = require('../services/external/currencyService');

// GET /api/external/weather?lat=&lng=
exports.weather = async (req, res, next) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat and lng required' });

        const units = req.user?.preferences?.temperatureUnit || 'metric';
        const data = await getCurrentWeather(parseFloat(lat), parseFloat(lng), units);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// GET /api/external/forecast?lat=&lng=&days=
exports.forecast = async (req, res, next) => {
    try {
        const { lat, lng, days } = req.query;
        if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat and lng required' });

        const units = req.user?.preferences?.temperatureUnit || 'metric';
        const data = await getForecast(parseFloat(lat), parseFloat(lng), parseInt(days) || 7, units);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// GET /api/external/places?query=&lat=&lng=&type=
exports.places = async (req, res, next) => {
    try {
        const { query, lat, lng, type } = req.query;
        if (!query && !lat) return res.status(400).json({ success: false, error: 'query or lat/lng required' });

        let searchLat = parseFloat(lat);
        let searchLng = parseFloat(lng);

        // If no coordinates, geocode the query first
        if (!searchLat || !searchLng) {
            const geo = await geocode(query);
            if (!geo) return res.status(404).json({ success: false, error: 'Location not found' });
            searchLat = geo.lat;
            searchLng = geo.lng;
        }

        const dietary = req.user?.preferences?.dietary || [];
        const data = await searchPlaces(query, searchLat, searchLng, { type, dietary });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// GET /api/external/geocode?q=
exports.geocodePlace = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, error: 'q (place name) required' });
        const data = await geocode(q);
        if (!data) return res.status(404).json({ success: false, error: 'Location not found' });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// GET /api/external/attractions?lat=&lng=
exports.attractions = async (req, res, next) => {
    try {
        const { lat, lng, radius } = req.query;
        if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat and lng required' });
        const data = await findAttractions(parseFloat(lat), parseFloat(lng), parseInt(radius) || 10000);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// GET /api/external/currency?from=&to=&amount=
exports.currency = async (req, res, next) => {
    try {
        const { from, to, amount } = req.query;
        const targetCurrency = to || req.user?.preferences?.preferredCurrency || 'USD';
        if (!from) return res.status(400).json({ success: false, error: 'from currency required' });

        const data = await convertCurrency(from, targetCurrency, parseFloat(amount) || 1);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// GET /api/external/reverse-geocode?lat=&lng=
exports.reverseGeocode = async (req, res, next) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat and lng required' });

        const data = await reverseGeocodeService(parseFloat(lat), parseFloat(lng));
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// ─── RapidAPI: Flights + Hotels ─────────────────────────────────────────────

const { searchFlights } = require('../services/external/flightService');
const { searchHotels, searchAttractions: searchBookingAttractions } = require('../services/external/hotelService');

// GET /api/external/flights?from=Karachi&to=Istanbul&date=2026-05-15&adults=1&currency=USD
exports.flights = async (req, res, next) => {
    try {
        const { from, to, date, adults, cabinClass, currency } = req.query;
        if (!from || !to) return res.status(400).json({ success: false, error: 'from and to cities required' });

        const departDate = date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        const data = await searchFlights(from, to, departDate, {
            adults: parseInt(adults) || 1,
            cabinClass: cabinClass || 'economy',
            currency: currency || req.user?.preferences?.preferredCurrency || 'USD',
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// GET /api/external/hotels?city=Istanbul&checkin=2026-05-15&checkout=2026-05-20&adults=2&currency=USD
exports.hotels = async (req, res, next) => {
    try {
        const { city, checkin, checkout, adults, rooms, currency } = req.query;
        if (!city) return res.status(400).json({ success: false, error: 'city required' });

        const checkinDate = checkin || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        const checkoutDate = checkout || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        const data = await searchHotels(city, checkinDate, checkoutDate, {
            adults: parseInt(adults) || 2,
            rooms: parseInt(rooms) || 1,
            currency: currency || req.user?.preferences?.preferredCurrency || 'USD',
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// GET /api/external/booking-attractions?city=Istanbul
exports.bookingAttractions = async (req, res, next) => {
    try {
        const { city } = req.query;
        if (!city) return res.status(400).json({ success: false, error: 'city required' });
        const data = await searchBookingAttractions(city);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
