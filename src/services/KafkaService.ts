import { Kafka } from "kafkajs";
import { config } from "../config/config";
import { processArticle } from './ArticleService';
import { storeArticle } from './VectorStoreService';

export const runKafkaConsumer = async () => {
    const groupId = `${config.kafkaGroupIdPrefix}-${Date.now()}`;
    console.log(`Starting Kafka consumer with group ID: ${groupId}`);
    
    const kafka = new Kafka({
        clientId: 'news-rag-consumer',
        brokers: [config.kafkaBroker],
        ssl: true,
        sasl: {
            mechanism: 'plain',
            username: config.kafkaUsername,
            password: config.kafkaPassword
        }
    });

    const consumer = kafka.consumer({ groupId });
    
    consumer.on('consumer.crash', async (event) => {
        console.error('Consumer crashed', event);
        try {
            await consumer.connect();
        } catch (e) {
            console.error('Failed to reconnect consumer after crash', e);
        }
    });

    try {
        await consumer.connect();
        console.log('Consumer connected to Kafka');
        
        await consumer.subscribe({ 
            topic: config.kafkaTopicName, 
            fromBeginning: false 
        });
        console.log(`Subscribed to topic: ${config.kafkaTopicName}`);

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const link = message.value?.toString();
                    if (!link) {
                        console.warn('Received empty message, skipping');
                        return;
                    }
                    
                    console.log(`Processing link from topic ${topic}, partition ${partition}: ${link}`);
                    
                    const article = await processArticle(link);
                    if (article) {
                        await storeArticle(article);
                        console.log(`Successfully processed and stored article from: ${link}`);
                    } else {
                        console.warn(`Failed to process article from link: ${link}`);
                    }
                } catch (error) {
                    console.error(`Error processing message: ${error.message}`);
                }
            },
            // Add better error handling for the consumer itself
            autoCommitInterval: 5000, // Commit offsets every 5 seconds
            autoCommitThreshold: 10,  // Commit after 10 messages
        });
        
        // Handle graceful shutdown
        const shutdown = async () => {
            console.log('Shutting down consumer...');
            await consumer.disconnect();
            console.log('Consumer disconnected');
            process.exit(0);
        };
        
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        
    } catch (error) {
        console.error(`Fatal error in Kafka consumer: ${error.message}`);
        if (error.type === 'TOPIC_AUTHORIZATION_FAILED') {
            console.error("Authorization failed. Please check your Kafka credentials and topic access permissions.");
        }
        process.exit(1);
    }
};