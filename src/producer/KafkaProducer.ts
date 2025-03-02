import { Kafka, Producer } from 'kafkajs';
import csv from 'csv-parser';
import fs from 'fs';
import { config } from '../config/config';

const kafka = new Kafka({
  clientId: 'article-producer',
  brokers: [config.kafkaBroker],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: config.kafkaUsername,
    password: config.kafkaPassword
  }
});

const producer = kafka.producer();

async function sendUrlToKafka(url: string) {
  try {
    await producer.connect();
    await producer.send({
      topic: 'news',
      messages: [{ value: url }]
    });
    console.log(`Sent URL to Kafka: ${url}`);
  } catch (error) {
    console.error('Error sending URL to Kafka:', error);
  } finally {
    await producer.disconnect();
  }
}

async function ingestFromCsv(filePath: string) {
  const urls: string[] = [];
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.URL) urls.push(row.URL);
        console.log(row.URL);
      })
      .on('end', async () => {
        for (const url of urls) {
          await sendUrlToKafka(url);
        }
        console.log('CSV ingestion to Kafka complete');
        resolve();
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

ingestFromCsv('src/data/articles_dataset.csv').catch(console.error);