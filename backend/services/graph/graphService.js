const { getNeo4jDriver } = require('../../config/neo4j');

/**
 * Run a Cypher query against Neo4j
 */
const runQuery = async (cypher, params = {}) => {
    const driver = getNeo4jDriver();
    if (!driver) return [];
    const session = driver.session();
    try {
        const result = await session.run(cypher, params);
        return result.records;
    } catch (error) {
        console.warn('Neo4j query error:', error.message);
        return [];
    } finally {
        await session.close();
    }
};

/**
 * Initialize graph schema indexes
 */
exports.initializeSchema = async () => {
    try {
        await runQuery('CREATE INDEX destination_name IF NOT EXISTS FOR (d:Destination) ON (d.name)');
        await runQuery('CREATE INDEX poi_name IF NOT EXISTS FOR (p:POI) ON (p.name)');
        await runQuery('CREATE INDEX tag_name IF NOT EXISTS FOR (t:Tag) ON (t.name)');
        console.log('✅ Neo4j schema initialized');
    } catch (error) {
        console.warn('Schema init error:', error.message);
    }
};

/**
 * Add a destination node
 */
exports.addDestination = async (data) => {
    const { name, country, lat, lng, description } = data;
    const records = await runQuery(
        `MERGE (d:Destination {name: $name})
         SET d.country = $country, d.lat = $lat, d.lng = $lng, d.description = $description, d.updatedAt = datetime()
         RETURN d`,
        { name, country, lat: parseFloat(lat), lng: parseFloat(lng), description }
    );
    return records[0]?.get('d')?.properties;
};

/**
 * Add a POI (restaurant, attraction, hotel) with tags
 */
exports.addPOI = async (data) => {
    const { name, type, destination, lat, lng, description, tags = [] } = data;
    await runQuery(
        `MERGE (poi:POI {name: $name})
         SET poi.type = $type, poi.lat = $lat, poi.lng = $lng, poi.description = $description, poi.updatedAt = datetime()
         MERGE (dest:Destination {name: $destination})
         MERGE (poi)-[:LOCATED_IN]->(dest)
         WITH poi
         UNWIND $tags as tagName
         MERGE (tag:Tag {name: tagName})
         MERGE (poi)-[:HAS_TAG]->(tag)`,
        { name, type, destination, lat: parseFloat(lat), lng: parseFloat(lng), description, tags }
    );
};

/**
 * Create proximity relationships between nearby POIs
 */
exports.createProximityRelationships = async (maxDistance = 2000) => {
    await runQuery(
        `MATCH (p1:POI), (p2:POI)
         WHERE id(p1) < id(p2)
         WITH p1, p2,
              point.distance(point({latitude: p1.lat, longitude: p1.lng}),
                             point({latitude: p2.lat, longitude: p2.lng})) AS dist
         WHERE dist < $maxDistance
         MERGE (p1)-[r:NEAR]->(p2)
         SET r.distance = dist`,
        { maxDistance }
    );
    console.log('✅ Proximity relationships created');
};

/**
 * Graph RAG Search — combines tag filtering with graph traversal
 */
exports.graphRAGSearch = async (destination, tags = []) => {
    try {
        if (!getNeo4jDriver()) return { restaurants: [], attractions: [] };

        // Search restaurants by tags in destination
        const restaurantRecords = await runQuery(
            `MATCH (d:Destination {name: $destination})-[:HAS_RESTAURANT]->(r:Restaurant)
             OPTIONAL MATCH (r)-[:HAS_TAG]->(t:Tag)
             WHERE t IS NULL OR t.name IN $tags OR size($tags) = 0
             RETURN r.name AS name, r.rating AS rating, r.priceLevel AS priceLevel,
                    collect(DISTINCT t.name) AS tags
             ORDER BY r.rating DESC`,
            { destination, tags }
        );

        // Also search POI nodes (from addPOI)
        const poiRestaurants = await runQuery(
            `MATCH (poi:POI)-[:LOCATED_IN]->(d:Destination {name: $destination})
             WHERE poi.type = 'restaurant'
             OPTIONAL MATCH (poi)-[:HAS_TAG]->(t:Tag)
             WHERE t IS NULL OR t.name IN $tags OR size($tags) = 0
             RETURN poi.name AS name, poi.description AS description,
                    collect(DISTINCT t.name) AS tags`,
            { destination, tags }
        );

        // Search attractions
        const attractionRecords = await runQuery(
            `MATCH (d:Destination {name: $destination})-[:HAS_ATTRACTION]->(a:Attraction)
             OPTIONAL MATCH (a)-[:HAS_TAG]->(t:Tag)
             RETURN a.name AS name, a.type AS type, a.rating AS rating,
                    collect(DISTINCT t.name) AS tags
             ORDER BY a.rating DESC`,
            { destination }
        );

        // Also search POI attractions
        const poiAttractions = await runQuery(
            `MATCH (poi:POI)-[:LOCATED_IN]->(d:Destination {name: $destination})
             WHERE poi.type = 'attraction'
             OPTIONAL MATCH (poi)-[:HAS_TAG]->(t:Tag)
             RETURN poi.name AS name, poi.type AS type, poi.description AS description,
                    collect(DISTINCT t.name) AS tags`,
            { destination }
        );

        const restaurants = [
            ...restaurantRecords.map(r => ({ name: r.get('name'), rating: r.get('rating'), priceLevel: r.get('priceLevel'), tags: r.get('tags') })),
            ...poiRestaurants.map(r => ({ name: r.get('name'), description: r.get('description'), tags: r.get('tags') })),
        ];
        const attractions = [
            ...attractionRecords.map(a => ({ name: a.get('name'), type: a.get('type'), rating: a.get('rating'), tags: a.get('tags') })),
            ...poiAttractions.map(a => ({ name: a.get('name'), type: a.get('type'), description: a.get('description'), tags: a.get('tags') })),
        ];

        return { restaurants, attractions };
    } catch (error) {
        console.warn('Graph RAG search error:', error.message);
        return { restaurants: [], attractions: [] };
    }
};

/**
 * Find halal food near a location using graph spatial queries
 */
exports.findHalalNearLocation = async (lat, lng, radius = 5000) => {
    try {
        if (!getNeo4jDriver()) return [];
        const records = await runQuery(
            `MATCH (poi:POI)-[:HAS_TAG]->(halal:Tag {name: "halal"})
             WHERE poi.type = "restaurant"
             WITH poi,
                  point.distance(point({latitude: $lat, longitude: $lng}),
                                 point({latitude: poi.lat, longitude: poi.lng})) AS distance
             WHERE distance < $radius
             OPTIONAL MATCH (poi)-[:LOCATED_IN]->(dest:Destination)
             OPTIONAL MATCH (poi)-[near:NEAR]-(nearby:POI)
             WHERE near.distance < 500 AND nearby.type = "attraction"
             RETURN poi, dest, distance,
                    collect(DISTINCT nearby.name)[0..3] as nearbyAttractions
             ORDER BY distance ASC
             LIMIT 20`,
            { lat, lng, radius }
        );
        return records.map(r => ({
            restaurant: r.get('poi')?.properties,
            destination: r.get('dest')?.properties,
            distance: Math.round(r.get('distance')),
            nearbyAttractions: r.get('nearbyAttractions'),
        }));
    } catch (error) {
        console.warn('Halal search error:', error.message);
        return [];
    }
};

/**
 * Get personalized recommendations based on user preferences + graph
 */
exports.getPersonalizedRecommendations = async (userId, userPreferences, destination) => {
    try {
        if (!getNeo4jDriver()) return [];
        const { dietary = [], interests = [] } = userPreferences;
        const preferredTags = [...dietary, ...interests];
        if (preferredTags.length === 0) preferredTags.push('family-friendly');

        const records = await runQuery(
            `MATCH (poi:POI)-[:LOCATED_IN]->(dest:Destination {name: $destination})
             OPTIONAL MATCH (poi)-[:HAS_TAG]->(tag:Tag)
             WHERE tag.name IN $preferredTags
             WITH poi, collect(DISTINCT tag.name) as matchedTags
             WHERE size(matchedTags) > 0
             OPTIONAL MATCH (poi)-[near:NEAR]-(nearby:POI)
             RETURN poi, matchedTags,
                    size(matchedTags) as relevanceScore,
                    collect(DISTINCT nearby.name)[0..3] as nearbyPOIs
             ORDER BY relevanceScore DESC
             LIMIT 20`,
            { destination, preferredTags }
        );
        return records.map(r => ({
            poi: r.get('poi')?.properties,
            matchedPreferences: r.get('matchedTags'),
            relevanceScore: r.get('relevanceScore'),
            nearby: r.get('nearbyPOIs'),
        }));
    } catch (error) {
        console.warn('Personalized recommendations error:', error.message);
        return [];
    }
};

/**
 * Find nearby POIs
 */
exports.findNearby = async (destination, restaurantTags, attractionTags) => {
    try {
        if (!getNeo4jDriver()) return [];
        const records = await runQuery(
            `MATCH (d:Destination {name: $destination})-[:HAS_RESTAURANT]->(r:Restaurant)-[:NEAR]->(a:Attraction)
             OPTIONAL MATCH (r)-[:HAS_TAG]->(rt:Tag) WHERE rt.name IN $rTags
             OPTIONAL MATCH (a)-[:HAS_TAG]->(at:Tag) WHERE at.name IN $aTags
             RETURN r.name AS restaurant, a.name AS attraction,
                    collect(DISTINCT rt.name) AS rTags, collect(DISTINCT at.name) AS aTags`,
            { destination, rTags: restaurantTags || [], aTags: attractionTags || [] }
        );
        return records.map(r => ({
            restaurant: r.get('restaurant'),
            attraction: r.get('attraction'),
            restaurantTags: r.get('rTags'),
            attractionTags: r.get('aTags'),
        }));
    } catch (error) {
        console.warn('Find nearby error:', error.message);
        return [];
    }
};

exports.runQuery = runQuery;
