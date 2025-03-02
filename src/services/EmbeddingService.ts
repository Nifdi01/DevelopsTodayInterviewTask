import axios from 'axios';
import { config } from '../config/config';


export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await axios.post(
      config.embeddingApiKey,
      {
        model: 'models/text-embedding-004',
        content: {
          parts: [
            {
              text: text,
            },
          ],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.llmApiKey
        },
      }
    );


    return response.data.embedding.values;
  } catch (error) {
    console.error('Error generating Gemini embedding:', error);
    return [];
  }
};