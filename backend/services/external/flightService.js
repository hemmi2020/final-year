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
 * Search flights between two cities
 * @param {string} from - Origin city name (e.g., "Karachi")
 * @param {string} to - Destination city name (e.g., "Istanbul")
 * @param {string} date - Departure date YYYY-MM-DD
 * @param {object} options - { adults, cabinClass, currency }
 */
exports.searchFlights = async (from, to, date, options = {}) => {
    if (!RAPIDAPI_KEY) {
        console.log('[flightService] No RAPIDAPI_KEY set');
        return [];
    }

    try {
        // Step 1: Get airport IDs
        const [origin, destination] = await Promise.all([
            searchAirport(from),
            searchAirport(to),
        ]);

        if (!origin || !destination) {
            console.log('[flightService] Could not find airports for:', from, to);
            return [];
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

        return itineraries.slice(0, 5).map((itin) => {
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
    } catch (err) {
        console.log('[flightService] Flight search failed:', err.message);
        return [];
    }
};
