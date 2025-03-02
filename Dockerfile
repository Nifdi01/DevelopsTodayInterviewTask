# Step 1: Use an official Node.js runtime as a parent image
FROM node:22-slim

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Install tsx globally
RUN npm install -g tsx

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Expose the port the app runs on
EXPOSE 3000

# Step 7: Define the command to run the app using tsx
CMD ["npx", "tsx", "src/index.ts"]
