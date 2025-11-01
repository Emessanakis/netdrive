// Centralized API endpoint constants.
// Use import.meta.env.VITE_API_URL as the base so Vite env works in dev and prod builds.
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export const API_ENDPOINTS = {
  STORAGE_STATS: `${API_BASE}/api/auth/user/storage-stats`,
  UPLOAD: `${API_BASE}/api/auth/upload`,
  GET_FILE: (id: string) => `${API_BASE}/api/auth/get-file/${id}`,
  FILE: (id: string) => `${API_BASE}/api/auth/file/${id}`,
  DOWNLOAD_THUMBNAIL: (id: string) => `${API_BASE}/api/auth/download-thumbnail/${id}`,
  ME: `${API_BASE}/api/auth/me`,
  SIGNOUT: `${API_BASE}/api/auth/signout`,
};

export default API_ENDPOINTS;
