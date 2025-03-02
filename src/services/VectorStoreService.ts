import axios from 'axios';
import { Article } from '../models/Article';
import { getEmbedding } from './EmbeddingService';
import { config } from '../config/config';

export const storeArticle = async (article: Article) => {
  try {
    // Validate article fields
    if (!article.content || !article.url || !article.title || !article.date) {
      throw new Error('Article is missing required fields');
    }

    const embedding = await getEmbedding(article.content);
    if (!embedding || !embedding.length) {
      console.log(`No valid embedding for ${article.url}`);
      return;
    }

    const vectorData = {
      id: Buffer.from(article.url).toString('base64'),
      values: embedding,
      metadata: {
        title: article.title,
        content: article.content,
        url: article.url,
        date: article.date,
      },
    };

    // Log the data being sent to Pinecone
    console.log(`Sending to Pinecone:`, JSON.stringify(vectorData));

    // Example Pinecone upsert request (adjust URL and headers as needed)
    const response = await axios.post(
      config.pineconeIndexUrl,
      { vectors: [vectorData] },
      {
        headers: {
          'Api-Key': 'your-pinecone-api-key',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Pinecone response:`, response.data);
  } catch (error) {
    console.error(`Error in storeArticle for ${article.url}:`, error.response?.data || error.message);
    throw error; // Re-throw to let the consumer catch it
  }
};

export const getArticleById = async (id: string): Promise<Article | null> => {
  try {
    const response = await axios.post(`${config.pineconeIndexUrl}/vectors/fetch`, {
      ids: [id]
    }, {
      headers: {
        'Api-Key': config.pineconeApiKey,
        'Content-Type': 'application/json'
      }
    });

    // Check if response.data exists and has a 'vectors' property
    if (!response.data || typeof response.data !== 'object' || !response.data.vectors) {
      console.error('Pinecone fetch response missing vectors:', response.data);
      return null;
    }

    const vector = response.data.vectors[id];
    if (!vector) {
      return null;
    }

    return {
      title: vector.metadata.title,
      content: vector.metadata.content,
      url: vector.metadata.url,
      date: vector.metadata.date
    };
  } catch (error) {
    console.error('Error fetching article from Pinecone:', error);
    return null;
  }
};

export const searchSimilarArticles = async (query: string, topK: number = 5): Promise<Article[]> => {
  const embedding = await getEmbedding(query);
  if (!embedding.length) return [];

  const response = await axios.post(`${config.pineconeIndexUrl}/query`, {
    vector: embedding,
    topK,
    includeMetadata: true
  }, {
    headers: {
      'Api-Key': config.pineconeApiKey,
      'Content-Type': 'application/json'
    }
  });

  return response.data.matches.map(match => ({
    title: match.metadata.title,
    content: match.metadata.content,
    url: match.metadata.url,
    date: match.metadata.date
  }));
};