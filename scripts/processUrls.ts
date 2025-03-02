import { Kafka, logLevel } from 'kafkajs';
import { config } from '../src/config/config';
import { processArticle } from '../src/services/ArticleService';
import { getArticleById, storeArticle } from '../src/services/VectorStoreService';

const kafkaBroker = config.kafkaBroker;
const kafkaUsername = config.kafkaUsername;
const kafkaPassword = config.kafkaPassword;
const groupIdPrefix = config.kafkaGroupIdPrefix;

const groupId = `${groupIdPrefix}-${Date.now()}`;

const kafka = new Kafka({
  clientId: 'news-consumer',
  brokers: [kafkaBroker],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: kafkaUsername,
    password: kafkaPassword,
  },
  logLevel: logLevel.INFO,
});

const consumer = kafka.consumer({ groupId });

interface NewsMessage {
  event: string;
  value: {
    url?: string;
  };
}

async function runConsumer() {
  try {
    await consumer.connect();
    console.log('Consumer connected successfully');

    await consumer.subscribe({ topic: 'news', fromBeginning: true });
    console.log('Subscribed to topic: news');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value?.toString();
        if (!value) {
          console.log('Received an empty message');
          return;
        }

        try {
          const parsedMessage: NewsMessage = JSON.parse(value);
          if (parsedMessage.event !== 'new-article' || !parsedMessage.value?.url) {
            console.log(`Skipping invalid message: ${value}`);
            return;
          }

          const url = parsedMessage.value.url;
          const id = Buffer.from(url).toString('base64');

          let article = await getArticleById(id);
          if (!article) {
            article = await processArticle(url);
            if (article) {
              console.log(`Processing article: ${url} with data:`, JSON.stringify(article));
              await storeArticle(article);
              console.log(`${url} stored in database`);
            } else {
              console.log(`Failed to process article from ${url}`);
            }
          } else {
            console.log(`${url} already exists in database`);
          }
        } catch (error) {
          console.error(`Error processing message from ${topic} [partition ${partition}]:`, error);
        }
      },
    });
  } catch (error) {
    console.error('Consumer error:', error);
    if (error.code === 29) {
      console.error('TOPIC_AUTHORIZATION_FAILED: Verify that your credentials have permission to read the "news" topic.');
    }
  }
}

runConsumer().catch(console.error);