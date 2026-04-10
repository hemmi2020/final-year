const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const cache = {};

/**
 * Extract destination from AI text and geocode it via Mapbox
 */
export async function extractDestinationFromText(text) {
    if (!text || !MAPBOX_TOKEN) return null;

    // Pattern match city names from AI responses
    const patterns = [
        /(?:trip to|traveling to|visiting|heading to|itinerary for|in)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})/g,
        /(?:Welcome to|Explore|Discover)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})/g,
    ];

    // Also check known cities directly
    const knownCities = [
        "Tokyo", "Istanbul", "Paris", "Dubai", "London", "New York", "Bali", "Rome",
        "Barcelona", "Sydney", "Melbourne", "Bangkok", "Singapore", "Cairo", "Marrakech",
        "Maldives", "Santorini", "Amsterdam", "Prague", "Vienna", "Seoul", "Kyoto",
        "Lisbon", "Athens", "Berlin", "Munich", "Zurich", "Milan", "Florence",
        "Venice", "Kuala Lumpur", "Hong Kong", "Shanghai", "Beijing", "Mumbai",
        "Delhi", "Lahore", "Karachi", "Islamabad", "Mecca", "Medina", "Doha",
    ];

    let cityName = knownCities.find((c) => text.includes(c));

    if (!cityName) {
        for (const pattern of patterns) {
            const match = pattern.exec(text);
            if (match) { cityName = match[1]; break; }
        }
    }

    if (!cityName) return null;

    // Check cache
    if (cache[cityName]) return cache[cityName];

    try {
        const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${MAPBOX_TOKEN}&types=place,region,country&limit=1`
        );
        const data = await res.json();
        if (data.features?.[0]) {
            const feature = data.features[0];
            const [lng, lat] = feature.center;
            const placeType = feature.place_type?.[0] || "place";
            const result = { name: cityName, lat, lng, placeType };
            cache[cityName] = result;
            return result;
        }
    } catch { }

    return null;
}
