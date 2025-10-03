#!/bin/bash

# Production deployment script for chat app

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Build and start all services
echo "📦 Building and starting production services..."
sudo docker compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
sudo docker compose ps

# Run database migrations
echo "🗃️ Running database migrations..."
sudo docker compose exec api npx prisma migrate deploy

# Check if migrations succeeded
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed"
    exit 1
fi

# Check PM2 clustering status
echo "🔧 Checking PM2 cluster status..."
sudo docker compose exec api pm2 status

# Test API health
echo "🏥 Testing API health..."
curl -f http://localhost:3000/health || echo "API health check failed"

# Test web application
echo "🌐 Testing web application..."
curl -I http://localhost:5173 || echo "Web app check failed"

echo ""
echo "🎉 Production deployment completed!"
echo "📊 Services:"
echo "   - Web app: http://localhost:5173"
echo "   - API: http://localhost:3000"
echo "   - Database: localhost:5434"
echo "   - Redis: localhost:6380"
echo ""
echo "📋 Useful commands:"
echo "   sudo docker compose logs -f api    # View API logs"
echo "   sudo docker compose logs -f web    # View web logs"
echo "   sudo docker compose exec api pm2 monit  # Monitor cluster"
echo "   sudo docker compose restart api    # Restart API"