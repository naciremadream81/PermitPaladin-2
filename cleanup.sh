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
