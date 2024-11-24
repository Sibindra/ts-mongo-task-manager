FROM node:22.11.0-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install pnpm globally
RUN npm install -g pnpm

# Install app dependencies
RUN pnpm install

# Bundle app source
COPY . .

# Build the TypeScript files
RUN pnpm run build

# Expose port 8080
EXPOSE 8080

# Start the app
CMD pnpm run start