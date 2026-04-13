const axios = require('axios');

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

const FALLBACK_RESTAURANTS = {
    tokyo: [
        { name: 'Sukiyabashi Jiro', cuisine: 'Sushi', address: 'Ginza, Chuo City, Tokyo', dietary: {}, isFallback: true },
        { name: 'Ichiran Ramen', cuisine: 'Ramen', address: 'Shibuya, Tokyo', dietary: {}, isFallback: true },
        { name: 'Tsuta', cuisine: 'Ramen', address: 'Toshima City, Tokyo', dietary: {}, isFallback: true },
        { name: 'Narisawa', cuisine: 'French-Japanese', address: 'Minato City, Tokyo', dietary: {}, isFallback: true },
        { name: 'Gonpachi', cuisine: 'Japanese', address: 'Nishi-Azabu, Minato City, Tokyo', dietary: {}, isFallback: true },
        { name: 'Afuri', cuisine: 'Ramen', address: 'Ebisu, Shibuya, Tokyo', dietary: {}, isFallback: true },
        { name: 'Tonkatsu Maisen', cuisine: 'Japanese', address: 'Shibuya, Tokyo', dietary: {}, isFallback: true },
        { name: 'Den', cuisine: 'Japanese', address: 'Jingumae, Shibuya, Tokyo', dietary: {}, isFallback: true },
    ],
    istanbul: [
        { name: 'Nusr-Et Steakhouse', cuisine: 'Turkish', address: 'Etiler, Istanbul', dietary: {}, isFallback: true },
        { name: 'Mikla', cuisine: 'Turkish-Nordic', address: 'Beyoglu, Istanbul', dietary: {}, isFallback: true },
        { name: 'Ciya Sofrasi', cuisine: 'Turkish', address: 'Kadikoy, Istanbul', dietary: {}, isFallback: true },
        { name: 'Karakoy Lokantasi', cuisine: 'Turkish', address: 'Karakoy, Istanbul', dietary: {}, isFallback: true },
        { name: 'Hafiz Mustafa', cuisine: 'Turkish Desserts', address: 'Sultanahmet, Istanbul', dietary: {}, isFallback: true },
        { name: 'Sultanahmet Koftecisi', cuisine: 'Turkish', address: 'Sultanahmet, Istanbul', dietary: {}, isFallback: true },
        { name: 'Pandeli', cuisine: 'Turkish', address: 'Eminonu, Istanbul', dietary: {}, isFallback: true },
        { name: 'Asitane', cuisine: 'Ottoman', address: 'Edirnekapi, Istanbul', dietary: {}, isFallback: true },
    ],
    paris: [
        { name: 'Le Jules Verne', cuisine: 'French', address: 'Eiffel Tower, Paris', dietary: {}, isFallback: true },
        { name: 'Le Comptoir du Pantheon', cuisine: 'French', address: '5th Arrondissement, Paris', dietary: {}, isFallback: true },
        { name: 'Chez Janou', cuisine: 'French', address: 'Le Marais, Paris', dietary: {}, isFallback: true },
        { name: 'Le Bouillon Chartier', cuisine: 'French', address: '9th Arrondissement, Paris', dietary: {}, isFallback: true },
        { name: 'Breizh Cafe', cuisine: 'Creperie', address: 'Le Marais, Paris', dietary: {}, isFallback: true },
        { name: 'Le Relais de l\'Entrecote', cuisine: 'French', address: '6th Arrondissement, Paris', dietary: {}, isFallback: true },
        { name: 'Pink Mamma', cuisine: 'Italian', address: '10th Arrondissement, Paris', dietary: {}, isFallback: true },
        { name: 'L\'Ambroisie', cuisine: 'French', address: 'Place des Vosges, Paris', dietary: {}, isFallback: true },
    ],
    dubai: [
        { name: 'Al Mahara', cuisine: 'Seafood', address: 'Burj Al Arab, Dubai', dietary: {}, isFallback: true },
        { name: 'Pierchic', cuisine: 'Seafood', address: 'Al Qasr, Madinat Jumeirah, Dubai', dietary: {}, isFallback: true },
        { name: 'Ravi Restaurant', cuisine: 'Pakistani', address: 'Satwa, Dubai', dietary: {}, isFallback: true },
        { name: 'Al Ustad Special Kabab', cuisine: 'Iranian', address: 'Al Fahidi, Dubai', dietary: {}, isFallback: true },
        { name: 'Zuma', cuisine: 'Japanese', address: 'DIFC, Dubai', dietary: {}, isFallback: true },
        { name: 'La Petite Maison', cuisine: 'French', address: 'DIFC, Dubai', dietary: {}, isFallback: true },
        { name: 'Arabian Tea House', cuisine: 'Emirati', address: 'Al Fahidi, Dubai', dietary: {}, isFallback: true },
        { name: 'Tresind Studio', cuisine: 'Indian', address: 'DIFC, Dubai', dietary: {}, isFallback: true },
    ],
    bali: [
        { name: 'Locavore', cuisine: 'Indonesian-European', address: 'Ubud, Bali', dietary: {}, isFallback: true },
        { name: 'Mozaic', cuisine: 'French-Indonesian', address: 'Ubud, Bali', dietary: {}, isFallback: true },
        { name: 'Warung Babi Guling Ibu Oka', cuisine: 'Balinese', address: 'Ubud, Bali', dietary: {}, isFallback: true },
        { name: 'Merah Putih', cuisine: 'Indonesian', address: 'Seminyak, Bali', dietary: {}, isFallback: true },
        { name: 'La Lucciola', cuisine: 'Italian-Indonesian', address: 'Seminyak, Bali', dietary: {}, isFallback: true },
        { name: 'Bambu', cuisine: 'Indonesian', address: 'Seminyak, Bali', dietary: {}, isFallback: true },
        { name: 'Sardine', cuisine: 'Seafood', address: 'Seminyak, Bali', dietary: {}, isFallback: true },
        { name: 'Naughty Nuri\'s', cuisine: 'BBQ', address: 'Ubud, Bali', dietary: {}, isFallback: true },
    ],
    london: [
        { name: 'Dishoom', cuisine: 'Indian', address: 'Covent Garden, London', dietary: {}, isFallback: true },
        { name: 'Sketch', cuisine: 'European', address: 'Mayfair, London', dietary: {}, isFallback: true },
        { name: 'The Ledbury', cuisine: 'British', address: 'Notting Hill, London', dietary: {}, isFallback: true },
        { name: 'Padella', cuisine: 'Italian', address: 'Borough Market, London', dietary: {}, isFallback: true },
        { name: 'Flat Iron', cuisine: 'Steakhouse', address: 'Soho, London', dietary: {}, isFallback: true },
        { name: 'Bao', cuisine: 'Taiwanese', address: 'Soho, London', dietary: {}, isFallback: true },
        { name: 'Duck & Waffle', cuisine: 'British', address: 'Liverpool Street, London', dietary: {}, isFallback: true },
        { name: 'Hawksmoor', cuisine: 'Steakhouse', address: 'Covent Garden, London', dietary: {}, isFallback: true },
    ],
    'new york': [
        { name: 'Peter Luger Steak House', cuisine: 'Steakhouse', address: 'Williamsburg, Brooklyn, NY', dietary: {}, isFallback: true },
        { name: 'Le Bernardin', cuisine: 'French-Seafood', address: 'Midtown, Manhattan, NY', dietary: {}, isFallback: true },
        { name: 'Joe\'s Pizza', cuisine: 'Pizza', address: 'Greenwich Village, Manhattan, NY', dietary: {}, isFallback: true },
        { name: 'Katz\'s Delicatessen', cuisine: 'Deli', address: 'Lower East Side, Manhattan, NY', dietary: {}, isFallback: true },
        { name: 'Shake Shack', cuisine: 'Burgers', address: 'Madison Square Park, Manhattan, NY', dietary: {}, isFallback: true },
        { name: 'Di Fara Pizza', cuisine: 'Pizza', address: 'Midwood, Brooklyn, NY', dietary: {}, isFallback: true },
        { name: 'Eleven Madison Park', cuisine: 'American', address: 'Flatiron, Manhattan, NY', dietary: {}, isFallback: true },
        { name: 'Momofuku Noodle Bar', cuisine: 'Asian Fusion', address: 'East Village, Manhattan, NY', dietary: {}, isFallback: true },
    ],
    bangkok: [
        { name: 'Gaggan Anand', cuisine: 'Indian-Thai', address: 'Lumpini, Bangkok', dietary: {}, isFallback: true },
        { name: 'Jay Fai', cuisine: 'Thai Street Food', address: 'Phra Nakhon, Bangkok', dietary: {}, isFallback: true },
        { name: 'Nahm', cuisine: 'Thai', address: 'Sathorn, Bangkok', dietary: {}, isFallback: true },
        { name: 'Thipsamai', cuisine: 'Thai', address: 'Phra Nakhon, Bangkok', dietary: {}, isFallback: true },
        { name: 'Bo.Lan', cuisine: 'Thai', address: 'Sukhumvit, Bangkok', dietary: {}, isFallback: true },
        { name: 'Raan Jay Fai', cuisine: 'Thai', address: 'Mahachai Road, Bangkok', dietary: {}, isFallback: true },
        { name: 'Som Tam Nua', cuisine: 'Thai', address: 'Siam Square, Bangkok', dietary: {}, isFallback: true },
        { name: 'Issaya Siamese Club', cuisine: 'Thai', address: 'Sathorn, Bangkok', dietary: {}, isFallback: true },
    ],
    rome: [
        { name: 'Da Enzo al 29', cuisine: 'Italian', address: 'Trastevere, Rome', dietary: {}, isFallback: true },
        { name: 'Roscioli', cuisine: 'Italian', address: 'Centro Storico, Rome', dietary: {}, isFallback: true },
        { name: 'Armando al Pantheon', cuisine: 'Italian', address: 'Pantheon, Rome', dietary: {}, isFallback: true },
        { name: 'La Pergola', cuisine: 'Italian', address: 'Monte Mario, Rome', dietary: {}, isFallback: true },
        { name: 'Pizzarium', cuisine: 'Pizza', address: 'Prati, Rome', dietary: {}, isFallback: true },
        { name: 'Tonnarello', cuisine: 'Italian', address: 'Trastevere, Rome', dietary: {}, isFallback: true },
        { name: 'Supplizio', cuisine: 'Italian Street Food', address: 'Centro Storico, Rome', dietary: {}, isFallback: true },
        { name: 'Il Pagliaccio', cuisine: 'Italian', address: 'Via dei Banchi Vecchi, Rome', dietary: {}, isFallback: true },
    ],
    barcelona: [
        { name: 'Tickets', cuisine: 'Tapas', address: 'Paral·lel, Barcelona', dietary: {}, isFallback: true },
        { name: 'Cal Pep', cuisine: 'Seafood-Tapas', address: 'Born, Barcelona', dietary: {}, isFallback: true },
        { name: 'Cerveceria Catalana', cuisine: 'Tapas', address: 'Eixample, Barcelona', dietary: {}, isFallback: true },
        { name: 'La Boqueria', cuisine: 'Market Food', address: 'La Rambla, Barcelona', dietary: {}, isFallback: true },
        { name: 'Can Culleretes', cuisine: 'Catalan', address: 'Gothic Quarter, Barcelona', dietary: {}, isFallback: true },
        { name: 'Disfrutar', cuisine: 'Spanish', address: 'Eixample, Barcelona', dietary: {}, isFallback: true },
        { name: 'Quimet & Quimet', cuisine: 'Tapas', address: 'Poble Sec, Barcelona', dietary: {}, isFallback: true },
        { name: 'El Nacional', cuisine: 'Spanish', address: 'Passeig de Gracia, Barcelona', dietary: {}, isFallback: true },
    ],
    maldives: [
        { name: 'Ithaa Undersea Restaurant', cuisine: 'European', address: 'Conrad Maldives, Rangali Island', dietary: {}, isFallback: true },
        { name: 'Sea Fire Salt', cuisine: 'Grill', address: 'Anantara Dhigu, South Male Atoll', dietary: {}, isFallback: true },
        { name: 'Muraka', cuisine: 'International', address: 'Niyama Private Islands, Dhaalu Atoll', dietary: {}, isFallback: true },
        { name: 'Fashala', cuisine: 'Maldivian', address: 'Soneva Fushi, Baa Atoll', dietary: {}, isFallback: true },
        { name: 'The Lighthouse', cuisine: 'International', address: 'Baros Maldives, North Male Atoll', dietary: {}, isFallback: true },
        { name: 'Azara', cuisine: 'Asian', address: 'One&Only Reethi Rah, North Male Atoll', dietary: {}, isFallback: true },
        { name: 'Jing', cuisine: 'Asian', address: 'One&Only Reethi Rah, North Male Atoll', dietary: {}, isFallback: true },
        { name: 'Maalan Buffet', cuisine: 'Maldivian', address: 'Male City, Maldives', dietary: {}, isFallback: true },
    ],
    lahore: [
        { name: "Cuckoo's Den", cuisine: 'Pakistani', address: 'Heera Mandi, Old Lahore', dietary: { halal: true }, isFallback: true },
        { name: 'Haveli Restaurant', cuisine: 'Mughlai', address: 'Food Street, Old Lahore', dietary: { halal: true }, isFallback: true },
        { name: 'Butt Karahi', cuisine: 'Pakistani', address: 'Lakshmi Chowk, Lahore', dietary: { halal: true }, isFallback: true },
        { name: 'Andaaz Restaurant', cuisine: 'Pakistani', address: 'Upper Mall, Lahore', dietary: { halal: true }, isFallback: true },
        { name: 'Food Street Lahore', cuisine: 'Street Food', address: 'Fort Road, Old Lahore', dietary: { halal: true }, isFallback: true },
        { name: 'Saloos', cuisine: 'Continental', address: 'M.M. Alam Road, Gulberg, Lahore', dietary: { halal: true }, isFallback: true },
        { name: 'Cafe Zouk', cuisine: 'Cafe', address: 'M.M. Alam Road, Gulberg, Lahore', dietary: { halal: true }, isFallback: true },
        { name: 'Bundu Khan', cuisine: 'BBQ', address: 'Liberty Market, Lahore', dietary: { halal: true }, isFallback: true },
    ],
    karachi: [
        { name: 'BBQ Tonight', cuisine: 'BBQ', address: 'Boat Basin, Clifton, Karachi', dietary: { halal: true }, isFallback: true },
        { name: 'Kolachi', cuisine: 'Pakistani', address: 'Do Darya, DHA Phase 8, Karachi', dietary: { halal: true }, isFallback: true },
        { name: 'Okra', cuisine: 'Mediterranean', address: 'Zamzama, DHA Phase 5, Karachi', dietary: { halal: true }, isFallback: true },
        { name: "Xander's", cuisine: 'Continental', address: 'Khayaban-e-Shahbaz, DHA, Karachi', dietary: { halal: true }, isFallback: true },
        { name: 'Do Darya', cuisine: 'Seafood', address: 'DHA Phase 8, Karachi', dietary: { halal: true }, isFallback: true },
        { name: 'Burns Garden', cuisine: 'Pakistani', address: 'Burns Garden, Karachi', dietary: { halal: true }, isFallback: true },
        { name: 'Cafe Flo', cuisine: 'French', address: 'PIDC, Karachi', dietary: { halal: true }, isFallback: true },
        { name: 'Student Biryani', cuisine: 'Biryani', address: 'University Road, Karachi', dietary: { halal: true }, isFallback: true },
    ],
    islamabad: [
        { name: 'Monal', cuisine: 'Pakistani', address: 'Pir Sohawa, Margalla Hills, Islamabad', dietary: { halal: true }, isFallback: true },
        { name: 'Tuscany Courtyard', cuisine: 'Italian', address: 'Kohsar Market, F-6, Islamabad', dietary: { halal: true }, isFallback: true },
        { name: 'Savour Foods', cuisine: 'Pakistani', address: 'F-7 Markaz, Islamabad', dietary: { halal: true }, isFallback: true },
        { name: 'Des Pardes', cuisine: 'Pakistani', address: 'F-7 Markaz, Islamabad', dietary: { halal: true }, isFallback: true },
        { name: 'Burning Brownie', cuisine: 'Cafe', address: 'F-7 Markaz, Islamabad', dietary: { halal: true }, isFallback: true },
        { name: 'La Montana', cuisine: 'Italian', address: 'F-11 Markaz, Islamabad', dietary: { halal: true }, isFallback: true },
        { name: 'Howdy', cuisine: 'American', address: 'F-7 Markaz, Islamabad', dietary: { halal: true }, isFallback: true },
        { name: 'Chaaye Khana', cuisine: 'Cafe', address: 'Saidpur Village, Islamabad', dietary: { halal: true }, isFallback: true },
    ],
    marrakech: [
        { name: 'Le Jardin', cuisine: 'Moroccan', address: 'Medina, Marrakech', dietary: {}, isFallback: true },
        { name: 'Nomad', cuisine: 'Moroccan', address: 'Derb Aarjan, Medina, Marrakech', dietary: {}, isFallback: true },
        { name: 'Cafe des Epices', cuisine: 'Moroccan', address: 'Rahba Lakdima, Medina, Marrakech', dietary: {}, isFallback: true },
        { name: 'Al Fassia', cuisine: 'Moroccan', address: 'Gueliz, Marrakech', dietary: {}, isFallback: true },
        { name: 'La Mamounia', cuisine: 'Moroccan-French', address: 'Avenue Bab Jdid, Marrakech', dietary: {}, isFallback: true },
        { name: 'Dar Yacout', cuisine: 'Moroccan', address: 'Medina, Marrakech', dietary: {}, isFallback: true },
        { name: 'Pepe Nero', cuisine: 'Italian-Moroccan', address: 'Medina, Marrakech', dietary: {}, isFallback: true },
        { name: 'Amal Restaurant', cuisine: 'Moroccan', address: 'Gueliz, Marrakech', dietary: {}, isFallback: true },
    ],
};

/**
 * Geocode a place name to coordinates using Nominatim (free, no API key)
 */
exports.geocode = async (placeName) => {
    try {
        const { data } = await axios.get(`${NOMINATIM_API}/search`, {
            params: { q: placeName, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'TravelFyAI/1.0', 'Accept-Language': 'en' },
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

        // Fallback for empty restaurant results using known city data
        if (results.length === 0 && type === 'restaurant') {
            const cityName = query.toLowerCase().trim();
            if (FALLBACK_RESTAURANTS[cityName]) {
                return FALLBACK_RESTAURANTS[cityName];
            }
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
