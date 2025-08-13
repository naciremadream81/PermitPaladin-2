#!/bin/bash

# PermitPaladin Troubleshooting Script
# This script helps diagnose and fix common issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔧 PermitPaladin Troubleshooting Script"
echo "======================================"

# Check Docker status
echo -e "\n${BLUE}Docker Status:${NC}"
if docker info >/dev/null 2>&1; then
    print_success "Docker is running"
    print_status "Docker version: $(docker --version)"
else
    print_error "Docker is not running or accessible"
    print_status "Try: sudo systemctl start docker"
    exit 1
fi

# Check Docker Compose
echo -e "\n${BLUE}Docker Compose:${NC}"
if command -v docker-compose >/dev/null 2>&1; then
    print_success "Docker Compose is installed"
    print_status "Version: $(docker-compose --version)"
else
    print_error "Docker Compose is not installed"
    exit 1
fi

# Check for running containers
echo -e "\n${BLUE}Running Containers:${NC}"
if docker ps | grep -q permitpaladin; then
    print_success "PermitPaladin containers are running"
    docker ps --filter "name=permitpaladin"
else
    print_warning "No PermitPaladin containers are running"
fi

# Check for stopped containers
echo -e "\n${BLUE}Stopped Containers:${NC}"
if docker ps -a | grep -q permitpaladin; then
    print_warning "Found stopped PermitPaladin containers:"
    docker ps -a --filter "name=permitpaladin"
else
    print_status "No PermitPaladin containers found"
fi

# Check Docker images
echo -e "\n${BLUE}Docker Images:${NC}"
if docker images | grep -q permitpaladin; then
    print_success "PermitPaladin image exists"
    docker images | grep permitpaladin
else
    print_warning "PermitPaladin image not found"
fi

# Check system resources
echo -e "\n${BLUE}System Resources:${NC}"
MEMORY=$(free -h | awk 'NR==2{printf "Memory: %s/%s", $3,$2}')
DISK=$(df -h . | awk 'NR==2{printf "Disk: %s/%s (%s)", $3,$2,$5}')
echo "$MEMORY"
echo "$DISK"

# Check ports
echo -e "\n${BLUE}Port Usage:${NC}"
if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
    print_success "Port 3000 is in use"
    netstat -tlnp 2>/dev/null | grep ":3000"
else
    print_warning "Port 3000 is not in use"
fi

if netstat -tlnp 2>/dev/null | grep -q ":5432"; then
    print_success "Port 5432 is in use"
    netstat -tlnp 2>/dev/null | grep ":5432"
else
    print_warning "Port 5432 is not in use"
fi

# Check directories
echo -e "\n${BLUE}Directory Structure:${NC}"
for dir in uploads logs backups; do
    if [ -d "$dir" ]; then
        print_success "$dir directory exists"
        ls -la "$dir" | head -3
    else
        print_warning "$dir directory missing"
    fi
done

# Check configuration files
echo -e "\n${BLUE}Configuration Files:${NC}"
for file in .env docker-compose.yml docker-compose.simple.yml; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_warning "$file missing"
    fi
done

# Check logs
echo -e "\n${BLUE}Recent Logs:${NC}"
if [ -f "logs/monitor.log" ]; then
    print_status "Last 5 lines of monitor log:"
    tail -5 logs/monitor.log 2>/dev/null || echo "No monitor log found"
else
    print_warning "No monitor log found"
fi

# Try to start services
echo -e "\n${BLUE}Attempting to Start Services:${NC}"
if [ -f "docker-compose.simple.yml" ]; then
    print_status "Using simple docker-compose configuration..."
    COMPOSE_FILE="docker-compose.simple.yml"
elif [ -f "docker-compose.yml" ]; then
    print_status "Using full docker-compose configuration..."
    COMPOSE_FILE="docker-compose.yml"
else
    print_error "No docker-compose file found!"
    exit 1
fi

print_status "Stopping any existing containers..."
docker-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true

print_status "Building and starting services..."
docker-compose -f "$COMPOSE_FILE" build --no-cache
docker-compose -f "$COMPOSE_FILE" up -d

print_status "Waiting for services to start..."
sleep 30

print_status "Service status:"
docker-compose -f "$COMPOSE_FILE" ps

print_status "Recent application logs:"
docker-compose -f "$COMPOSE_FILE" logs app --tail=10 2>/dev/null || echo "No app logs found"

print_status "Recent database logs:"
docker-compose -f "$COMPOSE_FILE" logs postgres --tail=10 2>/dev/null || echo "No postgres logs found"

# Test connectivity
echo -e "\n${BLUE}Connectivity Tests:${NC}"
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    print_success "Application is responding on port 3000"
else
    print_warning "Application is not responding on port 3000"
fi

if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U permitpaladin -d permitpaladin >/dev/null 2>&1; then
    print_success "Database is ready"
else
    print_warning "Database is not ready"
fi

echo -e "\n${BLUE}Troubleshooting Complete${NC}"
echo "======================================"
echo "If issues persist, check:"
echo "1. Docker logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "2. System resources: htop, df -h"
echo "3. Docker system: docker system df"
echo "4. Network: netstat -tlnp"
echo ""
echo "For more help, see DEPLOYMENT.md"
