require('dotenv').config();
const { connectNeo4j, getNeo4jDriver } = require('./config/neo4j');

async function test() {
    await connectNeo4j();
    const driver = getNeo4jDriver();
    if (!driver) { console.log('❌ Neo4j not connected'); process.exit(1); }

    const session = driver.session();

    const r1 = await session.run('MATCH (d:Destination) RETURN d.name AS name, d.country AS country');
    console.log('\n🌍 Destinations:', r1.records.map(r => r.get('name') + ' (' + r.get('country') + ')'));

    const r2 = await session.run('MATCH (r:Restaurant)-[:HAS_TAG]->(t:Tag{name:"halal"}) RETURN r.name AS name, r.rating AS rating');
    console.log('\n🥩 Halal Restaurants:', r2.records.map(r => r.get('name') + ' ★' + r.get('rating')));

    const r3 = await session.run('MATCH (r:Restaurant)-[:NEAR]->(a:Attraction) RETURN r.name AS rest, a.name AS attr LIMIT 6');
    console.log('\n📍 NEAR Relationships:', r3.records.map(r => r.get('rest') + ' → ' + r.get('attr')));

    const r4 = await session.run('MATCH (a:Attraction)-[:HAS_TAG]->(t:Tag{name:"unesco"}) RETURN a.name AS name');
    console.log('\n🏛️  UNESCO Sites:', r4.records.map(r => r.get('name')));

    const r5 = await session.run('MATCH (n) RETURN labels(n)[0] AS type, count(n) AS count ORDER BY count DESC');
    console.log('\n📊 Graph Stats:', r5.records.map(r => r.get('type') + ': ' + r.get('count')));

    // Test Graph RAG query — "halal restaurants NEAR family-friendly attractions in Tokyo"
    const r6 = await session.run(`
        MATCH (d:Destination {name: "Tokyo"})-[:HAS_RESTAURANT]->(r:Restaurant)-[:HAS_TAG]->(t:Tag {name: "halal"})
        MATCH (r)-[:NEAR]->(a:Attraction)-[:HAS_TAG]->(t2:Tag {name: "family-friendly"})
        RETURN r.name AS restaurant, a.name AS attraction, r.rating AS rating
    `);
    console.log('\n🔍 Graph RAG: "halal restaurants NEAR family-friendly attractions in Tokyo"');
    r6.records.forEach(r => console.log('   ', r.get('restaurant'), '→ near →', r.get('attraction'), '★' + r.get('rating')));

    await session.close();
    await driver.close();
    console.log('\n✅ All Neo4j tests passed!');
}

test().catch(e => console.error('ERROR:', e.message));
