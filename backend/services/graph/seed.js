require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { connectNeo4j, getNeo4jDriver, closeNeo4j } = require('../../config/neo4j');

const seedData = async () => {
  await connectNeo4j();
  const driver = getNeo4jDriver();
  if (!driver) { console.log('❌ Cannot seed — Neo4j not connected'); process.exit(1); }

  const session = driver.session();
  try {
    // Clear existing data
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('🗑️  Cleared existing graph data');

    // Create indexes
    await session.run('CREATE INDEX destination_name IF NOT EXISTS FOR (d:Destination) ON (d.name)');
    await session.run('CREATE INDEX poi_name IF NOT EXISTS FOR (p:POI) ON (p.name)');
    await session.run('CREATE INDEX tag_name IF NOT EXISTS FOR (t:Tag) ON (t.name)');

    // Create Tags
    const tags = ['halal', 'vegan', 'vegetarian', 'family-friendly', 'unesco', 'budget', 'moderate', 'luxury',
      'adventure', 'history', 'food', 'nature', 'culture', 'art', 'technology', 'indoor', 'outdoor', 'free',
      'japanese', 'ramen', 'bbq', 'turkish', 'french'];
    for (const tag of tags) {
      await session.run('CREATE (:Tag {name: $name})', { name: tag });
    }
    console.log('✅ Tags created');

    // ─── TOKYO ───
    await session.run(`CREATE (d:Destination {name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, description: 'Capital of Japan, blend of traditional and modern'})`);

    // Tokyo Restaurants (as both Restaurant and POI nodes)
    await session.run(`
            MATCH (d:Destination {name: 'Tokyo'})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Naritakaya Halal Ramen', lat: 35.6895, lng: 139.6917, priceLevel: 2, rating: 4.5})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Gyumon Halal Yakiniku', lat: 35.6580, lng: 139.7016, priceLevel: 3, rating: 4.3})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Afuri Vegan Ramen', lat: 35.6614, lng: 139.7040, priceLevel: 2, rating: 4.4})
        `);
    // Tokyo POI restaurants
    await session.run(`
            MATCH (d:Destination {name: 'Tokyo'})
            CREATE (poi1:POI {name: 'Naritakaya Halal Ramen', type: 'restaurant', lat: 35.6895, lng: 139.6917, description: 'Authentic halal ramen in Asakusa'})-[:LOCATED_IN]->(d)
            CREATE (poi2:POI {name: 'Gyumon Halal Yakiniku', type: 'restaurant', lat: 35.6580, lng: 139.7016, description: 'Premium halal Japanese BBQ'})-[:LOCATED_IN]->(d)
            CREATE (poi3:POI {name: 'Afuri Vegan Ramen', type: 'restaurant', lat: 35.6614, lng: 139.7040, description: 'Popular vegan ramen chain'})-[:LOCATED_IN]->(d)
        `);

    // Tokyo Attractions
    await session.run(`
            MATCH (d:Destination {name: 'Tokyo'})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Senso-ji Temple', lat: 35.7148, lng: 139.7967, type: 'temple', rating: 4.7})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'TeamLab Borderless', lat: 35.6267, lng: 139.7840, type: 'museum', rating: 4.8})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Meiji Shrine', lat: 35.6764, lng: 139.6993, type: 'shrine', rating: 4.6})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Tokyo Tower', lat: 35.6586, lng: 139.7454, type: 'landmark', rating: 4.5})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Yoyogi Park', lat: 35.6719, lng: 139.6969, type: 'park', rating: 4.4})
        `);
    // Tokyo POI attractions
    await session.run(`
            MATCH (d:Destination {name: 'Tokyo'})
            CREATE (:POI {name: 'Senso-ji Temple', type: 'attraction', lat: 35.7148, lng: 139.7967, description: 'Ancient Buddhist temple in Asakusa'})-[:LOCATED_IN]->(d)
            CREATE (:POI {name: 'TeamLab Borderless', type: 'attraction', lat: 35.6267, lng: 139.7840, description: 'Interactive digital art museum'})-[:LOCATED_IN]->(d)
            CREATE (:POI {name: 'Yoyogi Park', type: 'attraction', lat: 35.6719, lng: 139.6969, description: 'Large park near Shibuya'})-[:LOCATED_IN]->(d)
        `);
    // Tokyo Hotel
    await session.run(`
            MATCH (d:Destination {name: 'Tokyo'})
            CREATE (:POI {name: 'Keio Plaza Hotel', type: 'hotel', lat: 35.6937, lng: 139.6961, description: 'Muslim-friendly hotel in Shinjuku'})-[:LOCATED_IN]->(d)
        `);

    // ─── ISTANBUL ───
    await session.run(`CREATE (d:Destination {name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, description: 'Where East meets West, ancient mosques and vibrant bazaars'})`);
    await session.run(`
            MATCH (d:Destination {name: 'Istanbul'})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Sultanahmet Koftecisi', lat: 41.0054, lng: 28.9768, priceLevel: 1, rating: 4.6})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Hafiz Mustafa 1864', lat: 41.0110, lng: 28.9714, priceLevel: 2, rating: 4.7})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Karakoy Lokantasi', lat: 41.0220, lng: 28.9740, priceLevel: 2, rating: 4.5})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Hagia Sophia', lat: 41.0086, lng: 28.9802, type: 'mosque', rating: 4.9})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Blue Mosque', lat: 41.0054, lng: 28.9768, type: 'mosque', rating: 4.8})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Grand Bazaar', lat: 41.0107, lng: 28.9680, type: 'market', rating: 4.5})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Topkapi Palace', lat: 41.0115, lng: 28.9833, type: 'palace', rating: 4.7})
        `);
    await session.run(`
            MATCH (d:Destination {name: 'Istanbul'})
            CREATE (:POI {name: 'Sultanahmet Koftecisi', type: 'restaurant', lat: 41.0054, lng: 28.9768, description: 'Famous Turkish meatballs since 1920'})-[:LOCATED_IN]->(d)
            CREATE (:POI {name: 'Hafiz Mustafa 1864', type: 'restaurant', lat: 41.0110, lng: 28.9714, description: 'Historic Turkish dessert shop'})-[:LOCATED_IN]->(d)
            CREATE (:POI {name: 'Hagia Sophia', type: 'attraction', lat: 41.0086, lng: 28.9802, description: 'UNESCO World Heritage mosque'})-[:LOCATED_IN]->(d)
            CREATE (:POI {name: 'Grand Bazaar', type: 'attraction', lat: 41.0107, lng: 28.9680, description: 'One of the oldest covered markets'})-[:LOCATED_IN]->(d)
        `);

    // ─── PARIS ───
    await session.run(`CREATE (d:Destination {name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, description: 'City of Light, art, culture, and cuisine'})`);
    await session.run(`
            MATCH (d:Destination {name: 'Paris'})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Le Bouillon Chartier', lat: 48.8738, lng: 2.3456, priceLevel: 1, rating: 4.3})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Paris Halal Food', lat: 48.8606, lng: 2.3376, priceLevel: 2, rating: 4.1})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Le Marais Falafel', lat: 48.8570, lng: 2.3580, priceLevel: 1, rating: 4.4})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945, type: 'landmark', rating: 4.7})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Louvre Museum', lat: 48.8606, lng: 2.3376, type: 'museum', rating: 4.8})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Notre-Dame', lat: 48.8530, lng: 2.3499, type: 'cathedral', rating: 4.7})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Sacre-Coeur', lat: 48.8867, lng: 2.3431, type: 'basilica', rating: 4.6})
        `);

    // ─── DUBAI ───
    await session.run(`CREATE (d:Destination {name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, description: 'Futuristic city with luxury shopping and desert adventures'})`);
    await session.run(`
            MATCH (d:Destination {name: 'Dubai'})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Al Mahara', lat: 25.1412, lng: 55.1853, priceLevel: 3, rating: 4.8})
            CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Ravi Restaurant', lat: 25.2285, lng: 55.2810, priceLevel: 1, rating: 4.5})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Burj Khalifa', lat: 25.1972, lng: 55.2744, type: 'landmark', rating: 4.9})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Dubai Mall', lat: 25.1985, lng: 55.2796, type: 'mall', rating: 4.7})
            CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Dubai Museum', lat: 25.2636, lng: 55.2972, type: 'museum', rating: 4.3})
        `);

    // ─── TAG RELATIONSHIPS ───
    // Halal tags
    await session.run(`
            MATCH (r:Restaurant) WHERE r.name CONTAINS 'Halal' OR r.name CONTAINS 'Sultanahmet' OR r.name CONTAINS 'Hafiz' OR r.name CONTAINS 'Ravi' OR r.name CONTAINS 'Al Mahara' OR r.name CONTAINS 'Karakoy'
            MATCH (t:Tag {name: 'halal'})
            MERGE (r)-[:HAS_TAG]->(t)
        `);
    await session.run(`
            MATCH (poi:POI) WHERE poi.name CONTAINS 'Halal' OR poi.name CONTAINS 'Sultanahmet' OR poi.name CONTAINS 'Hafiz'
            MATCH (t:Tag {name: 'halal'})
            MERGE (poi)-[:HAS_TAG]->(t)
        `);
    // Vegan
    await session.run(`MATCH (r:Restaurant) WHERE r.name CONTAINS 'Vegan' OR r.name CONTAINS 'Falafel' MATCH (t:Tag {name: 'vegan'}) MERGE (r)-[:HAS_TAG]->(t)`);
    // Budget
    await session.run(`MATCH (r:Restaurant) WHERE r.priceLevel <= 1 MATCH (t:Tag {name: 'budget'}) MERGE (r)-[:HAS_TAG]->(t)`);
    await session.run(`MATCH (r:Restaurant) WHERE r.priceLevel = 2 MATCH (t:Tag {name: 'moderate'}) MERGE (r)-[:HAS_TAG]->(t)`);
    await session.run(`MATCH (r:Restaurant) WHERE r.priceLevel >= 3 MATCH (t:Tag {name: 'luxury'}) MERGE (r)-[:HAS_TAG]->(t)`);
    // UNESCO + History
    await session.run(`MATCH (a:Attraction) WHERE a.name IN ['Hagia Sophia', 'Senso-ji Temple', 'Notre-Dame'] MATCH (t:Tag {name: 'unesco'}) MERGE (a)-[:HAS_TAG]->(t)`);
    await session.run(`MATCH (a:Attraction) WHERE a.type IN ['museum', 'temple', 'mosque', 'cathedral', 'shrine', 'palace', 'basilica'] MATCH (t:Tag {name: 'history'}) MERGE (a)-[:HAS_TAG]->(t)`);
    // Family-friendly
    await session.run(`MATCH (a:Attraction) MATCH (t:Tag {name: 'family-friendly'}) MERGE (a)-[:HAS_TAG]->(t)`);
    await session.run(`MATCH (poi:POI) WHERE poi.type = 'attraction' MATCH (t:Tag {name: 'family-friendly'}) MERGE (poi)-[:HAS_TAG]->(t)`);

    // NEAR relationships
    await session.run(`
            MATCH (d:Destination)-[:HAS_RESTAURANT]->(r:Restaurant), (d)-[:HAS_ATTRACTION]->(a:Attraction)
            CREATE (r)-[:NEAR {distance: round(rand() * 3 + 0.5, 1)}]->(a)
        `);

    // POI proximity
    await session.run(`
            MATCH (p1:POI), (p2:POI)
            WHERE id(p1) < id(p2) AND p1.lat IS NOT NULL AND p2.lat IS NOT NULL
            WITH p1, p2,
                 point.distance(point({latitude: p1.lat, longitude: p1.lng}),
                                point({latitude: p2.lat, longitude: p2.lng})) AS dist
            WHERE dist < 2000
            MERGE (p1)-[r:NEAR]->(p2)
            SET r.distance = dist
        `);

    console.log('✅ Knowledge Graph seeded: Tokyo, Istanbul, Paris, Dubai');
    console.log('🏷️  Tags, restaurants, attractions, hotels, and relationships created');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  } finally {
    await session.close();
    await closeNeo4j();
    process.exit(0);
  }
};

seedData();
