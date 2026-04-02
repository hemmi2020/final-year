require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { connectNeo4j, getNeo4jDriver, closeNeo4j } = require('../../config/neo4j');

const seedData = async () => {
    await connectNeo4j();
    const driver = getNeo4jDriver();
    if (!driver) {
        console.log('❌ Cannot seed — Neo4j not connected');
        process.exit(1);
    }

    const session = driver.session();
    try {
        // Clear existing data
        await session.run('MATCH (n) DETACH DELETE n');
        console.log('🗑️  Cleared existing graph data');

        // Create Tags
        const tags = ['halal', 'vegan', 'vegetarian', 'family-friendly', 'unesco', 'budget', 'moderate', 'luxury', 'adventure', 'history', 'food', 'nature'];
        for (const tag of tags) {
            await session.run('CREATE (:Tag {name: $name})', { name: tag });
        }
        console.log('✅ Tags created');

        // Create Tokyo
        await session.run(`
      CREATE (d:Destination {name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503})
      WITH d
      CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Naritakaya Halal Ramen', lat: 35.6895, lng: 139.6917, priceLevel: 2, rating: 4.5})
      CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Gyumon Halal Yakiniku', lat: 35.6580, lng: 139.7016, priceLevel: 3, rating: 4.3})
      CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Afuri Vegan Ramen', lat: 35.6614, lng: 139.7040, priceLevel: 2, rating: 4.4})
      CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Senso-ji Temple', lat: 35.7148, lng: 139.7967, type: 'temple', rating: 4.7})
      CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'TeamLab Borderless', lat: 35.6267, lng: 139.7840, type: 'museum', rating: 4.8})
      CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Meiji Shrine', lat: 35.6764, lng: 139.6993, type: 'shrine', rating: 4.6})
      CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Tokyo Tower', lat: 35.6586, lng: 139.7454, type: 'landmark', rating: 4.5})
    `);

        // Create Istanbul
        await session.run(`
      CREATE (d:Destination {name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784})
      WITH d
      CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Sultanahmet Koftecisi', lat: 41.0054, lng: 28.9768, priceLevel: 1, rating: 4.6})
      CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Hafiz Mustafa 1864', lat: 41.0110, lng: 28.9714, priceLevel: 2, rating: 4.7})
      CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Hagia Sophia', lat: 41.0086, lng: 28.9802, type: 'mosque', rating: 4.9})
      CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Blue Mosque', lat: 41.0054, lng: 28.9768, type: 'mosque', rating: 4.8})
      CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Grand Bazaar', lat: 41.0107, lng: 28.9680, type: 'market', rating: 4.5})
    `);

        // Create Paris
        await session.run(`
      CREATE (d:Destination {name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522})
      WITH d
      CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Le Bouillon Chartier', lat: 48.8738, lng: 2.3456, priceLevel: 1, rating: 4.3})
      CREATE (d)-[:HAS_RESTAURANT]->(:Restaurant {name: 'Paris Halal Food', lat: 48.8606, lng: 2.3376, priceLevel: 2, rating: 4.1})
      CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945, type: 'landmark', rating: 4.7})
      CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Louvre Museum', lat: 48.8606, lng: 2.3376, type: 'museum', rating: 4.8})
      CREATE (d)-[:HAS_ATTRACTION]->(:Attraction {name: 'Notre-Dame', lat: 48.8530, lng: 2.3499, type: 'cathedral', rating: 4.7})
    `);

        // Tag restaurants
        await session.run(`
      MATCH (r:Restaurant) WHERE r.name CONTAINS 'Halal' OR r.name CONTAINS 'Sultanahmet' OR r.name CONTAINS 'Hafiz'
      MATCH (t:Tag {name: 'halal'})
      CREATE (r)-[:HAS_TAG]->(t)
    `);
        await session.run(`
      MATCH (r:Restaurant) WHERE r.name CONTAINS 'Vegan'
      MATCH (t:Tag {name: 'vegan'})
      CREATE (r)-[:HAS_TAG]->(t)
    `);
        await session.run(`
      MATCH (r:Restaurant) WHERE r.priceLevel <= 1
      MATCH (t:Tag {name: 'budget'})
      CREATE (r)-[:HAS_TAG]->(t)
    `);
        await session.run(`
      MATCH (r:Restaurant) WHERE r.priceLevel = 2
      MATCH (t:Tag {name: 'moderate'})
      CREATE (r)-[:HAS_TAG]->(t)
    `);

        // Tag attractions
        await session.run(`
      MATCH (a:Attraction) WHERE a.name IN ['Hagia Sophia', 'Senso-ji Temple', 'Notre-Dame']
      MATCH (t:Tag {name: 'unesco'})
      CREATE (a)-[:HAS_TAG]->(t)
    `);
        await session.run(`
      MATCH (a:Attraction) WHERE a.type IN ['museum', 'temple', 'mosque', 'cathedral', 'shrine']
      MATCH (t:Tag {name: 'history'})
      CREATE (a)-[:HAS_TAG]->(t)
    `);
        await session.run(`
      MATCH (a:Attraction)
      MATCH (t:Tag {name: 'family-friendly'})
      CREATE (a)-[:HAS_TAG]->(t)
    `);

        // Create NEAR relationships (restaurants near attractions in same destination)
        await session.run(`
      MATCH (d:Destination)-[:HAS_RESTAURANT]->(r:Restaurant),
            (d)-[:HAS_ATTRACTION]->(a:Attraction)
      CREATE (r)-[:NEAR {distance: round(rand() * 3 + 0.5, 1)}]->(a)
    `);

        console.log('✅ Knowledge Graph seeded with Tokyo, Istanbul, Paris');
        console.log('🏷️  Tags, restaurants, attractions, and relationships created');
    } catch (error) {
        console.error('❌ Seed error:', error.message);
    } finally {
        await session.close();
        await closeNeo4j();
        process.exit(0);
    }
};

seedData();
