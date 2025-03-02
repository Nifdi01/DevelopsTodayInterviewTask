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
