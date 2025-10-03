# Stage 1: Build the frontend
FROM node:20-alpine as build

WORKDIR /app

# Copy root monorepo files
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally via npm
RUN npm install -g pnpm

# Install project dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the web app - adjust the filter based on your package name
RUN pnpm build --filter @chat-app/web

# Stage 2: Serve with nginx
FROM nginx:stable-alpine

# Copy the built frontend from the build stage
# Adjust the path based on where your web app builds to
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]