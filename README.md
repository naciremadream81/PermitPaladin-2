# 🏗️ PermitPaladin - Permit Package Management System

A comprehensive web-based permit package management system designed for construction teams, contractors, and building departments. Manage building permits, track documentation, and organize county-specific checklists with ease.

## ✨ Features

### 🎯 Core Functionality
- **Permit Package Management**: Create, track, and manage building permit applications
- **County-Specific Checklists**: Pre-configured checklists for Florida counties
- **Document Management**: Upload, organize, and track permit documents
- **User Authentication**: Secure user management with role-based access
- **Progress Tracking**: Monitor permit package completion status

### 🏛️ County Support
- **Miami-Dade County**: Complete checklist and requirements
- **Broward County**: Residential and commercial project support
- **Palm Beach County**: Building department integration
- **Extensible**: Easy to add more counties and requirements

### 📱 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface built with Tailwind CSS
- **Intuitive Navigation**: Easy-to-use dashboard and workflow
- **Real-time Updates**: Live progress tracking and status updates

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Linux-based system** (Ubuntu, Debian, Raspberry Pi OS)
- **4GB+ RAM** (8GB recommended)
- **20GB+ storage** available

### One-Command Deployment
```bash
# Clone the repository
git clone <your-repo-url>
cd PermitPaladin-2

# Run the startup script
./start.sh
```

### Manual Setup
```bash
# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:migrate

# Build and start
npm run build
npm start
```

## 🏠 Home Server Deployment

### Docker Deployment (Recommended)
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Manual Installation
1. **Install PostgreSQL** and create database
2. **Install Node.js** 18.x or later
3. **Configure environment** variables
4. **Run database migrations**
5. **Build and start** application

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🗄️ Database Schema

### Core Tables
- **Users**: User accounts and authentication
- **Counties**: County information and building departments
- **Permit Packages**: Main permit application data
- **Package Documents**: File uploads and document management
- **Checklist Items**: County-specific requirements
- **Progress Tracking**: Completion status and notes

### Sample Data
The system comes pre-loaded with:
- 10 Florida counties with contact information
- Complete checklists for residential and commercial projects
- Document type classifications
- Sample permit package structures

## 🔧 Configuration

### Environment Variables
```bash
# Application
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-secure-session-key

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=permitpaladin
DB_USER=permitpaladin
DB_PASSWORD=your-password

# File Storage
FILE_STORAGE_PATH=./uploads
```

### Database Configuration
- **Local PostgreSQL**: Default configuration for home servers
- **Cloud Databases**: Support for Neon, Supabase, and other providers
- **Connection Pooling**: Optimized for production workloads

## 📁 Project Structure

```
PermitPaladin-2/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                 # Express.js backend
│   ├── routes.ts          # API route definitions
│   ├── db.ts              # Database configuration
│   ├── localStorage.ts    # Local file storage
│   └── index.ts           # Server entry point
├── shared/                 # Shared code and schemas
│   └── schema.ts          # Database schema definitions
├── uploads/                # File storage directory
├── docker-compose.yml      # Docker services configuration
├── Dockerfile             # Application container
└── start.sh               # Quick start script
```

## 🛠️ Development

### Prerequisites
- **Node.js** 18.x or later
- **PostgreSQL** 13 or later
- **npm** or **yarn** package manager

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run check

# Database operations
npm run db:generate    # Generate migrations
npm run db:migrate     # Apply migrations
npm run db:push        # Push schema changes
```

### Code Quality
- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for quality checks

## 🔒 Security Features

### Authentication & Authorization
- **Session-based authentication** with secure cookies
- **Role-based access control** (user, admin)
- **Secure password handling** with bcrypt
- **CSRF protection** and security headers

### Data Protection
- **Input validation** with Zod schemas
- **SQL injection prevention** with parameterized queries
- **File upload validation** and virus scanning
- **Secure file storage** with access controls

## 📊 Performance & Scalability

### Optimization Features
- **Database indexing** for fast queries
- **Connection pooling** for database efficiency
- **File compression** and caching
- **Lazy loading** for large datasets

### Monitoring
- **Health check endpoints** for monitoring
- **Performance metrics** and logging
- **Error tracking** and alerting
- **Resource usage** monitoring

## 🚀 Production Deployment

### Recommended Setup
1. **Reverse Proxy**: Nginx for SSL termination and caching
2. **SSL Certificate**: Let's Encrypt for HTTPS
3. **Process Manager**: PM2 or systemd for reliability
4. **Monitoring**: Prometheus + Grafana for metrics
5. **Backup Strategy**: Automated database and file backups

### Scaling Considerations
- **Load Balancing**: Multiple application instances
- **Database Clustering**: Read replicas and failover
- **CDN Integration**: Static asset delivery
- **Caching Layer**: Redis for session and data caching

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Use meaningful commit messages
- Add JSDoc comments for functions
- Include unit tests for new features

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Complete deployment guide
- **[API Documentation](./docs/api.md)**: REST API reference
- **[Database Schema](./docs/schema.md)**: Database design details
- **[User Guide](./docs/user-guide.md)**: End-user documentation

## 🆘 Support & Troubleshooting

### Common Issues
- **Database Connection**: Check PostgreSQL service status
- **File Uploads**: Verify uploads directory permissions
- **Port Conflicts**: Ensure port 3000 is available
- **Memory Issues**: Add swap file for Raspberry Pi

### Getting Help
- **Logs**: Check application and system logs
- **Status**: Use `docker-compose ps` for service status
- **Health Check**: Visit `/api/health` endpoint
- **Documentation**: Review DEPLOYMENT.md for solutions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Florida Building Officials** for permit requirements
- **Open Source Community** for amazing tools and libraries
- **Construction Industry** for feedback and requirements

---

**Built with ❤️ for the construction industry**

*PermitPaladin - Making permit management simple and efficient*
