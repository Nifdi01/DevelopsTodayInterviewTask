# Docker Setup Instructions

## Prerequisites

- Docker and Docker Compose installed
- Pinecone account with API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Pinecone settings
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=your-pinecone-index-name

# Other service settings
LLM_API_KEY=your-llm-api-key
EMBEDDING_API_KEY=your-embedding-api-key

# Kafka settings (if used)
KAFKA_BROKERS=your-kafka-brokers
KAFKA_TOPIC=your-kafka-topic
```

## Building and Running

1. Build the Docker image:
   ```
   docker-compose build
   ```

2. Start the services:
   ```
   docker-compose up
   ```

3. To run in detached mode:
   ```
   docker-compose up -d
   ```

4. To stop the services:
   ```
   docker-compose down
   ```

## Processing URLs from CSV

To process your CSV file with URLs, run the following command:

```bash
docker exec agent-service npx tsx scripts/processUrls.ts
```

You can specify a different CSV file path using:

```bash
docker exec agent-service npx tsx scripts/processUrls.ts --file=/usr/src/app/src/data/your-file.csv
```

The results will be saved to a JSON file in the same directory as your CSV file.

## Project Structure

Your current project structure:
```
.
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
└── src
    ├── config
    │   ├── config.ts
    │   └── ingest.ts
    ├── controllers
    │   └── AgentController.ts
    ├── data
    │   └── articles_dataset.csv
    ├── index.ts
    ├── middlewares
    │   └── ErrorHandler.ts
    ├── models
    │   └── Article.ts
    ├── routes
    │   └── AgentRoutes.ts
    └── services
        ├── ArticleService.ts
        ├── EmbeddingService.ts
        ├── KafkaService.ts
        ├── LLMService.ts
        ├── SearchService.ts
        └── VectorStoreService.ts
```

After adding the new scripts:
```
.
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
├── scripts
│   └── processUrls.ts
└── src
    ├── ...
```

## Troubleshooting

- **Connection issues with Pinecone**: Verify your Pinecone API key and environment variables in the `.env` file
- **CSV file not found**: Ensure your CSV file is mounted correctly in the volume and the path is correct
- **Memory issues**: You may need to allocate more memory to Docker in your Docker settings