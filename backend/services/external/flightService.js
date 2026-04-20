const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const BASE_URL = 'https://sky-scrapper.p.rapidapi.com/api';

const headers = {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
    'Content-Type': 'application/json',
};

/**
 * Search for airport/city entity IDs needed for flight search
 */
async function searchAirport(query) {
    if (!RAPIDAPI_KEY) return null;
    try {
        const { data } = await axios.get(`${BASE_URL}/v1/flights/searchAirport`, {
            params: { query, locale: 'en-US' },
            headers,
            timeout: 8000,
        });
        const place = data?.data?.[0];
        if (!place) return null;
        return {
            skyId: place.skyId,
            entityId: place.entityId,
            name: place.presentation?.title || query,
        };
    } catch (err) {
        console.log('[flightService] Airport search failed:', err.message);
        return null;
    }
}

/**
 * Common IATA codes for major cities
 */
const CITY_CODES = {
    karachi: 'KHI', lahore: 'LHE', islamabad: 'ISB', peshawar: 'PEW',
    istanbul: 'IST', dubai: 'DXB', doha: 'DOH', jeddah: 'JED',
    london: 'LHR', paris: 'CDG', tokyo: 'NRT', bangkok: 'BKK',
    'kuala lumpur': 'KUL', singapore: 'SIN', 'new york': 'JFK', toronto: 'YYZ',
    cairo: 'CAI', riyadh: 'RUH', muscat: 'MCT', beijing: 'PEK',
    mumbai: 'BOM', delhi: 'DEL', dhaka: 'DAC', colombo: 'CMB',
};

/**
 * Get IATA code for a city name (best-effort lookup)
 */
function getCityCode(city) {
    const key = (city || '').toLowerCase().trim();
    return CITY_CODES[key] || city.slice(0, 3).toUpperCase();
}

/**
 * Returns realistic mock flight data when RapidAPI is unavailable or returns empty results
 * @param {string} from - Origin city name
 * @param {string} to - Destination city name
 * @returns {Array} Mock flight results matching the searchFlights return format
 */
function getMockFlights(from, to) {
    const fromCode = getCityCode(from);
    const toCode = getCityCode(to);

    console.log('[flightService] Using mock flight data for:', from, '→', to);

    return [
        {
            id: `mock-flight-1-${fromCode}-${toCode}`,
            price: 'PKR 85,000',
            priceRaw: 85000,
            airline: 'Turkish Airlines',
            airlineLogo: '',
            departure: '2025-08-01T08:30:00',
            arrival: '2025-08-01T14:00:00',
            duration: '5h 30m',
            stops: 0,
            origin: from,
            originCode: fromCode,
            destination: to,
            destinationCode: toCode,
        },
        {
            id: `mock-flight-2-${fromCode}-${toCode}`,
            price: 'PKR 72,000',
            priceRaw: 72000,
            airline: 'PIA',
            airlineLogo: '',
            departure: '2025-08-01T14:15:00',
            arrival: '2025-08-01T20:45:00',
            duration: '6h 30m',
            stops: 1,
            origin: from,
            originCode: fromCode,
            destination: to,
            destinationCode: toCode,
        },
        {
            id: `mock-flight-3-${fromCode}-${toCode}`,
            price: 'PKR 95,000',
            priceRaw: 95000,
            airline: 'Emirates',
            airlineLogo: '',
            departure: '2025-08-01T22:00:00',
            arrival: '2025-08-02T06:30:00',
            duration: '8h 30m',
            stops: 1,
            origin: from,
            originCode: fromCode,
            destination: to,
            destinationCode: toCode,
        },
    ];
}

/**
 * Search flights between two cities
 * @param {string} from - Origin city name (e.g., "Karachi")
 * @param {string} to - Destination city name (e.g., "Istanbul")
 * @param {string} date - Departure date YYYY-MM-DD
 * @param {object} options - { adults, cabinClass, currency }
 */
exports.searchFlights = async (from, to, date, options = {}) => {
    if (!RAPIDAPI_KEY) {
        console.log('[flightService] No RAPIDAPI_KEY set — returning mock data');
        return getMockFlights(from, to);
    }

    try {
        // Step 1: Get airport IDs
        const [origin, destination] = await Promise.all([
            searchAirport(from),
            searchAirport(to),
        ]);

        if (!origin || !destination) {
            console.log('[flightService] Could not find airports for:', from, to);
            return getMockFlights(from, to);
        }

        // Step 2: Search flights
        const { data } = await axios.get(`${BASE_URL}/v2/flights/searchFlightsComplete`, {
            params: {
                originSkyId: origin.skyId,
                destinationSkyId: destination.skyId,
                originEntityId: origin.entityId,
                destinationEntityId: destination.entityId,
                date,
                cabinClass: options.cabinClass || 'economy',
                adults: String(options.adults || 1),
                sortBy: 'best',
                currency: options.currency || 'USD',
                market: 'en-US',
                countryCode: 'US',
            },
            headers,
            timeout: 15000,
        });

        const itineraries = data?.data?.itineraries || [];

        const results = itineraries.slice(0, 5).map((itin) => {
            const leg = itin.legs?.[0];
            const carrier = leg?.carriers?.marketing?.[0];
            return {
                id: itin.id,
                price: itin.price?.formatted || 'N/A',
                priceRaw: itin.price?.raw || 0,
                airline: carrier?.name || 'Unknown',
                airlineLogo: carrier?.logoUrl || '',
                departure: leg?.departure || '',
                arrival: leg?.arrival || '',
                duration: leg?.durationInMinutes ? `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}m` : 'N/A',
                stops: leg?.stopCount || 0,
                origin: leg?.origin?.name || from,
                originCode: leg?.origin?.displayCode || '',
                destination: leg?.destination?.name || to,
                destinationCode: leg?.destination?.displayCode || '',
            };
        });

        // Fallback to mock data if RapidAPI returned empty results
        if (results.length === 0) {
            return getMockFlights(from, to);
        }

        return results;
    } catch (err) {
        console.log('[flightService] Flight search failed:', err.message);
        return getMockFlights(from, to);
    }
};

// Expose for testing
exports._getMockFlights = getMockFlights;
