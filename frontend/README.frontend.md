# NetDrive — Frontend (React + TypeScript + Vite)

A simple, focused frontend for the NetDrive gallery app. This README gives a concise overview for developers: what the app does, the main technologies, how to run it locally, and where to find the important code.

🏷️ Project Title

NetDrive — a gallery and file-management frontend built with React, TypeScript and Vite.

📖 Overview / Description

This frontend implements a user-facing gallery where users can upload files (images & videos), preview and manage them (favorite, soft-delete, permanent delete), and view storage usage. It includes:

- Optimistic upload flow with previews.
- A shared, module-scoped media store to keep gallery, favorites and trash in sync across components.
- Lightbox/MediaDialog for image/video preview and quick actions.
- Centralized snackbar (toasts) for user-visible responses.
- Auth bootstrapping that checks session state before rendering core routes.

🚀 Demo / Preview

Add screenshots, GIFs or a deployed link here.

Example:
Live Demo: https://your-deploy.example.com

⚙️ Tech Stack

- Framework: React (Vite + TypeScript)
- UI: MUI (Material UI)
- State: Module-scoped singleton store (custom hook: `useMediaStore`)
- Uploads: react-dropzone + fetch
- Bundler: Vite
- Backend: Node/Express (JWT) — API endpoints configured via env var `VITE_API_URL`

📁 Key files & folders

- `src/components/Gallery/` — Gallery UI, upload area, cards, dialog, utilities.
  - `GalleryUpload.tsx` — drag/drop UI, upload queue, optimistic insert and normalization.
  - `components/MediaCard/` — per-item card and thumbnail handling.
  - `components/MediaDialog/` — lightbox with actions (restore, delete, share).
  - `hooks/useMediaStore.ts` — shared media cache, fetch & pagination logic.

- `src/context/AuthContext.tsx` — auth state, signin/signout helpers and session check.
- `src/components/Snackbar/` — centralized snackbar provider and UI used across app.
- `src/components/Loader/` — app loaders and auth route loader (enforce min visible duration).
- `src/constants.ts` — canonical API endpoints used across the frontend.

🔧 Environment variables

- `VITE_API_URL` — base URL for your backend API (example: `https://api.example.com`).

Make sure this is declared in your `.env` or environment for dev/production.

🚀 Run & build (PowerShell)

From the `frontend` folder:

```powershell
# install deps
npm install

# dev server (hot reload)
npm run dev

# build for production
npm run build
```

If your package scripts differ, inspect `frontend/package.json`.

🧭 Development notes & tips

- The media store is a singleton module used by components that need lists or file updates. When you update a file (favorite, update thumbnail, delete), call `updateFileInCache` so all subscribers refresh.
- Upload previews use `URL.createObjectURL`. Revoke previews when cleaned up to avoid memory leaks.
- Thumbnail handling: the client prefers server-side `download-thumbnail` endpoints (see `API_ENDPOINTS.DOWNLOAD_THUMBNAIL`). If backend returns legacy thumbnail paths, the client normalizes them before requesting.
- Centralized snackbars make it easy to replace console.error calls with user-facing messages. Use `useSnackbar()` to show a message with a variant (`'success' | 'error' | 'info' | 'warning'`).
- Auth boot: the app calls `/api/auth/me` on boot to restore session. The loader enforces a minimum duration to avoid flashing. The auth call is deduped across concurrent mounts.

📦 Production notes

- Vite builds a few large chunks (you may see chunk-size warnings). Consider code-splitting larger routes/components as needed.
- Ensure backend CORS and cookies are configured properly; the frontend uses `credentials: 'include'` for auth calls.

🤝 Contributing

- Fixes and improvements: open a PR against the `frontend` folder. Keep changes small and add a short description of the UX or API contract you changed.
- Tests: adding unit tests for `useMediaStore` and upload normalization is a high value contribution.

📞 Contact / Support

Report issues or request features by opening an issue in the repository. Include repro steps and relevant network console logs for API issues.

---

If you'd like, I can also:
- Add a `.env.example` file with `VITE_API_URL=...`.
- Add screenshots / demo GIFs and a short CONTRIBUTING.md.

