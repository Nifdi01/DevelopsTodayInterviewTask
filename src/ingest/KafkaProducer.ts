import { Kafka, logLevel } from 'kafkajs';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { config } from '../config/config';

const kafka = new Kafka({
  clientId: 'article-producer',
  brokers: [config.kafkaBroker], // e.g., 'pkc-ewzgj.europe-west4.gcp.confluent.cloud:9092'
  ssl: true, // Enable SSL for Confluent Cloud
  sasl: {
    mechanism: 'plain', // Use 'plain' for Confluent Cloud API key/secret
    username: config.kafkaUsername, // Your Confluent Cloud API key
    password: config.kafkaPassword, // Your Confluent Cloud API secret
  },
  logLevel: logLevel.DEBUG, // Detailed logs for debugging
  connectionTimeout: 10000, // 10 seconds
  requestTimeout: 25000, // 25 seconds
  retry: {
    initialRetryTime: 300, // Start with 300ms delay
    retries: 10, // Increase to 10 retries
  },
});

const producer = kafka.producer();

async function sendURLsFromCSV(csvFilePath: string) {
  await producer.connect();
  const parser = fs.createReadStream(csvFilePath).pipe(parse({ columns: true, trim: true }));

  for await (const record of parser) {
    const url = record.url;
    if (!url) {
      console.error('Skipping record with missing URL:', record);
      continue;
    }
    await producer.send({ topic: 'article-urls', messages: [{ value: url }] });
    console.log(`Sent URL to Kafka: ${url}`);
  }
  await producer.disconnect();
}

sendURLsFromCSV('src/data/articles_dataset.csv').catch(console.error);