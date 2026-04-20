const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const BASE_URL = 'https://booking-com.p.rapidapi.com/v1';

const headers = {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': 'booking-com.p.rapidapi.com',
    'Content-Type': 'application/json',
};

/**
 * Search for a destination ID on Booking.com
 */
async function searchDestination(query) {
    if (!RAPIDAPI_KEY) return null;
    try {
        const { data } = await axios.get(`${BASE_URL}/hotels/locations`, {
            params: { name: query, locale: 'en-gb' },
            headers,
            timeout: 8000,
        });
        const dest = data?.[0];
        if (!dest) return null;
        return {
            destId: dest.dest_id,
            destType: dest.dest_type,
            name: dest.name || query,
        };
    } catch (err) {
        console.log('[hotelService] Destination search failed:', err.message);
        return null;
    }
}

/**
 * Returns realistic mock hotel data when RapidAPI is unavailable or returns empty results
 * @param {string} city - Destination city name
 * @returns {Array} Mock hotel results matching the searchHotels return format
 */
function getMockHotels(city) {
    console.log('[hotelService] Using mock hotel data for:', city);

    return [
        {
            id: `mock-hotel-1-${city.toLowerCase().replace(/\s+/g, '-')}`,
            name: `Grand ${city} Hotel & Suites`,
            stars: 5,
            rating: 9.1,
            ratingText: 'Wonderful',
            reviewCount: 2340,
            price: 'PKR 18,500',
            priceRaw: 18500,
            currency: 'PKR',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            address: `Central District, ${city}`,
            city: city,
            distance: '0.5 km from center',
            url: '',
        },
        {
            id: `mock-hotel-2-${city.toLowerCase().replace(/\s+/g, '-')}`,
            name: `${city} Palace Resort`,
            stars: 4,
            rating: 8.5,
            ratingText: 'Very Good',
            reviewCount: 1856,
            price: 'PKR 12,000',
            priceRaw: 12000,
            currency: 'PKR',
            image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
            address: `Old Town, ${city}`,
            city: city,
            distance: '1.2 km from center',
            url: '',
        },
        {
            id: `mock-hotel-3-${city.toLowerCase().replace(/\s+/g, '-')}`,
            name: `Comfort Inn ${city}`,
            stars: 3,
            rating: 7.8,
            ratingText: 'Good',
            reviewCount: 945,
            price: 'PKR 6,500',
            priceRaw: 6500,
            currency: 'PKR',
            image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
            address: `Market Area, ${city}`,
            city: city,
            distance: '2.0 km from center',
            url: '',
        },
        {
            id: `mock-hotel-4-${city.toLowerCase().replace(/\s+/g, '-')}`,
            name: `${city} Boutique Hotel`,
            stars: 4,
            rating: 8.8,
            ratingText: 'Excellent',
            reviewCount: 1120,
            price: 'PKR 14,200',
            priceRaw: 14200,
            currency: 'PKR',
            image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
            address: `Waterfront, ${city}`,
            city: city,
            distance: '0.8 km from center',
            url: '',
        },
    ];
}

/**
 * Search hotels in a city
 * @param {string} city - City name (e.g., "Istanbul")
 * @param {string} checkin - Check-in date YYYY-MM-DD
 * @param {string} checkout - Check-out date YYYY-MM-DD
 * @param {object} options - { adults, currency, rooms }
 */
exports.searchHotels = async (city, checkin, checkout, options = {}) => {
    if (!RAPIDAPI_KEY) {
        console.log('[hotelService] No RAPIDAPI_KEY set — returning mock data');
        return getMockHotels(city);
    }

    try {
        // Step 1: Get destination ID
        const dest = await searchDestination(city);
        if (!dest) {
            console.log('[hotelService] Could not find destination:', city);
            return getMockHotels(city);
        }

        // Step 2: Search hotels
        const { data } = await axios.get(`${BASE_URL}/hotels/search`, {
            params: {
                dest_id: dest.destId,
                dest_type: dest.destType,
                checkin_date: checkin,
                checkout_date: checkout,
                adults_number: String(options.adults || 2),
                room_number: String(options.rooms || 1),
                order_by: 'popularity',
                filter_by_currency: options.currency || 'USD',
                locale: 'en-gb',
                units: 'metric',
                page_number: '0',
                include_adjacency: 'true',
            },
            headers,
            timeout: 15000,
        });

        const results = data?.result || [];

        const mapped = results.slice(0, 5).map((hotel) => ({
            id: hotel.hotel_id,
            name: hotel.hotel_name || 'Unknown Hotel',
            stars: hotel.class || 0,
            rating: hotel.review_score || 0,
            ratingText: hotel.review_score_word || '',
            reviewCount: hotel.review_nr || 0,
            price: hotel.min_total_price ? `${hotel.currency_code || 'USD'} ${Math.round(hotel.min_total_price)}` : 'N/A',
            priceRaw: hotel.min_total_price || 0,
            currency: hotel.currency_code || 'USD',
            image: hotel.max_photo_url || hotel.main_photo_url || '',
            address: hotel.address || '',
            city: hotel.city || city,
            distance: hotel.distance_to_cc ? `${hotel.distance_to_cc} km from center` : '',
            url: hotel.url || '',
        }));

        // Fallback to mock data if RapidAPI returned empty results
        if (mapped.length === 0) {
            return getMockHotels(city);
        }

        return mapped;
    } catch (err) {
        console.log('[hotelService] Hotel search failed:', err.message);
        return getMockHotels(city);
    }
};

// Expose for testing
exports._getMockHotels = getMockHotels;

/**
 * Search attractions in a city
 * @param {string} city - City name
 */
exports.searchAttractions = async (city) => {
    if (!RAPIDAPI_KEY) return [];
    try {
        const dest = await searchDestination(city);
        if (!dest) return [];

        const { data } = await axios.get(`${BASE_URL}/attractions/list`, {
            params: {
                id: dest.destId,
                locale: 'en-gb',
                currency: 'USD',
            },
            headers,
            timeout: 10000,
        });

        const products = data?.products || [];
        return products.slice(0, 8).map((a) => ({
            id: a.id,
            name: a.title || 'Unknown',
            description: a.shortDescription || '',
            price: a.representativePrice?.publicAmount ? `USD ${a.representativePrice.publicAmount}` : 'N/A',
            rating: a.reviewsStats?.combinedNumericStats?.average || 0,
            reviewCount: a.reviewsStats?.combinedNumericStats?.total || 0,
            image: a.primaryPhoto?.small || '',
            duration: a.duration || '',
        }));
    } catch (err) {
        console.log('[hotelService] Attractions search failed:', err.message);
        return [];
    }
};
