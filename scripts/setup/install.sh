#!/bin/bash

set -e

echo "🚀 Setting up JBX Job Application Automation Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create directories
echo "📁 Creating necessary directories..."
mkdir -p logs uploads ssl volumes/{postgres,mongo,redis,rabbitmq}

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the services"
fi

# Create SSL certificates (self-signed for development)
if [ ! -f ssl/cert.pem ]; then
    echo "🔐 Generating SSL certificates..."
    mkdir -p ssl
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
        -subj "/C=US/ST=CA/L=SF/O=JBX/CN=localhost"
fi

# Build Docker images
echo "🏗️  Building Docker images..."
docker-compose build

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run: ./scripts/setup/start.sh"
echo "3. Access the application at http://localhost:3000"
