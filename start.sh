#!/bin/bash

# PermitPaladin Production Home Server Startup Script
# This script helps you get started with PermitPaladin on your home server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

echo "🚀 Welcome to PermitPaladin Production Home Server Setup!"
echo "========================================================"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons."
   print_status "Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    print_status "Run: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    print_status "Then add your user to the docker group: sudo usermod -aG docker $USER"
    print_status "Log out and back in, then run this script again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    print_status "Run: sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

# Check Docker permissions
if ! docker info &> /dev/null; then
    print_error "Docker is not accessible. Please ensure your user is in the docker group."
    print_status "Run: sudo usermod -aG docker $USER"
    print_status "Log out and back in, then run this script again."
    exit 1
fi

print_success "Docker and Docker Compose are installed and accessible"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads logs backups ssl

# Set proper permissions
chmod 755 uploads logs backups
chmod 700 ssl  # SSL directory should be private

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_status "Creating .env file with production values..."
    
    # Generate a secure session secret
    SESSION_SECRET=$(openssl rand -hex 32)
    
    cat > .env << EOF
# PermitPaladin Production Environment Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Security Settings
SESSION_SECRET=${SESSION_SECRET}
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=lax
SESSION_COOKIE_MAX_AGE=86400000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=permitpaladin
DB_USER=permitpaladin
DB_PASSWORD=permitpaladin123

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT_MS=30000
DB_POOL_ACQUIRE_TIMEOUT_MS=60000

# File Storage
FILE_STORAGE_PATH=/app/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif,txt

# Logging & Monitoring
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_REQUEST_LOGGING=true
ENABLE_HEALTH_CHECKS=true

# Performance & Caching
ENABLE_COMPRESSION=true
ENABLE_CORS=false
CACHE_CONTROL_MAX_AGE=3600

# Backup & Maintenance
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
AUTO_CLEANUP_DAYS=90

# Development Overrides
ENABLE_DEBUG_MODE=false
ENABLE_DEV_TOOLS=false
EOF
    
    print_success "Created .env file with secure session secret"
else
    print_status ".env file already exists, checking configuration..."
    
    # Validate critical environment variables
    if ! grep -q "SESSION_SECRET=" .env; then
        print_warning "SESSION_SECRET not found in .env, adding secure one..."
        SESSION_SECRET=$(openssl rand -hex 32)
        echo "SESSION_SECRET=${SESSION_SECRET}" >> .env
        print_success "Added secure SESSION_SECRET to .env"
    fi
    
    if ! grep -q "NODE_ENV=production" .env; then
        print_warning "NODE_ENV not set to production, updating..."
        sed -i 's/NODE_ENV=.*/NODE_ENV=production/' .env
        print_success "Updated NODE_ENV to production"
    fi
fi

# Check system resources
print_status "Checking system resources..."
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
TOTAL_DISK=$(df -BG . | awk 'NR==2{printf "%.0f", $4}')

if [ "$TOTAL_MEM" -lt 2048 ]; then
    print_warning "System has less than 2GB RAM (${TOTAL_MEM}MB). Performance may be limited."
fi

if [ "$TOTAL_DISK" -lt 20 ]; then
    print_warning "Less than 20GB disk space available (${TOTAL_DISK}GB). Consider freeing up space."
fi

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Build and start services
print_status "Building and starting PermitPaladin services..."
docker-compose build --no-cache

# Start services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 15

# Check service status
print_status "Checking service status..."
docker-compose ps

# Test database connection
print_status "Testing database connection..."
if docker-compose exec -T app node -e "
const { testConnection } = require('./dist/db.js');
testConnection().then(() => console.log('Database connection successful')).catch(console.error);
" 2>/dev/null; then
    print_success "Database connection successful"
else
    print_warning "Database connection test failed (this is normal during first startup)"
fi

# Test application health
print_status "Testing application health..."
sleep 10
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    print_success "Application health check passed"
else
    print_warning "Application health check failed (may still be starting up)"
fi

# Setup backup cron job
if [ ! -f "backup.sh" ]; then
    print_status "Creating backup script..."
    cat > backup.sh << 'EOF'
#!/bin/bash
# PermitPaladin Backup Script
BACKUP_DIR="./backups"
DB_CONTAINER="permitpaladin-postgres"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
docker exec $DB_CONTAINER pg_dump -U permitpaladin permitpaladin > $BACKUP_DIR/db_backup_$DATE.sql

# File uploads backup
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz uploads/

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF
    
    chmod +x backup.sh
    print_success "Created backup script"
fi

# Setup auto-cleanup script
if [ ! -f "cleanup.sh" ]; then
    print_status "Creating cleanup script..."
    cat > cleanup.sh << 'EOF'
#!/bin/bash
# PermitPaladin Cleanup Script
DAYS=${1:-90}
echo "Cleaning up files older than $DAYS days..."

# Clean up old uploads
find uploads/ -type f -mtime +$DAYS -delete
find uploads/ -type d -empty -delete

# Clean up old logs
find logs/ -type f -mtime +30 -delete

echo "Cleanup completed"
EOF
    
    chmod +x cleanup.sh
    print_success "Created cleanup script"
fi

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}' | head -1)
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="localhost"
fi

echo ""
echo "🎉 PermitPaladin Production Server is starting up!"
echo "========================================================"
echo "🌐 Web Interface: http://${SERVER_IP}:3000"
echo "🔒 Admin Interface: http://${SERVER_IP}:3000/admin"
echo "📊 Health Check: http://${SERVER_IP}:3000/api/health"
echo "📋 Status: docker-compose ps"
echo "📋 Logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
echo ""
echo "📁 Directories created:"
echo "   - uploads/: File storage"
echo "   - logs/: Application logs"
echo "   - backups/: Database and file backups"
echo "   - ssl/: SSL certificates (for HTTPS)"
echo ""
echo "🔄 Maintenance commands:"
echo "   - Backup: ./backup.sh"
echo "   - Cleanup: ./cleanup.sh [days]"
echo "   - Update: git pull && docker-compose build --no-cache && docker-compose up -d"
echo ""
echo "⏰ Please wait 2-3 minutes for the application to fully start up."
echo "   You can monitor progress with: docker-compose logs -f"
echo ""
echo "📚 For more information, see DEPLOYMENT.md"
echo "🔒 Security: Consider setting up HTTPS with SSL certificates"
echo "========================================================"

# Optional: Check if running on Raspberry Pi
if command -v vcgencmd &> /dev/null; then
    echo ""
    echo "🍓 Raspberry Pi detected!"
    echo "💡 Performance tips:"
    echo "   - Ensure adequate cooling"
    echo "   - Use a fast microSD card or USB SSD"
    echo "   - Consider using a 4GB+ model for better performance"
fi
