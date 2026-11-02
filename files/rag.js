const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

let documentEmbeddings = [];
let isReady = false;

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Split text into chunks
function chunkText(text, chunkSize = 300) {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    return chunks;
}

// Initialize RAG by reading the file and creating embeddings
async function initRAG(filePath) {
    console.log(`[RAG] Loading dataset from ${filePath}...`);
    try {
        if (!fs.existsSync(filePath)) {
            console.log("[RAG] File not found. Creating empty knowledge base.");
            return;
        }
        const text = fs.readFileSync(filePath, 'utf-8');
        const chunks = chunkText(text);
        console.log(`[RAG] Split document into ${chunks.length} chunks. Generating embeddings...`);

        documentEmbeddings = [];
        for (const chunk of chunks) {
            if (chunk.trim().length === 0) continue;
            const result = await embeddingModel.embedContent(chunk);
            documentEmbeddings.push({
                text: chunk,
                embedding: result.embedding.values
            });
        }
        isReady = true;
        console.log("[RAG] Initialization complete. Ready to answer questions.");
    } catch (error) {
        console.error("[RAG] Error initializing:", error);
    }
}

// Search for the most relevant context
async function searchKnowledge(query, topK = 2) {
    if (!isReady || documentEmbeddings.length === 0) return "";

    try {
        const queryResult = await embeddingModel.embedContent(query);
        const queryEmbedding = queryResult.embedding.values;

        // Calculate similarities
        const scoredChunks = documentEmbeddings.map(doc => ({
            text: doc.text,
            score: cosineSimilarity(queryEmbedding, doc.embedding)
        }));

        // Sort by highest score
        scoredChunks.sort((a, b) => b.score - a.score);

        // Take top K results
        const topResults = scoredChunks.slice(0, topK);
        console.log("[RAG] Retrieved for query:", query);
        console.log(topResults.map(r => r.text));

        return topResults.map(r => r.text).join('\n\n');
    } catch (error) {
        console.error("[RAG] Error searching:", error);
        return "";
    }
}

module.exports = { initRAG, searchKnowledge };
