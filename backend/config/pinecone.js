const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeIndex = null;

const connectPinecone = async () => {
    try {
        if (!process.env.PINECONE_API_KEY) {
            console.warn('⚠️  Pinecone API key not set — Vector Store disabled');
            return null;
        }
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        pineconeIndex = pc.index(process.env.PINECONE_INDEX || 'travel-app');
        console.log('✅ Pinecone connected');
        return pineconeIndex;
    } catch (error) {
        console.warn(`⚠️  Pinecone connection failed: ${error.message} — Vector Store disabled`);
        return null;
    }
};

const getPineconeIndex = () => pineconeIndex;

module.exports = { connectPinecone, getPineconeIndex };
