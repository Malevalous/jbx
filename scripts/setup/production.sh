#!/bin/bash

set -e

echo "🚀 Deploying JBX to Production..."

# Check if required environment variables are set
required_vars=("OPENAI_API_KEY" "SMTP_USER" "SMTP_PASS" "JWT_SECRET")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull

# Stop existing services
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Start services with production configuration
echo "🔄 Starting services with production configuration..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 60

# Run health checks
echo "🔍 Running health checks..."
curl -f http://localhost/health || exit 1

echo "✅ Production deployment completed!"
