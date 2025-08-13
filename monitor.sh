#!/bin/bash

# PermitPaladin Production Monitoring Script
# This script monitors system health, application status, and provides alerts

set -e

# Configuration
ALERT_EMAIL="admin@yourdomain.com"
LOG_FILE="./logs/monitor.log"
ALERT_LOG="./logs/alerts.log"
HEALTH_CHECK_URL="http://localhost:3000/api/health"
DISK_THRESHOLD=80
MEMORY_THRESHOLD=85
CPU_THRESHOLD=90

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to log alerts
log_alert() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ALERT: $1" | tee -a "$ALERT_LOG"
    echo "$1" | mail -s "PermitPaladin Alert: $2" "$ALERT_EMAIL" 2>/dev/null || true
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local container_name=$2
    
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        echo -e "${GREEN}✓${NC} $service_name is running"
        return 0
    else
        echo -e "${RED}✗${NC} $service_name is not running"
        log_alert "$service_name service is down" "Service Down"
        return 1
    fi
}

# Function to check application health
check_health() {
    if curl -f "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Application health check passed"
        return 0
    else
        echo -e "${RED}✗${NC} Application health check failed"
        log_alert "Application health check failed" "Health Check Failed"
        return 1
    fi
}

# Function to check system resources
check_system_resources() {
    echo -e "\n${BLUE}System Resources:${NC}"
    
    # Check disk usage
    DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
        echo -e "${RED}✗${NC} Disk usage: ${DISK_USAGE}% (threshold: ${DISK_THRESHOLD}%)"
        log_alert "Disk usage is ${DISK_USAGE}%" "High Disk Usage"
    else
        echo -e "${GREEN}✓${NC} Disk usage: ${DISK_USAGE}%"
    fi
    
    # Check memory usage
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ]; then
        echo -e "${RED}✗${NC} Memory usage: ${MEMORY_USAGE}% (threshold: ${MEMORY_THRESHOLD}%)"
        log_alert "Memory usage is ${MEMORY_USAGE}%" "High Memory Usage"
    else
        echo -e "${GREEN}✓${NC} Memory usage: ${MEMORY_USAGE}%"
    fi
    
    # Check CPU usage (5-second average)
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}' | awk -F'.' '{print $1}')
    if [ "$CPU_USAGE" -gt "$CPU_THRESHOLD" ]; then
        echo -e "${RED}✗${NC} CPU usage: ${CPU_USAGE}% (threshold: ${CPU_THRESHOLD}%)"
        log_alert "CPU usage is ${CPU_USAGE}%" "High CPU Usage"
    else
        echo -e "${GREEN}✓${NC} CPU usage: ${CPU_USAGE}%"
    fi
}

# Function to check Docker resources
check_docker_resources() {
    echo -e "\n${BLUE}Docker Resources:${NC}"
    
    # Check running containers
    RUNNING_CONTAINERS=$(docker ps --format "table {{.Names}}" | wc -l)
    RUNNING_CONTAINERS=$((RUNNING_CONTAINERS - 1))  # Subtract header line
    
    if [ "$RUNNING_CONTAINERS" -eq 4 ]; then
        echo -e "${GREEN}✓${NC} All containers running: $RUNNING_CONTAINERS/4"
    else
        echo -e "${RED}✗${NC} Container count: $RUNNING_CONTAINERS/4"
        log_alert "Only $RUNNING_CONTAINERS containers are running" "Container Issue"
    fi
    
    # Check Docker disk usage
    DOCKER_DISK=$(docker system df | grep "Total Space" | awk '{print $3}' | sed 's/GB//')
    if [ "$DOCKER_DISK" -gt 10 ]; then
        echo -e "${YELLOW}⚠${NC} Docker disk usage: ${DOCKER_DISK}GB (consider cleanup)"
    else
        echo -e "${GREEN}✓${NC} Docker disk usage: ${DOCKER_DISK}GB"
    fi
}

# Function to check database
check_database() {
    echo -e "\n${BLUE}Database Status:${NC}"
    
    if docker-compose exec -T postgres pg_isready -U permitpaladin >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} PostgreSQL is ready"
        
        # Check database size
        DB_SIZE=$(docker-compose exec -T postgres psql -U permitpaladin -d permitpaladin -t -c "SELECT pg_size_pretty(pg_database_size('permitpaladin'));" | xargs)
        echo -e "${GREEN}✓${NC} Database size: $DB_SIZE"
        
        # Check active connections
        ACTIVE_CONNECTIONS=$(docker-compose exec -T postgres psql -U permitpaladin -d permitpaladin -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" | xargs)
        echo -e "${GREEN}✓${NC} Active connections: $ACTIVE_CONNECTIONS"
        
    else
        echo -e "${RED}✗${NC} PostgreSQL is not ready"
        log_alert "PostgreSQL is not ready" "Database Issue"
    fi
}

# Function to check file storage
check_file_storage() {
    echo -e "\n${BLUE}File Storage:${NC}"
    
    if [ -d "uploads" ]; then
        UPLOAD_COUNT=$(find uploads -type f | wc -l)
        UPLOAD_SIZE=$(du -sh uploads | awk '{print $1}')
        echo -e "${GREEN}✓${NC} Uploads: $UPLOAD_COUNT files, $UPLOAD_SIZE"
        
        # Check for very large files
        LARGE_FILES=$(find uploads -type f -size +100M | wc -l)
        if [ "$LARGE_FILES" -gt 0 ]; then
            echo -e "${YELLOW}⚠${NC} Large files (>100MB): $LARGE_FILES"
        fi
    else
        echo -e "${RED}✗${NC} Uploads directory not found"
    fi
    
    # Check backup directory
    if [ -d "backups" ]; then
        BACKUP_COUNT=$(find backups -type f | wc -l)
        BACKUP_SIZE=$(du -sh backups | awk '{print $1}')
        echo -e "${GREEN}✓${NC} Backups: $BACKUP_COUNT files, $BACKUP_SIZE"
    else
        echo -e "${YELLOW}⚠${NC} Backups directory not found"
    fi
}

# Function to check logs for errors
check_logs() {
    echo -e "\n${BLUE}Recent Logs:${NC}"
    
    # Check for recent errors in application logs
    ERROR_COUNT=$(docker-compose logs --tail=100 app 2>/dev/null | grep -i "error\|exception\|fatal" | wc -l)
    
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠${NC} Recent errors in logs: $ERROR_COUNT"
        log_alert "Found $ERROR_COUNT errors in recent logs" "Log Errors"
    else
        echo -e "${GREEN}✓${NC} No recent errors in logs"
    fi
}

# Function to check network connectivity
check_network() {
    echo -e "\n${BLUE}Network Connectivity:${NC}"
    
    # Check if port 3000 is accessible
    if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
        echo -e "${GREEN}✓${NC} Port 3000 is listening"
    else
        echo -e "${RED}✗${NC} Port 3000 is not listening"
        log_alert "Port 3000 is not listening" "Network Issue"
    fi
    
    # Check external connectivity
    if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} External connectivity OK"
    else
        echo -e "${YELLOW}⚠${NC} External connectivity issues"
    fi
}

# Function to generate report
generate_report() {
    echo -e "\n${BLUE}Monitoring Report:${NC}"
    echo "Generated: $(date)"
    echo "System: $(hostname)"
    echo "Uptime: $(uptime -p)"
    echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
    
    # Summary
    echo -e "\n${BLUE}Summary:${NC}"
    if [ $TOTAL_ISSUES -eq 0 ]; then
        echo -e "${GREEN}✓${NC} All systems operational"
    else
        echo -e "${RED}✗${NC} $TOTAL_ISSUES issues detected"
    fi
}

# Main monitoring function
main() {
    echo "🔍 PermitPaladin Production Monitoring"
    echo "====================================="
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    # Initialize counters
    TOTAL_ISSUES=0
    
    # Check services
    echo -e "\n${BLUE}Service Status:${NC}"
    check_service "PostgreSQL" "permitpaladin-postgres" || TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
    check_service "Application" "permitpaladin-app" || TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
    check_service "Redis" "permitpaladin-redis" || TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
    check_service "Nginx" "permitpaladin-nginx" || TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
    
    # Check application health
    check_health || TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
    
    # Check system resources
    check_system_resources
    
    # Check Docker resources
    check_docker_resources
    
    # Check database
    check_database
    
    # Check file storage
    check_file_storage
    
    # Check logs
    check_logs
    
    # Check network
    check_network
    
    # Generate report
    generate_report
    
    # Log completion
    log_message "Monitoring completed. $TOTAL_ISSUES issues found."
    
    # Exit with error code if issues found
    if [ $TOTAL_ISSUES -gt 0 ]; then
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "health")
        check_health
        ;;
    "services")
        check_service "PostgreSQL" "permitpaladin-postgres"
        check_service "Application" "permitpaladin-app"
        check_service "Redis" "permitpaladin-redis"
        check_service "Nginx" "permitpaladin-nginx"
        ;;
    "system")
        check_system_resources
        ;;
    "logs")
        check_logs
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo "Commands:"
        echo "  health    - Check application health"
        echo "  services  - Check service status"
        echo "  system    - Check system resources"
        echo "  logs      - Check recent logs"
        echo "  (no args) - Full monitoring report"
        exit 0
        ;;
    *)
        main
        ;;
esac
