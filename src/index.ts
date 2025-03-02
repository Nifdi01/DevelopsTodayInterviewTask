import express from 'express';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import agentRoutes from './routes/AgentRoutes';
import { errorHandler } from './middlewares/ErrorHandler';
import { runKafkaConsumer } from './services/KafkaService';

dotenv.config();

const app = express();
app.use(json());

// Setup routes
app.use('/agent', agentRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

runKafkaConsumer().catch(err => console.error('Kafka consumer error:', err));
