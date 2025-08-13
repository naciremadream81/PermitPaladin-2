# 🚀 PermitPaladin - Production-Ready Permit Management System

**A complete, home server-ready permit package management system for construction teams, contractors, and building departments.**

## ✨ What's New in Production

PermitPaladin is now **fully production-ready** with enterprise-grade features:

- 🔒 **Production Security**: HTTPS support, rate limiting, security headers
- 📊 **Professional Monitoring**: Health checks, resource monitoring, automated alerts
- 🗄️ **Enterprise Database**: PostgreSQL with connection pooling and optimization
- 🚀 **Performance Optimized**: Nginx reverse proxy, Redis caching, compression
- 🔄 **Automated Maintenance**: Backup scripts, cleanup procedures, update automation
- 🏠 **Home Server Optimized**: Raspberry Pi 4 compatible, resource-efficient

## 🎯 Key Features

### 🏗️ Core Application
- **Full-stack web application** with React frontend and Express backend
- **TypeScript** throughout for type safety and better development experience
- **Responsive design** that works perfectly on mobile, tablet, and desktop
- **Professional UI** built with Tailwind CSS and Radix UI components

### 🗄️ Database & Storage
- **PostgreSQL database** with comprehensive schema for permit management
- **Local file storage** system (no cloud dependencies)
- **Pre-loaded data** including 10 Florida counties and sample checklists
- **Database migrations** for easy schema updates

### 🔐 Authentication & Security
- **Session-based authentication** system
- **Role-based access control** (user/admin roles)
- **Secure file uploads** with validation
- **CSRF protection** and security headers

### 📋 Permit Management
- **County-specific checklists** for Florida building departments
- **Document organization** by permit package
- **Progress tracking** for checklist completion
- **Multiple project types** (residential, commercial, industrial)

## 🚀 Quick Start (Production)

### Prerequisites
- Linux server (Ubuntu 20.04+, Debian 11+, or Raspberry Pi OS)
- Docker and Docker Compose installed
- 4GB+ RAM, 20GB+ storage

### One-Command Deployment
```bash
# Clone and deploy
git clone https://github.com/yourusername/PermitPaladin.git
cd PermitPaladin
chmod +x start.sh
./start.sh
```

**That's it!** Your production server will be running in minutes.

## 🏠 Home Server Compatibility

### ✅ Tested & Optimized For:
- **Raspberry Pi 4** (4GB+ RAM recommended)
- **Linux PCs** (Ubuntu, Debian, CentOS)
- **ARM64 and x64** architectures
- **Low-resource environments**

### 📊 System Requirements:
- **Minimum**: 2 cores, 4GB RAM, 20GB storage
- **Recommended**: 4+ cores, 8GB RAM, 100GB+ SSD
- **OS**: Any modern Linux distribution

## 🔧 Production Features

### Security
- **HTTPS/SSL support** with Let's Encrypt integration
- **Rate limiting** and DDoS protection
- **Security headers** and CSRF protection
- **Firewall configuration** guides
- **VPN access** recommendations

### Monitoring
- **Health check endpoints** for all services
- **Resource monitoring** (CPU, memory, disk)
- **Automated alerts** via email
- **Log aggregation** and error tracking
- **Performance metrics** and optimization

### Maintenance
- **Automated backups** (database + files)
- **Cleanup scripts** for old data
- **Update automation** with git hooks
- **Systemd service** for auto-start
- **Maintenance scheduling** tools

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Complete production deployment guide
- **[env.template](./env.template)**: Production environment configuration
- **[nginx.conf](./nginx.conf)**: Nginx reverse proxy configuration
- **[permitpaladin.service](./permitpaladin.service)**: Systemd service file

## 🛠️ Available Commands

### Production Commands
```bash
npm run deploy          # Deploy latest version
npm run backup          # Create backup
npm run cleanup         # Clean old files
npm run health          # Health check
npm run monitor         # System monitoring
npm run logs            # View logs
npm run status          # Service status
```

### Development Commands
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run docker:up       # Start Docker services
npm run docker:down     # Stop Docker services
```

## 🔄 Updates & Maintenance

### Automated Updates
```bash
# Update to latest version
npm run update

# Or manually
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Maintenance Schedule
- **Daily**: Health checks, log review
- **Weekly**: Cleanup, backup verification
- **Monthly**: System updates, security review
- **Quarterly**: Performance optimization

## 📊 Monitoring & Alerts

### Health Checks
- **Application**: `/api/health`
- **Database**: Connection and performance
- **Services**: Container status monitoring
- **System**: Resource usage tracking

### Automated Monitoring
```bash
# Run full system check
./monitor.sh

# Check specific components
./monitor.sh health
./monitor.sh services
./monitor.sh system
```

## 🔐 Security Features

### Production Security
- **Environment-based configuration**
- **Secure session management**
- **Input validation** throughout
- **File upload security**
- **Rate limiting** and DDoS protection
- **Security headers** and CSRF protection

### SSL/HTTPS Setup
```bash
# Install SSL certificates
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx for HTTPS
# Edit nginx.conf and uncomment HTTPS section
```

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Check what's using port 3000
2. **Permission issues**: Fix directory ownership
3. **Database connection**: Verify PostgreSQL status
4. **Memory issues**: Optimize for Raspberry Pi

### Getting Help
- Check logs: `docker-compose logs -f`
- Monitor system: `./monitor.sh`
- Review documentation: `DEPLOYMENT.md`
- Health check: `npm run health`

## 🌟 Why Choose PermitPaladin?

### For Construction Teams
- **Streamlined workflow** for permit management
- **County-specific checklists** for Florida
- **Document organization** and tracking
- **Progress monitoring** and reporting

### For Home Server Enthusiasts
- **Production-ready** deployment
- **Resource efficient** design
- **Easy maintenance** and updates
- **Professional monitoring** tools

### For Developers
- **Modern tech stack** (React, TypeScript, Node.js)
- **Well-documented** codebase
- **Docker-based** deployment
- **Extensible architecture**

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Ready to Deploy?

Your PermitPaladin system is now **production-ready** for:

- **Construction teams** managing multiple permits
- **Contractors** organizing documentation
- **Building departments** tracking applications
- **Home server enthusiasts** learning deployment

### Quick Access
- **Web Interface**: http://your-server-ip:3000
- **Health Check**: http://your-server-ip:3000/api/health
- **Documentation**: See DEPLOYMENT.md for detailed setup

---

**🚀 Ready to deploy? Run `./start.sh` and you'll be up and running in minutes!**

*Built with ❤️ for the construction industry and home server community.*
