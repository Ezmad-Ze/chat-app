# Real-Time Chat Application

A full-stack, real-time chat application built with **NestJS**, **React**, **Socket.io**, and **Prisma ORM**. The backend is deployed with **PM2** in cluster mode for scalability, using a Redis adapter for Socket.io to ensure real-time messaging across multiple instances. The app is fully dockerized with **Postgres** for data persistence and **Redis** for pub/sub and session management. The frontend features a responsive UI with Tailwind CSS v4 and theme switching (light/dark).

![Login Page](screenshots/login-page.png)
![Chat Page](screenshots/chat-page.png)

## 🚀 Features

- **Real-time Messaging**: Powered by Socket.io with Redis adapter for cross-instance communication.
- **User Authentication**: Secure JWT-based login and registration.
- **Chat Rooms**: Create and join rooms with user presence indicators.
- **Theme Switching**: Toggle between light and dark themes using a custom ThemeContext.
- **Scalable Backend**: PM2 in cluster mode for high availability and load distribution.
- **Dockerized**: Fully containerized with Nginx, Postgres, and Redis.
- **Database**: Postgres with Prisma ORM for robust data persistence.
- **Responsive Design**: Built with Tailwind CSS v4 for a modern, mobile-friendly UI.

## 📋 Prerequisites

- **Node.js** (v18 or higher, for development only)
- **pnpm** (v10.17.1, install via `npm install -g pnpm@10.17.1`)
- **Docker** and **Docker Compose**
- **Git**
- **wscat** (for Socket.io testing, install via `npm install -g wscat`)

## 🚀 Quick Start

### Production Deployment (Recommended)

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ezmad-Ze/chat-app.git
   cd chat-app
   ```

2. **Run Production Deployment Script**:
   ```bash
   chmod +x prod.sh
   ./prod.sh
   ```

   This script will:
   - Build Docker images for `web` and `api` services.
   - Start all services (`web`, `api`, `postgres`, `redis`) in detached mode.
   - Run Prisma migrations for the database.
   - Verify PM2 cluster status and perform health checks.

3. **Access the Application**:
   - **Web Interface**: [http://localhost:5173](http://localhost:5173)
   - **API Server**: [http://localhost:3000](http://localhost:3000)

### Development Setup

1. **Clone the Repository** (if not already done):
   ```bash
   git clone https://github.com/Ezmad-Ze/chat-app.git
   cd chat-app
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Start Database Services**:
   ```bash
   sudo docker compose up -d postgres redis
   ```

4. **Run Prisma Migrations**:
   ```bash
   cd apps/api
   npx prisma migrate dev --name init
   cd ../..
   ```

5. **Run Development Servers**:
   ```bash
   chmod +x dev.sh
   ./dev.sh
   ```

6. **Access Development Environment**:
   - **Web Interface**: [http://localhost:5173](http://localhost:5173) (Vite dev server)
   - **API Server**: [http://localhost:3001](http://localhost:3001) (NestJS dev server)

## 🐳 Docker Services

The application consists of four services defined in `docker-compose.yml`:

| Service       | Port       | Description                              |
|---------------|------------|------------------------------------------|
| `web`         | 5173:80    | React frontend served by Nginx           |
| `api`         | 3000:3000  | NestJS backend with PM2 clustering       |
| `postgres`    | 5434:5432  | PostgreSQL database for data persistence |
| `redis`       | 6380:6379  | Redis for session store and pub/sub      |


## ⚙️ Configuration

### Environment Variables

Create a `.env` file in `apps/api`:
```env
# Database
DATABASE_URL="postgresql://chatapp:chatapp123@postgres:5434/chatapp?schema=public"

# Redis
REDIS_URL="redis://redis:6380"

# JWT
JWT_SECRET="your-super-secure-jwt-secret"

# Node Environment
NODE_ENV="production"
```

### PM2 Clustering

The backend runs in **PM2 cluster mode** to utilize all available CPU cores for scalability:
```javascript
// apps/api/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'chat-api',
    script: './dist/main.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://chatapp:chatapp123@postgres:5432/chatapp?schema=public',
      REDIS_URL: 'redis://redis:6379',
      JWT_SECRET: 'your-super-secure-jwt-secret',
    },
  }],
};
```

## 🚀 Deployment

### Production Deployment

1. **Build and Start Services**:
   ```bash
   ./prod.sh
   ```

   This script:
   - Builds Docker images for `web` and `api`.
   - Starts all services in detached mode.
   - Runs Prisma migrations.
   - Verifies PM2 cluster status and performs health checks.

2. **Verify Deployment**:
   ```bash
   sudo docker compose ps
   sudo docker compose exec api pm2 status
   ```

## 🧪 Testing

### Verify Real-Time Functionality

1. Open multiple browser windows at [http://localhost:5173](http://localhost:5173).
2. Create different user accounts in each window.
3. Join the same room from multiple windows.
4. Send messages and verify they appear in real-time across all windows.


## 📊 Monitoring

### PM2 Cluster Monitoring

```bash
# View cluster status
sudo docker compose exec api pm2 status

# Real-time monitoring
sudo docker compose exec api pm2 monit

# View logs
sudo docker compose exec api pm2 logs
```

## 📈 Performance

The application is optimized for production with:
- **PM2 Clustering**: Distributes load across CPU cores.
- **Redis Pub/Sub**: Ensures real-time messaging across instances.
- **Postgres Connection Pooling**: Optimizes database performance.
- **Nginx**: Efficient static file serving for the frontend.
- **Docker Resource Limits**: Configurable in `docker-compose.yml` for resource optimization.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NestJS**: Robust backend framework
- **React**: Frontend library
- **Socket.io**: Real-time communication
- **Prisma**: Database ORM
- **PM2**: Process management and clustering
- **Docker**: Containerization
- **Tailwind CSS**: Responsive styling 

## 📌 GitHub Repository

[https://github.com/Ezmad-Ze/chat-app](https://github.com/Ezmad-Ze/chat-app)
