const { getPineconeIndex } = require('../../config/pinecone');
const OpenAI = require('openai');

let openai = null;
const getOpenAI = () => {
    if (!openai && process.env.OPENAI_API_KEY) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
};

/**
 * Generate embedding for text using OpenAI
 */
const generateEmbedding = async (text) => {
    const client = getOpenAI();
    if (!client) return null;

    const response = await client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
    });
    return response.data[0].embedding;
};

/**
 * Upsert travel content into Pinecone
 */
exports.upsertContent = async (id, text, metadata = {}) => {
    try {
        const index = getPineconeIndex();
        if (!index) return false;

        const embedding = await generateEmbedding(text);
        if (!embedding) return false;

        await index.upsert([{ id, values: embedding, metadata }]);
        return true;
    } catch (error) {
        console.warn('Vector upsert error:', error.message);
        return false;
    }
};

/**
 * Semantic search in Pinecone with optional metadata filtering
 */
exports.semanticSearch = async (query, topK = 5, filter = {}) => {
    try {
        const index = getPineconeIndex();
        if (!index) return [];

        const embedding = await generateEmbedding(query);
        if (!embedding) return [];

        const results = await index.query({
            vector: embedding,
            topK,
            includeMetadata: true,
            filter: Object.keys(filter).length > 0 ? filter : undefined,
        });

        return (results.matches || []).map(match => ({
            id: match.id,
            score: match.score,
            ...match.metadata,
        }));
    } catch (error) {
        console.warn('Vector search error:', error.message);
        return [];
    }
};

exports.generateEmbedding = generateEmbedding;
