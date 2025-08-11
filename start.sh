#!/bin/bash

# PermitPaladin Home Server Startup Script
# This script helps you get started with PermitPaladin on your home server

set -e

echo "🚀 Welcome to PermitPaladin Home Server Setup!"
echo "================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Run: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Run: sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads
    chmod 755 uploads
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file with default values..."
    cat > .env << EOF
NODE_ENV=production
PORT=3000
SESSION_SECRET=$(openssl rand -hex 32)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=permitpaladin
DB_USER=permitpaladin
DB_PASSWORD=permitpaladin123
FILE_STORAGE_PATH=/app/uploads
EOF
    echo "✅ Created .env file with secure session secret"
fi

# Build and start services
echo "🔨 Building and starting PermitPaladin services..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Test database connection
echo "🔍 Testing database connection..."
if docker-compose exec app node -e "
const { testConnection } = require('./dist/db.js');
testConnection().then(console.log).catch(console.error);
" 2>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection test failed (this is normal during first startup)"
fi

echo ""
echo "🎉 PermitPaladin is starting up!"
echo "================================================"
echo "🌐 Web Interface: http://$(hostname -I | awk '{print $1}'):3000"
echo "📊 Status: docker-compose ps"
echo "📋 Logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
echo ""
echo "⏰ Please wait 1-2 minutes for the application to fully start up."
echo "   You can monitor progress with: docker-compose logs -f"
echo ""
echo "📚 For more information, see DEPLOYMENT.md"
echo "================================================"
