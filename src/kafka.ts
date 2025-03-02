import { Kafka } from "kafkajs";
import { config } from "./config/config";

const kafka = new Kafka({
  clientId: 'test-task-client',
  brokers: [config.kafkaBroker],
  sasl: {
    mechanism: 'plain',
    username: config.kafkaUsername,
    password: config.kafkaPassword,
  },
  ssl: true,
});

const producer = kafka.producer();

async function sendTestMessage() {
  try {
    await producer.connect();
    await producer.send({
      topic: 'news',
      messages: [{ value: 'This is a test message' }],
    });
    console.log('Test message sent successfully to the news topic!');
  } catch (error) {
    console.error('Error sending message:', error.message);
  } finally {
    await producer.disconnect();
  }
}

sendTestMessage();