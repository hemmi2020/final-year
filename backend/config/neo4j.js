const neo4j = require('neo4j-driver');

let driver = null;

const connectNeo4j = async () => {
    try {
        if (!process.env.NEO4J_URI || !process.env.NEO4J_PASSWORD) {
            console.warn('⚠️  Neo4j credentials not set — Knowledge Graph disabled');
            return null;
        }
        driver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD)
        );
        await driver.verifyConnectivity();
        console.log('✅ Neo4j connected');
        return driver;
    } catch (error) {
        console.warn(`⚠️  Neo4j connection failed: ${error.message} — Knowledge Graph disabled`);
        return null;
    }
};

const getNeo4jDriver = () => driver;

const closeNeo4j = async () => {
    if (driver) await driver.close();
};

module.exports = { connectNeo4j, getNeo4jDriver, closeNeo4j };
