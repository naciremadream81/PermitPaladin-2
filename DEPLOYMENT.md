# 🚀 PermitPaladin Production Deployment Guide

## Overview

This guide will help you deploy PermitPaladin as a production-ready home server application. The system is designed to run on Linux-based home servers, including Raspberry Pi 4, with Docker for easy deployment and management.

## 🏠 System Requirements

### Minimum Requirements
- **CPU**: 2 cores (ARM64 or x64)
- **RAM**: 4GB
- **Storage**: 20GB (SSD recommended)
- **OS**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+)

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **OS**: Ubuntu 22.04 LTS or Debian 12

### Raspberry Pi Specific
- **Model**: Raspberry Pi 4 (4GB+ RAM)
- **Storage**: 64GB+ microSD or USB SSD
- **Cooling**: Active cooling recommended for sustained performance

## 🔧 Prerequisites

### 1. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

### 2. Install Docker Compose
```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 3. System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install additional utilities
sudo apt install -y curl wget git htop tree
```

## 🚀 Quick Deployment

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/PermitPaladin.git
cd PermitPaladin

# Make startup script executable
chmod +x start.sh

# Run the automated setup
./start.sh
```

### Option 2: Manual Setup
```bash
# Clone and setup
git clone https://github.com/yourusername/PermitPaladin.git
cd PermitPaladin

# Create environment file
cp env.template .env
# Edit .env with your settings

# Create directories
mkdir -p uploads logs backups ssl

# Start services
docker-compose up -d
```

## 🔒 Security Configuration

### 1. Environment Variables
Edit `.env` file and update these critical settings:

```bash
# Generate a secure session secret
SESSION_SECRET=$(openssl rand -hex 32)

# Update .env file
sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
```

### 2. Firewall Configuration
```bash
# Install UFW firewall
sudo apt install ufw

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000/tcp  # PermitPaladin web interface
sudo ufw allow 80/tcp     # HTTP (if using nginx)
sudo ufw allow 443/tcp    # HTTPS (if using nginx)

# Enable firewall
sudo ufw enable
```

### 3. SSL/HTTPS Setup (Optional but Recommended)

#### Using Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to ssl directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem

# Set proper permissions
sudo chown $USER:$USER ssl/*
chmod 600 ssl/*
```

#### Update nginx.conf for HTTPS
Uncomment and configure the HTTPS server block in `nginx.conf`.

### 4. Database Security
```bash
# Change default database password
# Edit .env file and update DB_PASSWORD
# Then restart services
docker-compose down
docker-compose up -d
```

## 📊 Monitoring & Maintenance

### 1. Health Checks
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Test health endpoint
curl http://localhost:3000/api/health
```

### 2. Backup Procedures
```bash
# Manual backup
./backup.sh

# Setup automated backups (cron)
crontab -e

# Add this line for daily backups at 2 AM:
0 2 * * * /path/to/PermitPaladin/backup.sh
```

### 3. Cleanup Procedures
```bash
# Clean up old files (default: 90 days)
./cleanup.sh

# Clean up old files (custom days)
./cleanup.sh 30
```

### 4. System Monitoring
```bash
# Monitor system resources
htop

# Monitor disk usage
df -h

# Monitor Docker resources
docker stats
```

## 🔄 Updates & Maintenance

### 1. Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 2. Database Migrations
```bash
# Apply database migrations
docker-compose exec app npm run db:migrate
```

### 3. System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart Docker services
sudo systemctl restart docker
docker-compose restart
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 3000
sudo netstat -tlnp | grep :3000

# Kill the process or change port in .env
```

#### 2. Database Connection Issues
```bash
# Check database container
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

#### 3. Permission Issues
```bash
# Fix uploads directory permissions
sudo chown -R $USER:$USER uploads/
chmod -R 755 uploads/
```

#### 4. Memory Issues (Raspberry Pi)
```bash
# Increase swap space
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Log Analysis
```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres

# View nginx logs (if using)
docker-compose logs -f nginx
```

## 📈 Performance Optimization

### 1. Database Optimization
```bash
# Edit postgres configuration in docker-compose.yml
# Adjust memory limits based on your system
```

### 2. File Storage Optimization
```bash
# Use SSD storage when possible
# Regular cleanup of old files
# Monitor uploads directory size
```

### 3. Caching (Optional)
```bash
# Redis is included in docker-compose.yml
# Enable Redis caching in your application
```

## 🔐 Advanced Security

### 1. Reverse Proxy with Nginx
The included `nginx.conf` provides:
- Rate limiting
- Security headers
- Gzip compression
- SSL termination

### 2. VPN Access (Recommended)
```bash
# Install WireGuard
sudo apt install wireguard

# Configure VPN for secure remote access
# This allows you to access your server from anywhere securely
```

### 3. Intrusion Detection
```bash
# Install fail2ban
sudo apt install fail2ban

# Configure for SSH and web application protection
```

## 📱 Remote Access

### 1. Port Forwarding
Configure your router to forward port 3000 (or 80/443 if using nginx) to your server.

### 2. Dynamic DNS
Use a dynamic DNS service if your home IP changes frequently.

### 3. VPN Access
Set up a VPN for secure remote access to your home network.

## 🎯 Production Checklist

- [ ] Docker and Docker Compose installed
- [ ] Environment variables configured
- [ ] Firewall configured
- [ ] SSL certificates installed (optional)
- [ ] Backup procedures tested
- [ ] Monitoring configured
- [ ] Security updates enabled
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Team trained on maintenance

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review application logs
3. Check system resources
4. Consult the main README.md
5. Open an issue on GitHub

## 🔄 Maintenance Schedule

### Daily
- Check service status
- Review error logs

### Weekly
- Run cleanup script
- Check disk usage
- Review backup logs

### Monthly
- Update system packages
- Review security settings
- Test backup restoration

### Quarterly
- Review performance metrics
- Update application
- Security audit

---

**🚀 Your PermitPaladin production server is now ready for professional use!**
