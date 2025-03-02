import axios from 'axios';
import { getEmbedding } from './EmbeddingService';
import { Article } from '../models/Article';
import { config } from '../config/config';

export const searchSimilarArticles = async (query: string): Promise<Article[]> => {
  const embedding = await getEmbedding(query);
  try {
    const response = await axios.post(`${config.pineconeIndexUrl}/query`, {
      vector: embedding,
      topK: 3,
      includeMetadata: true,
    }, {
      headers: {
        'Api-Key': config.pineconeApiKey,
        'Content-Type': 'application/json',
      },
    });

    const articles: Article[] = response.data.matches.map((match: any) => ({
      title: match.metadata.title,
      content: '',
      url: match.metadata.url,
      date: match.metadata.date,
    }));

    return articles;
  } catch (error) {
    console.error('Error during vector search:', error);
    return [];
  }
};
