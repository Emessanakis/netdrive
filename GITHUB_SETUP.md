# NetDrive - GitHub Setup Guide

This guide will help you upload your NetDrive project to GitHub safely, excluding sensitive files.

## ✅ Files Already Configured

### Security Files Created:
- ✅ `.gitignore` files (root, frontend, backend) - Excludes sensitive files
- ✅ `.env.example` files - Templates showing required environment variables
- ✅ `uploads/.gitkeep` - Preserves directory structure without files

### What's Protected:
- ❌ `node_modules/` directories (too large for Git)
- ❌ `.env` files (contain your secrets)
- ❌ `uploads/*` files (user data)
- ❌ SSL certificates and production secrets
- ❌ Build outputs and cache files
- ❌ IDE and OS-specific files

## 🚀 Upload to GitHub Steps

### 1. Add All Files to Git
```bash
# Add all files (respecting .gitignore)
git add .

# Check what will be committed
git status
```

### 2. Make Initial Commit
```bash
git commit -m "Initial commit: NetDrive production application

- Added React + TypeScript frontend with MUI
- Added Node.js + Express backend with PostgreSQL
- Configured for production deployment on DigitalOcean
- Includes PM2 and Nginx configuration
- Added comprehensive documentation"
```

### 3. Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "+" → "New repository"
3. Repository name: `netdrive`
4. Description: `NetDrive - Secure cloud storage and media gallery application`
5. Make it **Private** (recommended for production apps)
6. ⚠️ **DO NOT** initialize with README (you already have one)
7. Click "Create repository"

### 4. Connect Local Repository to GitHub
```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/netdrive.git

# Verify remote
git remote -v
```

### 5. Push to GitHub
```bash
# Push to main branch
git branch -M main
git push -u origin main
```

## 🔧 Environment Setup for Contributors

When someone clones your repository, they need to:

### Backend Setup:
1. Copy `.env.example` to `.env`
2. Fill in actual values:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with real database credentials
   ```

### Frontend Setup:
1. Copy `.env.example` to `.env`
2. Set the API URL:
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with correct VITE_API_URL
   ```

## 📝 Repository Structure

```
netdrive/
├── .gitignore              # Root gitignore
├── README.md               # Project overview (auto-generated)
├── backend/
│   ├── .gitignore         # Backend-specific ignores
│   ├── .env.example       # Environment template
│   ├── README.md          # Backend documentation
│   ├── package.json       # Backend dependencies
│   ├── server.js          # Application entry
│   ├── ecosystem.config.js # PM2 configuration
│   ├── uploads/.gitkeep   # Preserves upload directory
│   └── app/               # Application code
└── frontend/
    ├── .gitignore         # Frontend-specific ignores
    ├── .env.example       # Environment template
    ├── README.md          # Frontend documentation
    ├── package.json       # Frontend dependencies
    ├── vite.config.ts     # Vite configuration
    └── src/               # Source code
```

## 🔒 Security Best Practices

### What's Safe to Share:
- ✅ Source code
- ✅ Configuration templates (.env.example)
- ✅ Documentation
- ✅ Package.json files
- ✅ Build configurations

### Never Commit:
- ❌ `.env` files with real credentials
- ❌ `node_modules/` directories
- ❌ Production database backups
- ❌ User uploaded files
- ❌ SSL private keys
- ❌ API keys or secrets

## 🌐 Deployment Notes

This repository contains production-ready code that's currently deployed at:
- **Frontend:** Static files served by Nginx
- **Backend:** Node.js app managed by PM2
- **Database:** DigitalOcean PostgreSQL cluster
- **Infrastructure:** DigitalOcean Droplet with SSL

## 📋 Next Steps After Upload

1. **Add Collaborators** (if needed):
   - Go to Settings → Manage access → Invite a collaborator

2. **Set up Branch Protection**:
   - Go to Settings → Branches → Add rule
   - Protect `main` branch
   - Require pull request reviews

3. **Add Repository Secrets** (for CI/CD):
   - Go to Settings → Secrets and variables → Actions
   - Add production environment variables

4. **Create Issues/Projects**:
   - Use GitHub Issues for bug tracking
   - Create Project boards for feature planning

## 🆘 Troubleshooting

### If you accidentally commit sensitive files:
```bash
# Remove from Git but keep local file
git rm --cached filename
git commit -m "Remove sensitive file from tracking"

# For already pushed commits, you'll need to rewrite history
# This is dangerous - consider creating a new repository instead
```

### If .gitignore isn't working:
```bash
# Clear Git cache and re-add files
git rm -r --cached .
git add .
git commit -m "Fix .gitignore"
```