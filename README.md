# Docker Setup Instructions

## Prerequisites

- Docker and Docker Compose installed
- Pinecone account with API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
KAFKA_BROKER=
KAFKA_USERNAME=
KAFKA_PASSWORD=
KAFKA_TOPIC_NAME=
KAFKA_GROUP_ID_PREFIX=

PINECONE_API_KEY=
PINECONE_INDEX_URL=

PORT=

GEMINI_API_KEY=
GEMINI_GENERATE_ENDPOINT=
GEMINI_EMBEDDING_ENDPOINT=
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

### Data ingesting
After running the system the data can be ingested with the following command:
```
docker exec agent-service npx tsx scripts/processUrls.ts
```

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


## Optimizations

- **Caching**: Redis is used to cache frequently used data (embeddings) to reduce API calls and speed up responses.
- **Batch Processing**: URLs and data are processed in batches to reduce overhead.
- **Parallel Processing**: Tasks are processed concurrently using Kafka to improve response times.
- **Lazy Loading**: Data is fetched only when needed, improving efficiency.
- **Optimized Pinecone Calls**: Data is sent in batches to Pinecone to reduce API costs and improve performance.

