# NetDrive - Secure Cloud Storage & Media Gallery

<div align="center">

![NetDrive Demo](gifs/NetDrive%20Login.gif)

*NetDrive in action: Upload → Organize → Share*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-emessanakis.gr-blue?style=for-the-badge)](https://emessanakis.gr)
[![Frontend](https://img.shields.io/badge/Frontend-React_+_TypeScript-61DAFB?style=for-the-badge&logo=react)](./frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=for-the-badge&logo=node.js)](./backend)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

</div>

## 🚀 Live Application

**🌐 [Try NetDrive Live](https://emessanakis.gr)**

### 🧪 Test Account
Use these credentials to explore the application:
- **Username:** `test.user`
- **Password:** `TestPassword1!#`

*Feel free to upload test images, organize files, and explore all features!*

## 📖 Overview

NetDrive is a modern, secure cloud storage solution that combines the simplicity of personal file management with enterprise-grade security. Built with React and Node.js, it offers a seamless experience for storing, organizing, and sharing your media files.

### ✨ Key Features

- 🖼️ **Media Gallery** - Intuitive grid view for photos and videos
- 📁 **Smart Organization** - Folders, favorites, and trash management  
- 🔒 **Enterprise Security** - AES-GCM encryption and secure authentication
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- ☁️ **Cloud Infrastructure** - Deployed on DigitalOcean with SSL
- 🔐 **Google OAuth** - Secure login with your Google account
- 📊 **Storage Analytics** - Visual storage usage tracking

### 🎯 Current Capabilities

- **File Upload:** 10MB limit (infrastructure ready for 10GB)
- **File Types:** Images (JPEG, PNG, GIF, WebP) and Videos (MP4, WebM, AVI)
- **Storage:** Encrypted file storage with automatic thumbnails
- **Sharing:** Secure file access and organization
- **Authentication:** Email/password and Google OAuth

## 🏗️ Architecture

```
NetDrive/
├── 📁 backend/                    # Node.js + Express API Server
│   ├── 📱 app/
│   │   ├── 🎛️  config/            # Database & authentication config
│   │   ├── 🎮 controllers/        # HTTP method organized controllers
│   │   │   ├── auth/              # Authentication & user management
│   │   │   │   ├── getRequests/   # GET endpoints (files, storage, etc.)
│   │   │   │   ├── postRequests/  # POST endpoints (upload, signup, etc.)
│   │   │   │   ├── putRequests/   # PUT endpoints (restore, favorites, etc.)
│   │   │   │   └── deleteRequests/ # DELETE endpoints (permanent delete)
│   │   │   └── user/              # User access & role management
│   │   ├── 🛡️  middleware/         # Authentication, validation, upload
│   │   ├── 🗄️  models/             # Sequelize database models
│   │   │   ├── associations.js    # Model relationships
│   │   │   └── *.model.js         # Individual entity models
│   │   ├── 🛣️  routes/             # Express route definitions
│   │   ├── 📧 services/           # Email & external service integrations
│   │   ├── 🔧 utils/              # Encryption, helpers, initialization
│   │   └── ✅ validators/         # Input validation schemas
│   ├── 📦 uploads/                # Encrypted file storage
│   └── 🗃️  *.js, *.json           # Server config & dependencies
├── 📱 frontend/                   # React + TypeScript SPA
│   ├── 🎨 src/
│   │   ├── 🧩 components/         # React components
│   │   │   ├── CreateUser/        # Admin user management
│   │   │   ├── Dashboard/         # Main app interface & content routing
│   │   │   ├── Gallery/           # Media management & storage analytics
│   │   │   ├── Loader/            # Loading indicators & skeletons
│   │   │   ├── Login/             # Authentication UI
│   │   │   ├── MediaPreloader/    # Media optimization & preloading
│   │   │   ├── Privacy/           # Privacy policy components
│   │   │   ├── Profile/           # User profile management
│   │   │   ├── Register/          # User registration forms
│   │   │   ├── Routes/            # Route protection & navigation
│   │   │   ├── Snackbar/          # Global notification system
│   │   │   ├── Terms/             # Terms of service components
│   │   │   └── Topbar/            # App header & user menu
│   │   ├── 🔗 context/            # React Context (Auth state)
│   │   └── 📋 constants.ts        # API endpoints & config
│   └── 🏗️  build tools            # Vite, TypeScript, Material-UI
└── 🎬 gifs/                       # Demo & documentation media
```

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19.1.1 with TypeScript 5.8.3
- **UI Library:** Material-UI 7.3.2 with Emotion styling
- **Build Tool:** Vite 7.1.7 for fast development and builds
- **Authentication:** Google OAuth integration
- **File Handling:** React Dropzone with progress tracking

### Backend
- **Runtime:** Node.js 18+ with Express.js 4.18.2
- **Database:** PostgreSQL with Sequelize ORM
- **Security:** bcryptjs, JWT tokens, AES-GCM encryption
- **File Processing:** Sharp for images, FFmpeg for videos
- **Email:** Nodemailer with HTML templates

### Infrastructure
- **Hosting:** DigitalOcean Droplet with managed PostgreSQL
- **Web Server:** Nginx reverse proxy with SSL termination
- **SSL:** Let's Encrypt certificates via Certbot
- **Process Management:** PM2 for zero-downtime deployments
- **Security:** CSP headers, HTTPS redirects, secure cookies

## � User Roles & Permissions

NetDrive implements a comprehensive role-based access control system with three distinct user levels:

### 🔴 **Administrator (ROLE_ADMIN)**
**Full System Control** - Complete access to all functionality
- ✅ **User Management:** Create users, reset passwords, manage roles
- ✅ **Core File Operations:** Upload, download, organize, delete files
- ✅ **Advanced Features:** Storage analytics, soft/hard delete, favorites
- ✅ **System Access:** All API endpoints and admin-only features
- ✅ **Security:** Access to encrypted file storage and audit logs

### 🟡 **Moderator (ROLE_MODERATOR)** 
**Support & Moderation** - Enhanced user with future ticketing system support
- ✅ **Core File Operations:** Upload, download, organize, delete files  
- ✅ **Advanced Features:** Storage analytics, soft/hard delete, favorites
- 🔄 **Future: Ticketing System** — Handle user support requests and bug reports
- 🔄 **Future: Content Moderation** — Review and manage user content
- ❌ **Restrictions:** Cannot create users or reset passwords

### 🟢 **User (ROLE_USER)**
**Standard Access** - Core file management functionality
- ✅ **File Operations:** Upload (10MB limit), download, organize files
- ✅ **Organization:** Create folders, mark favorites, manage trash
- ✅ **Storage Management:** View storage usage with interactive charts
- ✅ **File Lifecycle:** Soft delete (move to trash) and permanent deletion
- ✅ **Security:** Personal encrypted storage with secure access
- ❌ **Restrictions:** Cannot access admin features or manage other users

### 🔐 **Role Assignment**
- **Default:** New users receive `ROLE_USER` permissions
- **Admin Creation:** Only administrators can create users and assign roles
- **Security:** Role checks enforced at middleware level with JWT authentication
- **Scalable:** Role system ready for future permission expansions

## �🚀 Quick Start

### 📋 Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database
- npm or yarn package manager

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Emessanakis/netdrive.git
   cd netdrive
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

4. **Visit Application**
   Open http://localhost:5173 in your browser

## 📚 Documentation

- 📖 **[Frontend Documentation](./frontend/README.md)** - React app setup, components, and deployment
- 📖 **[Backend Documentation](./backend/README.md)** - API endpoints, database schema, and server configuration
- 🚀 **[GitHub Setup Guide](./GITHUB_SETUP.md)** - Version control and deployment instructions

## 🌐 Production Deployment

The application is production-ready with:

- **🔒 Security:** HTTPS-only, CSP headers, encrypted file storage
- **⚡ Performance:** Nginx optimization, asset compression, CDN-ready
- **🛡️ Reliability:** PM2 process management, automatic SSL renewal
- **📊 Monitoring:** Comprehensive logging and error tracking

### Infrastructure Details
- **Server:** DigitalOcean Droplet (Ubuntu)
- **Database:** DigitalOcean Managed PostgreSQL Cluster
- **Domain:** SSL-secured with automatic certificate renewal
- **Backup:** Database automated backups with point-in-time recovery

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit with clear messages:** `git commit -m 'Add amazing feature'`
5. **Push to your branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write responsive, accessible components
- Include comprehensive error handling
- Add tests for new functionality
- Update documentation as needed

## 📈 Roadmap

### 🎯 Next Phase (v2.0)
- [ ] **File Size Scaling** - Upgrade from 10MB to 10GB uploads
- [ ] **Advanced Search** - File content and metadata search
- [ ] **Bulk Operations** - Multi-file actions and batch uploads
- [ ] **File Sharing** - Public links with expiration dates
- [ ] **Video Streaming** - In-browser video player with transcoding

### 🔮 Future Features (v3.0+)
- [ ] **Mobile Apps** - Native iOS and Android applications
- [ ] **Collaboration** - Real-time file sharing and comments
- [ ] **API Integration** - Third-party service connections
- [ ] **Advanced Analytics** - Usage insights and reporting
- [ ] **Enterprise Features** - Team management and advanced permissions

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- **🐛 Bug Reports:** [GitHub Issues](https://github.com/Emessanakis/netdrive/issues)
- **💡 Feature Requests:** [GitHub Discussions](https://github.com/Emessanakis/netdrive/discussions)
- **📧 Contact:** [Create an Issue](https://github.com/Emessanakis/netdrive/issues/new)

---

<div align="center">

**⭐ If you find NetDrive helpful, please give it a star! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/Emessanakis/netdrive?style=social)](https://github.com/Emessanakis/netdrive/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Emessanakis/netdrive?style=social)](https://github.com/Emessanakis/netdrive/network/members)

Made with ❤️ using React, Node.js, and modern web technologies

</div>