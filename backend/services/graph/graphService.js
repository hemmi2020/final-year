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
        return result.records.map(r => r.toObject());
    } finally {
        await session.close();
    }
};

/**
 * Graph RAG search — find places matching tags near other tagged places
 * e.g., "halal restaurants NEAR family-friendly attractions in Tokyo"
 */
exports.graphRAGSearch = async (destination, tags = []) => {
    try {
        if (!getNeo4jDriver()) return { restaurants: [], attractions: [] };

        const restaurants = await runQuery(
            `MATCH (d:Destination {name: $destination})-[:HAS_RESTAURANT]->(r:Restaurant)-[:HAS_TAG]->(t:Tag)
       WHERE t.name IN $tags
       RETURN r.name AS name, r.lat AS lat, r.lng AS lng, r.priceLevel AS priceLevel, r.rating AS rating,
              collect(t.name) AS tags
       ORDER BY r.rating DESC LIMIT 10`,
            { destination, tags }
        );

        const attractions = await runQuery(
            `MATCH (d:Destination {name: $destination})-[:HAS_ATTRACTION]->(a:Attraction)-[:HAS_TAG]->(t:Tag)
       WHERE t.name IN $tags OR size($tags) = 0
       RETURN a.name AS name, a.lat AS lat, a.lng AS lng, a.type AS type, a.rating AS rating,
              collect(t.name) AS tags
       ORDER BY a.rating DESC LIMIT 10`,
            { destination, tags }
        );

        return { restaurants, attractions };
    } catch (error) {
        console.warn('Graph RAG search error:', error.message);
        return { restaurants: [], attractions: [] };
    }
};

/**
 * Find restaurants near specific attractions
 */
exports.findNearby = async (destination, restaurantTags, attractionTags) => {
    try {
        if (!getNeo4jDriver()) return [];

        return await runQuery(
            `MATCH (d:Destination {name: $destination})-[:HAS_RESTAURANT]->(r:Restaurant)-[:NEAR]->(a:Attraction),
             (r)-[:HAS_TAG]->(rt:Tag), (a)-[:HAS_TAG]->(at:Tag)
       WHERE rt.name IN $restaurantTags AND at.name IN $attractionTags
       RETURN r.name AS restaurant, a.name AS attraction,
              r.rating AS restaurantRating, a.rating AS attractionRating,
              collect(DISTINCT rt.name) AS restaurantTags, collect(DISTINCT at.name) AS attractionTags
       ORDER BY r.rating DESC LIMIT 10`,
            { destination, restaurantTags, attractionTags }
        );
    } catch (error) {
        console.warn('Graph nearby search error:', error.message);
        return [];
    }
};

exports.runQuery = runQuery;
