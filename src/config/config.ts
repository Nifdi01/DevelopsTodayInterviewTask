import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  llmApiKey: process.env.GEMINI_API_KEY || '',
  embeddingApiKey: process.env.GEMINI_EMBEDDING_ENDPOINT || '',
  pineconeApiKey: process.env.PINECONE_API_KEY || '',
  pineconeIndexUrl: process.env.PINECONE_INDEX_URL || '',
  kafkaBroker: process.env.KAFKA_BROKER || '',
  kafkaUsername: process.env.KAFKA_USERNAME || '',
  kafkaPassword: process.env.KAFKA_PASSWORD || '',
  kafkaTopicName: process.env.KAFKA_TOPIC_NAME || 'news',
  kafkaGroupIdPrefix: process.env.KAFKA_GROUP_ID_PREFIX || 'test-task-'
};
