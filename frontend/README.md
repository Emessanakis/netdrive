# NetDrive — Frontend

A modern file management and media gallery application built with React, TypeScript, and Vite. NetDrive provides users with secure cloud storage, media organization, and seamless file sharing capabilities.

## Project Summary

NetDrive Frontend is a production-deployed Single Page Application (SPA) that offers:
- **Media Gallery** — Browse, view, and organize images and videos with an intuitive grid layout
- **File Upload** — Drag & drop or click to upload with real-time progress tracking (currently 10MB, scaling to 10GB)
- **Storage Management** — Visual storage usage tracking with interactive donut charts
- **User Authentication** — Secure login/signup with Google OAuth integration
- **File Operations** — Favorites, trash/restore, permanent deletion, and sharing
- **Responsive Design** — Optimized for desktop and mobile devices
- **Production Security** — HTTPS-only access with Content Security Policy headers

## Tech Stack / Technologies Used

- **Frontend Framework:** React 19.1.1
- **Language:** TypeScript 5.8.3
- **Build Tool:** Vite 7.1.7
- **UI Library:** Material-UI (MUI) 7.3.2 with Emotion styling
- **Routing:** React Router DOM 7.9.2
- **Authentication:** Google OAuth (@react-oauth/google)
- **File Handling:** React Dropzone 14.3.8
- **Encryption:** CryptoJS 4.2.0
- **Styling:** SASS 1.93.2
- **Linting:** ESLint 9.36.0 with TypeScript support

## Folder Structure

```
frontend/
├── src/
│   ├── components/           # React component library
│   │   ├── CreateUser/       # Admin user creation interface
│   │   │   └── CreateUser.tsx
│   │   ├── Dashboard/        # Main application layout
│   │   │   ├── Content.tsx   # Dynamic content area
│   │   │   ├── Dashboard.tsx # Layout container
│   │   │   └── Sidebar.tsx   # Navigation & role-based menu
│   │   ├── Gallery/          # Media management system
│   │   │   ├── components/   # Gallery subcomponents
│   │   │   │   ├── DialogControls/     # Dialog management & state
│   │   │   │   ├── MediaCard/          # File display cards & actions
│   │   │   │   ├── MediaDialog/        # Full-screen media preview
│   │   │   │   ├── MediaGrid/          # Responsive grid layout & virtualization
│   │   │   │   └── SkeletonLoader/     # Loading states & placeholders
│   │   │   ├── hooks/        # Custom React hooks for media management
│   │   │   │   ├── index.ts            # Hook exports
│   │   │   │   ├── types.ts            # TypeScript interfaces & types
│   │   │   │   ├── useFavoritesFetch.ts # Favorites data fetching
│   │   │   │   ├── useMediaActions.ts   # File operations (delete, restore, etc.)
│   │   │   │   ├── useMediaFetch.ts     # Gallery data fetching
│   │   │   │   ├── useMediaStore.ts     # Global media state management
│   │   │   │   └── useTrashFetch.ts     # Trash/deleted files fetching
│   │   │   ├── utils/        # Gallery utilities & constants
│   │   │   │   └── galleryConstants.ts  # API endpoints & config
│   │   │   ├── FavoritesMedia.tsx       # Favorites management view
│   │   │   ├── GalleryMedia.tsx         # Main gallery view & upload
│   │   │   ├── GalleryUpload.tsx        # File upload interface & storage chart
│   │   │   ├── StorageDonutChart.tsx    # 🆕 Storage usage visualization
│   │   │   ├── StorageDonutChartSkeleton.tsx # 🆕 Storage chart loading skeleton
│   │   │   ├── TrashMedia.tsx           # Deleted files management
│   │   │   └── index.ts                 # Gallery component exports
│   │   ├── Loader/           # Global loading components
│   │   ├── Login/            # Authentication interface
│   │   ├── MediaPreloader/   # Media loading optimization
│   │   ├── Privacy/          # Privacy policy pages
│   │   ├── Profile/          # User profile management
│   │   ├── Register/         # User registration forms
│   │   ├── Routes/           # Route protection & navigation
│   │   ├── Snackbar/         # Global notification system
│   │   ├── Terms/            # Terms of service pages
│   │   └── Topbar/           # App header & user menu
│   ├── Routes/          # Route configuration
│   └── Topbar/         # Navigation header
│   ├── context/              # React context providers
│   │   └── AuthContext.tsx   # Authentication & role state management
│   ├── assets/               # Static assets (images, icons)
│   ├── constants.ts          # API endpoints and app constants
│   └── main.tsx             # Application entry point
├── public/                   # Static public assets
└── build configuration       # Vite, TypeScript, ESLint configs
```

## 👥 Role-Based UI Features

### Role-Responsive Interface
The frontend dynamically adapts based on user roles, providing appropriate access and functionality:

#### 🔴 **Admin Interface (ROLE_ADMIN)**
- ✅ **User Management:** Access to CreateUser component for inviting new users
- ✅ **Full Gallery:** All file operations with administrative controls
- ✅ **Sidebar Menu:** Complete navigation including admin-only options
- ✅ **Storage Analytics:** Comprehensive storage and user statistics
- ✅ **System Controls:** Access to all application features

#### 🟡 **Moderator Interface (ROLE_MODERATOR)**
- ✅ **Enhanced Gallery:** Full file management with advanced features
- ✅ **Storage Tools:** Analytics and organization capabilities  
- 🔄 **Future: Support Dashboard** — Ticketing system interface (planned)
- ❌ **Restrictions:** No user creation or admin-specific controls

#### 🟢 **User Interface (ROLE_USER)**
- ✅ **Core Gallery:** Upload, organize, favorites, trash management
- ✅ **Storage Charts:** Personal storage usage visualization
- ✅ **File Operations:** Complete file lifecycle management
- ❌ **Restrictions:** No admin features or user management access

### Role-Based Components

#### **Sidebar Navigation (Sidebar.tsx)**
```typescript
// Role-based menu rendering
{user?.role === 'ROLE_ADMIN' && (
  <ListItem onClick={() => navigate('/create-user')}>
    <ListItemIcon><PersonAdd /></ListItemIcon>
    <ListItemText primary="Create User" />
  </ListItem>
)}
```

#### **CreateUser Component**
- **Protection:** Admin-only access with role verification
- **Security:** Client-side and server-side permission checks
- **Features:** User invitation, role assignment, plan selection

#### **Storage Analytics**
- **Personal View:** Individual storage usage for all roles
- **Admin Insights:** System-wide storage analytics (admin-only)
- **Interactive Charts:** Real-time donut charts with skeleton loading

## Key Files & Responsibilities

- **`GalleryUpload.tsx`** — Drag & drop upload area with queue management and optimistic UI updates
- **`StorageDonutChart.tsx`** — Interactive storage usage visualization with responsive design
- **`Dashboard.tsx`** — Main application layout with sidebar navigation
- **`AuthContext.tsx`** — Centralized authentication state management
- **`constants.ts`** — API endpoint definitions and configuration
- **`main.tsx`** — Application bootstrap and router setup

## Installation & Setup

### Production Infrastructure
NetDrive Frontend is deployed on production infrastructure:
- **Server:** DigitalOcean Droplet with Nginx
- **SSL:** Let's Encrypt certificates with Certbot
- **Domain:** Production domain with HTTPS-only access
- **CDN:** Nginx serving static assets with optimized caching

### Local Development Setup

#### Prerequisites
- Node.js >= 18.0.0
- npm or yarn package manager

#### Steps

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the frontend root:
   ```env
   # For local development
   VITE_API_URL=http://localhost:8080
   
   # For production
   VITE_API_URL=https://yourdomain.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## Environment Variables

Create a `.env` file in the frontend root with:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8080` |

## Available Scripts / Commands

From the `frontend` folder:

```powershell
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

## Core Frontend Concepts

### Shared Media Store (Singleton)
The gallery uses a module-scoped media store that centralizes:
- File metadata and thumbnails
- Upload progress and queue management  
- Favorite/trash state synchronization
- Real-time UI updates across components

This prevents stale UI when files are modified from different components (e.g., delete from dialog, upload from upload panel).

### Upload Flow (Optimistic + Preview)
1. **File Selection** — Drag & drop or file picker
2. **Immediate Preview** — Show files in upload queue with progress
3. **Optimistic Updates** — Add files to gallery before upload completes
4. **Error Handling** — Remove failed uploads and show error messages
5. **Completion** — Update with server response data

### Authentication & Session Management
- Cookie-based sessions with `credentials: 'include'`
- Google OAuth integration for social login
- Automatic session validation on app load
- Protected route handling

## Build & Deployment

### Production Deployment
NetDrive Frontend is deployed as a static SPA with enterprise-grade infrastructure:

- **Build Process:** Vite production build with optimized assets
- **Deployment Location:** `/var/www/netdrive/dist` on DigitalOcean Droplet
- **Web Server:** Served directly by Nginx with optimized caching
- **SSL/HTTPS:** Let's Encrypt certificates with automatic renewal
- **Content Security Policy:** Strict CSP headers for enhanced security
- **Performance:** Gzip compression and browser caching enabled

### Production Build Process
```bash
# Build optimized production bundle
npm run build

# Deploy to production server
# Files are served directly from /var/www/netdrive/dist
```

### Nginx SPA Configuration
- **History API Support:** `try_files` directive for client-side routing
- **Security Headers:** CSP, HSTS, and other security headers
- **Asset Optimization:** Gzip compression for static assets
- **Caching Strategy:** Long-term caching for versioned assets

### Build Configuration
- **Output Directory:** `dist/`
- **Chunk Size Warning:** 500KB limit for optimal loading
- **Asset Optimization:** Minification, tree-shaking, and code splitting
- **Source Maps:** Generated for production debugging

## Known Issues / Future Improvements

### Current Limitations
- File upload currently limited to 10MB (infrastructure supports 10GB)
- File upload limited to images and videos only
- No offline functionality
- Mobile upload UX could be improved

### Planned Features
- **File Size Scaling** — Increase upload limit from 10MB to full 10GB capacity
- Progressive Web App (PWA) support
- Bulk file operations
- Advanced search and filtering
- File sharing with expiration dates
- Video transcoding and streaming

## Production Infrastructure Details

### Nginx Configuration Features
- **SPA Support:** Client-side routing with fallback to `index.html`
- **Security Headers:** Content Security Policy, HSTS, X-Frame-Options
- **Performance:** Gzip compression, browser caching, and asset optimization
- **SSL Termination:** Automatic HTTPS redirect and certificate management
- **Large File Support:** 10GB upload limit for media files

### Security Implementation
- **Content Security Policy:** Strict CSP headers preventing XSS attacks
- **HTTPS Only:** All HTTP traffic automatically redirected to HTTPS
- **Google OAuth Integration:** Secure authentication with CSP-compliant policies
- **API Security:** CORS-enabled communication with backend

### Performance Optimizations
- **Static Asset Serving:** Direct Nginx serving for optimal performance
- **Gzip Compression:** Reduced bandwidth usage for all text assets
- **Browser Caching:** Long-term caching for versioned assets
- **Code Splitting:** Lazy loading of route components

## Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use ESLint configuration provided
3. Write responsive components with MUI breakpoints
4. Implement error boundaries for robust error handling
5. Add loading states for better UX
6. Test with production API endpoints when possible

### Pull Request Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and test thoroughly
4. Run linter: `npm run lint`
5. Build project: `npm run build`
6. Test production build: `npm run preview`
7. Submit pull request with clear description

## License

This project is licensed under the ISC License.

## Troubleshooting

## Where to change behavior

## Next improvements (suggested)

If you'd like, I can also generate a short developer script that starts both frontend and backend concurrently for local development.
