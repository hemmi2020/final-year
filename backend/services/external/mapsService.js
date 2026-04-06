const axios = require('axios');

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

/**
 * Geocode a place name to coordinates using Nominatim (free, no API key)
 */
exports.geocode = async (placeName) => {
    try {
        const { data } = await axios.get(`${NOMINATIM_API}/search`, {
            params: { q: placeName, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'TravelFyAI/1.0' },
        });

        if (!data || data.length === 0) return null;

        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            displayName: data[0].display_name,
            type: data[0].type,
        };
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Geocode error:', error.message);
        return null;
    }
};

/**
 * Reverse geocode coordinates to place name
 */
exports.reverseGeocode = async (lat, lng) => {
    try {
        const { data } = await axios.get(`${NOMINATIM_API}/reverse`, {
            params: { lat, lon: lng, format: 'json' },
            headers: { 'User-Agent': 'TravelFyAI/1.0' },
        });

        return {
            name: data.name || data.display_name,
            address: data.address,
            displayName: data.display_name,
        };
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Reverse geocode error:', error.message);
        return null;
    }
};

/**
 * Search places near coordinates using Overpass API (free, no API key)
 * Supports: restaurant, cafe, hotel, museum, attraction, park, etc.
 * Preference-aware: filters by dietary tags (halal, vegan, vegetarian)
 */
exports.searchPlaces = async (query, lat, lng, options = {}) => {
    try {
        const { type = 'restaurant', dietary = [], radius = 5000 } = options;

        // Map common types to OSM tags
        const osmTags = {
            restaurant: 'amenity=restaurant',
            cafe: 'amenity=cafe',
            hotel: 'tourism=hotel',
            museum: 'tourism=museum',
            attraction: 'tourism=attraction',
            park: 'leisure=park',
            mosque: 'amenity=place_of_worship][religion=muslim',
            temple: 'amenity=place_of_worship',
        };

        const tag = osmTags[type] || `amenity=${type}`;

        // Build Overpass QL query
        let overpassQuery = `[out:json][timeout:10];node[${tag}](around:${radius},${lat},${lng});out body 20;`;

        const { data } = await axios.post(OVERPASS_API, overpassQuery, {
            headers: { 'Content-Type': 'text/plain' },
        });

        let results = (data.elements || []).map((el) => ({
            name: el.tags?.name || 'Unknown',
            lat: el.lat,
            lng: el.lon,
            type: el.tags?.amenity || el.tags?.tourism || el.tags?.leisure || type,
            cuisine: el.tags?.cuisine || '',
            dietary: {
                halal: el.tags?.['diet:halal'] === 'yes' || (el.tags?.cuisine || '').includes('halal'),
                vegan: el.tags?.['diet:vegan'] === 'yes',
                vegetarian: el.tags?.['diet:vegetarian'] === 'yes',
            },
            rating: el.tags?.stars ? parseFloat(el.tags.stars) : null,
            address: el.tags?.['addr:street']
                ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}, ${el.tags['addr:city'] || ''}`
                : '',
            website: el.tags?.website || '',
            phone: el.tags?.phone || '',
        }));

        // Filter by dietary preferences if provided
        if (dietary.length > 0) {
            results = results.filter((place) => {
                return dietary.some((pref) => {
                    if (pref === 'halal') return place.dietary.halal;
                    if (pref === 'vegan') return place.dietary.vegan;
                    if (pref === 'vegetarian') return place.dietary.vegetarian;
                    return place.cuisine.toLowerCase().includes(pref.toLowerCase());
                });
            });
        }

        return results;
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Places search error:', error.message);
        return [];
    }
};

/**
 * Find halal restaurants near a location
 */
exports.findHalalRestaurants = async (lat, lng, radius = 5000) => {
    return exports.searchPlaces('halal', lat, lng, {
        type: 'restaurant',
        dietary: ['halal'],
        radius,
    });
};

/**
 * Find attractions/tourist spots near a location
 */
exports.findAttractions = async (lat, lng, radius = 10000) => {
    try {
        const overpassQuery = `[out:json][timeout:10];(node[tourism=attraction](around:${radius},${lat},${lng});node[tourism=museum](around:${radius},${lat},${lng});node[historic](around:${radius},${lat},${lng}););out body 20;`;

        const { data } = await axios.post(OVERPASS_API, overpassQuery, {
            headers: { 'Content-Type': 'text/plain' },
        });

        return (data.elements || []).map((el) => ({
            name: el.tags?.name || 'Unknown',
            lat: el.lat,
            lng: el.lon,
            type: el.tags?.tourism || el.tags?.historic || 'attraction',
            description: el.tags?.description || '',
            wikipedia: el.tags?.wikipedia || '',
            website: el.tags?.website || '',
        }));
    } catch (error) {
        process.env.NODE_ENV !== "production" && console.warn('Attractions search error:', error.message);
        return [];
    }
};
