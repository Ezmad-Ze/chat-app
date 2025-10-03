FROM node:20-alpine

WORKDIR /app

# Copy root monorepo files
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally via npm
RUN npm install -g pnpm

# Install PM2 globally via npm
RUN npm install -g pm2

# Install project dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client with the correct binary targets
RUN cd apps/api && npx prisma generate

# Build the API
RUN pnpm build --filter @chat-app/api

# Change to API directory for PM2
WORKDIR /app/apps/api

# Run with PM2 for clustering
CMD ["pm2-runtime", "ecosystem.config.js"]