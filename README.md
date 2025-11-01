# NetDrive - Secure Cloud Storage & Media Gallery

<div align="center">

[![NetDrive Demo - Live Application Walkthrough](https://img.youtube.com/vi/jo7S_rSb3O4/maxresdefault.jpg)](https://youtu.be/jo7S_rSb3O4)

*Click above to watch the full NetDrive demonstration*

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
├── 🎨 Frontend/          # React + TypeScript SPA
│   ├── Material-UI       # Modern component library
│   ├── Vite             # Fast build tool
│   └── Responsive       # Mobile-first design
└── ⚙️ Backend/           # Node.js + Express API
    ├── PostgreSQL       # Robust database
    ├── JWT Auth         # Secure authentication
    ├── AES Encryption   # File security
    └── PM2 + Nginx      # Production deployment
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

## 🚀 Quick Start

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