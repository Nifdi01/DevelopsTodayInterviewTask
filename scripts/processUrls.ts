import { Kafka, Consumer, KafkaMessage } from 'kafkajs';
import fs from 'fs';
import csvParser from 'csv-parser';
import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { config } from '../src/config/config';
import dotenv from 'dotenv';
dotenv.config();

async function processArticle(url: string): Promise<void> {
  console.log(`Processing article: ${url}`);

  try {
      const embedding = Array.from({ length: 1536 }, () => Math.random());

      const pinecone = new Pinecone({ apiKey: config.pineconeApiKey });
      const index = pinecone.Index(config.pineconeIndexUrl);

      const record: PineconeRecord = {
          id: generateId(url),
          values: embedding,
          metadata: {
              url: url,
          },
      };

      await index.upsert([record]);

      console.log(`Article processed and inserted into Pinecone: ${url}`);
  } catch (error) {
    console.error(`Error processing article ${url}:`, error);
    throw error;
  }
}

function generateId(url: string): string {
    return Buffer.from(url).toString('base64');
}

async function consumeMessages(): Promise<void> {
  const kafka = new Kafka({
    clientId: 'news-consumer',
    brokers: [config.kafkaBroker],
    sasl: {
      mechanism: 'plain',
      username: config.kafkaUsername,
      password: config.kafkaPassword,
    },
    ssl: true,
  });

  const consumer: Consumer = kafka.consumer({ groupId: `${config.kafkaGroupIdPrefix}${Date.now()}` });

  await consumer.connect();
  await consumer.subscribe({ topic: config.kafkaTopicName, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        if (message.value) {
          const url = message.value.toString();
          await processArticle(url);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    },
  });
}

async function produceMessages(): Promise<void> {
  const kafka = new Kafka({
    clientId: 'news-producer',
    brokers: [config.kafkaBroker],
    sasl: {
      mechanism: 'plain',
      username: config.kafkaUsername,
      password: config.kafkaPassword,
    },
    ssl: true,
  });

  const producer = kafka.producer();
  await producer.connect();

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream('src/data/articles_dataset.csv')
      .pipe(csvParser())
      .on('data', async (row: { Source: string; URL: string }) => {
        try {
          await producer.send({
            topic: config.kafkaTopicName,
            messages: [{ value: row.URL }],
          });
        } catch (error) {
          console.error('Error sending message:', error);
          reject(error);
        }
      })
      .on('end', async () => {
        console.log('CSV file processed and messages sent.');
        await producer.disconnect();
        resolve();
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

async function main() {
  try {
    await produceMessages();
    await consumeMessages();
  } catch (error) {
    console.error('Application error:', error);
    process.exit(1);
  }
}

main();