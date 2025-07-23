#!/bin/bash

set -e

echo "🚀 Starting JBX Job Application Automation Platform..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run ./scripts/setup/install.sh first."
    exit 1
fi

# Start all services
echo "🔄 Starting all services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

services=("postgres:5432" "mongo:27017" "redis:6379" "rabbitmq:5672")

for service in "${services[@]}"; do
    IFS=':' read -r host port <<< "$service"
    if docker-compose exec -T $host nc -z localhost $port; then
        echo "✅ $host is ready"
    else
        echo "❌ $host is not ready"
    fi
done

# Display access URLs
echo ""
echo "🎉 JBX Platform is running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:4000"
echo "📄 Cover Letter Service: http://localhost:8000"
echo "🐰 RabbitMQ Management: http://localhost:15672 (guest/guest)"
echo ""
echo "📊 To view logs: docker-compose logs -f [service-name]"
echo "🛑 To stop: docker-compose down"
