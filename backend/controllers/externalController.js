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

// GET /api/external/detect-location — detect user's location from their IP (no CORS issues)
exports.detectLocation = async (req, res, next) => {
    try {
        const axios = require('axios');
        // Get client IP from request
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';

        // Try freeipapi.com first (works server-side, no CORS)
        try {
            const url = clientIp && clientIp !== '::1' && clientIp !== '127.0.0.1'
                ? `https://freeipapi.com/api/json/${clientIp}`
                : 'https://freeipapi.com/api/json';
            const { data } = await axios.get(url, { timeout: 5000 });
            if (data.countryCode) {
                return res.json({
                    success: true,
                    data: {
                        lat: data.latitude,
                        lng: data.longitude,
                        city: data.cityName,
                        country: data.countryName,
                        countryCode: data.countryCode,
                        currency: data.currencies?.[0] || null,
                        timezone: data.timeZones?.[0] || null,
                    },
                });
            }
        } catch { }

        // Fallback: ip-api.com (works server-side)
        try {
            const url = clientIp && clientIp !== '::1' && clientIp !== '127.0.0.1'
                ? `http://ip-api.com/json/${clientIp}?fields=lat,lon,city,country,countryCode,currency,timezone`
                : 'http://ip-api.com/json/?fields=lat,lon,city,country,countryCode,currency,timezone';
            const { data } = await axios.get(url, { timeout: 5000 });
            if (data.countryCode) {
                return res.json({
                    success: true,
                    data: {
                        lat: data.lat,
                        lng: data.lon,
                        city: data.city,
                        country: data.country,
                        countryCode: data.countryCode,
                        currency: data.currency,
                        timezone: data.timezone,
                    },
                });
            }
        } catch { }

        // Hard fallback
        res.json({
            success: true,
            data: {
                lat: 24.8607, lng: 67.0011, city: 'Karachi', country: 'Pakistan',
                countryCode: 'PK', currency: 'PKR', timezone: 'Asia/Karachi',
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/external/nearby?lat=24.86&lng=67.00&category=mosques&radius=10000
// In-memory cache for nearby results (10 min TTL)
const nearbyCache = new Map();
const NEARBY_CACHE_TTL = 10 * 60 * 1000;

// Category tag definitions
const CATEGORY_TAGS = {
    mosques: { filter: `nwr["amenity"="place_of_worship"]["religion"="muslim"]`, label: 'mosques' },
    hospitals: { filter: `nwr["amenity"~"hospital|clinic|doctors"]`, label: 'hospitals' },
    police: { filter: `nwr["amenity"="police"]`, label: 'police' },
    halal: { filter: null, label: 'halal' }, // special compound query
    atms: { filter: `nwr["amenity"~"atm|bank"]`, label: 'atms' },
    fuel: { filter: `nwr["amenity"="fuel"]`, label: 'fuel' },
    pharmacy: { filter: `nwr["amenity"="pharmacy"]`, label: 'pharmacy' },
};

function parseNearbyElements(elements, userLat, userLng, category) {
    return (elements || [])
        .filter(el => {
            const name = el.tags?.['name:en'] || el.tags?.['int_name'] || el.tags?.name;
            return !!name;
        })
        .map(el => {
            const name = el.tags['name:en'] || el.tags['int_name'] || el.tags.name;
            const elLat = el.lat || el.center?.lat;
            const elLng = el.lon || el.center?.lon;
            if (!elLat || !elLng) return null;
            const R = 6371000;
            const dLat = (elLat - userLat) * Math.PI / 180;
            const dLng2 = (elLng - userLng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLat * Math.PI / 180) * Math.cos(elLat * Math.PI / 180) * Math.sin(dLng2 / 2) ** 2;
            const dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
            return {
                name: el.tags.name, lat: elLat, lng: elLng,
                type: el.tags.amenity || el.tags.tourism || category,
                phone: el.tags.phone || '', cuisine: el.tags.cuisine || '',
                distance: dist,
                distanceText: dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`,
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
}

// GET /api/external/nearby-all?lat=24.86&lng=67.00&radius=5000
// Fetches ALL nearby categories via 3 small Overpass queries
exports.nearbyAll = async (req, res, next) => {
    try {
        const axios = require('axios');
        const { lat, lng, radius: radiusParam, countryCode } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, error: 'lat and lng required' });
        }

        const r = parseInt(radiusParam) || 5000;
        const cacheKey = `all_${parseFloat(lat).toFixed(3)}_${parseFloat(lng).toFixed(3)}_${r}`;

        const cached = nearbyCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < NEARBY_CACHE_TTL) {
            return res.json({ success: true, data: cached.data, cached: true });
        }

        const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        const MUSLIM_COUNTRIES = new Set(['PK', 'SA', 'AE', 'TR', 'BD', 'EG', 'ID', 'MY', 'QA', 'KW', 'BH', 'OM', 'JO', 'MA', 'TN', 'DZ', 'IQ', 'SY', 'LY', 'SD', 'YE', 'AF', 'IR', 'MV', 'BN', 'SN', 'ML', 'NE', 'SO', 'DJ']);
        const isMuslimCountry = MUSLIM_COUNTRIES.has((countryCode || '').toUpperCase());

        const categorized = { mosques: [], hospitals: [], pharmacy: [], police: [], halal: [], atms: [], fuel: [] };
        const allRestaurants = [];

        const runQuery = async (label, query) => {
            try {
                const { data } = await axios.post(OVERPASS_API, `data=${encodeURIComponent(query)}`, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 12000 });
                console.log(`[nearby] ${label}: ${(data.elements || []).length} results`);
                return data.elements || [];
            } catch (e) { console.log(`[nearby] ${label} FAILED:`, e.message); return []; }
        };

        const wait = () => new Promise(r => setTimeout(r, 1200));

        // BATCH 1: Mosques + Hospitals only (2 types — very light)
        const b1 = await runQuery('B1', `[out:json][timeout:10];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng});node["amenity"~"hospital|clinic"](around:${r},${lat},${lng}););out body;`);
        for (const el of b1) {
            if (el.tags?.amenity === 'place_of_worship') categorized.mosques.push(el);
            else categorized.hospitals.push(el);
        }
        await wait();

        // BATCH 2: ATMs + Fuel + Police + Pharmacy (4 types — all small result sets)
        const b2 = await runQuery('B2', `[out:json][timeout:10];(node["amenity"~"atm|bank"](around:${r},${lat},${lng});node["amenity"="fuel"](around:${r},${lat},${lng});node["amenity"="police"](around:${r},${lat},${lng});node["amenity"="pharmacy"](around:${r},${lat},${lng}););out body;`);
        for (const el of b2) {
            const a = el.tags?.amenity;
            if (/^(atm|bank)$/.test(a)) categorized.atms.push(el);
            else if (a === 'fuel') categorized.fuel.push(el);
            else if (a === 'police') categorized.police.push(el);
            else if (a === 'pharmacy') categorized.pharmacy.push(el);
        }
        await wait();

        // BATCH 3: Restaurants + Fast food (separate — can return many results)
        const b3 = await runQuery('B3', `[out:json][timeout:10];(node["amenity"="restaurant"](around:${r},${lat},${lng});node["amenity"="fast_food"](around:${r},${lat},${lng}););out body;`);
        for (const el of b3) {
            allRestaurants.push(el);
            const cuisine = el.tags?.cuisine || '';
            if (el.tags?.['diet:halal'] === 'yes' || el.tags?.halal === 'yes' || /halal|pakistani|arabic|turkish|indian|muslim|kebab|middle_eastern/i.test(cuisine)) {
                categorized.halal.push(el);
            }
        }

        // Halal: Muslim countries → all restaurants are halal. Others → fallback to general.
        if (isMuslimCountry || categorized.halal.length === 0) {
            categorized.halal = allRestaurants;
        }

        const result = {};
        for (const [cat, elements] of Object.entries(categorized)) {
            result[cat] = parseNearbyElements(elements, userLat, userLng, cat);
        }

        nearbyCache.set(cacheKey, { data: result, ts: Date.now() });
        res.json({ success: true, data: result, isMuslimCountry });
    } catch (error) {
        console.log('[nearby-all] error:', error.message);
        res.json({ success: true, data: { mosques: [], hospitals: [], pharmacy: [], police: [], halal: [], atms: [], fuel: [] } });
    }
};

// GET /api/external/nearby?lat=24.86&lng=67.00&category=mosques&radius=5000 (legacy single-category)
exports.nearby = async (req, res, next) => {
    try {
        const axios = require('axios');
        const { lat, lng, category, radius: radiusParam } = req.query;
        if (!lat || !lng || !category) {
            return res.status(400).json({ success: false, error: 'lat, lng, and category required' });
        }

        const r = parseInt(radiusParam) || 5000;
        const cacheKey = `${lat}_${lng}_${category}_${r}`;

        const cached = nearbyCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < NEARBY_CACHE_TTL) {
            return res.json({ success: true, data: cached.data, count: cached.data.length, radius: r, cached: true });
        }

        const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
        const QUERIES = {
            mosques: `nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng});`,
            hospitals: `nwr["amenity"~"hospital|clinic|doctors"](around:${r},${lat},${lng});`,
            police: `(nwr["amenity"="police"](around:${r},${lat},${lng});nwr["office"="government"]["government"="police"](around:${r},${lat},${lng}););`,
            halal: `(nwr["amenity"="restaurant"]["diet:halal"="yes"](around:${r},${lat},${lng});nwr["amenity"="restaurant"]["halal"="yes"](around:${r},${lat},${lng});nwr["amenity"="restaurant"]["cuisine"~"halal|pakistani|arabic|turkish|indian|muslim|kebab|middle_eastern"](around:${r},${lat},${lng});nwr["amenity"="fast_food"]["diet:halal"="yes"](around:${r},${lat},${lng});nwr["amenity"="fast_food"]["cuisine"~"halal|pakistani|arabic|turkish|indian|muslim|kebab"](around:${r},${lat},${lng}););`,
            atms: `nwr["amenity"~"atm|bank"](around:${r},${lat},${lng});`,
            fuel: `nwr["amenity"="fuel"](around:${r},${lat},${lng});`,
            pharmacy: `nwr["amenity"="pharmacy"](around:${r},${lat},${lng});`,
        };

        const query = QUERIES[category];
        if (!query) return res.status(400).json({ success: false, error: 'Invalid category' });

        const overpassQuery = `[out:json][timeout:25];${query}out center 15;`;
        const { data } = await axios.post(OVERPASS_API,
            `data=${encodeURIComponent(overpassQuery)}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 20000 }
        );

        const results = parseNearbyElements(data.elements, parseFloat(lat), parseFloat(lng), category);
        nearbyCache.set(cacheKey, { data: results, ts: Date.now() });
        res.json({ success: true, data: results, count: results.length, radius: r });
    } catch (error) {
        console.log('[nearby] Overpass error:', error.message);
        res.json({ success: true, data: [], count: 0, radius: parseInt(req.query.radius) || 5000 });
    }
};
