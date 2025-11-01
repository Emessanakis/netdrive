// src/components/MediaDashboard/index.ts
export { default as GalleryMedia } from './GalleryMedia';
export { default as FavoritesMedia } from './FavoritesMedia';
export { default as TrashMedia } from './TrashMedia';
export { MediaCard } from './components/MediaCard';
export { MediaGrid } from './components/MediaGrid';
export { MediaDialog } from './components/MediaDialog';
export type { MediaFile, MediaResponse } from './hooks/types';
export { useMediaStore } from './hooks/useMediaStore';