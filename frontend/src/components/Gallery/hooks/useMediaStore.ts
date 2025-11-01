// src/components/MediaGallery/hooks/useMediaStore.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { MediaFile, MediaResponse } from './types';
import { FILES_PER_PAGE, API_ENDPOINTS } from '../utils/galleryConstants';

type Category = 'gallery' | 'favorites' | 'trash';

interface MediaCache {
  gallery: MediaFile[];
  favorites: MediaFile[];
  trash: MediaFile[];
}

interface PaginationState { page: number; hasMore: boolean }

interface StoreShape {
  galleryFiles: MediaFile[];
  favoritesFiles: MediaFile[];
  trashFiles: MediaFile[];
  loading: Record<Category, boolean>;
  errors: Record<Category, string | null>;
  pagination: Record<Category, PaginationState>;
  fetchMedia: (category: Category, pageOverride?: number, reset?: boolean) => Promise<void>;
  addFilesToCache: (files: MediaFile[]) => void;
  updateFileInCache: (fileId: string, updates: Partial<MediaFile>) => void;
  removeFileFromCache: (fileId: string) => void;
  cleanupOperations: (category?: Category) => void;
  preloadAllMedia: () => Promise<void>;
  resetPreloadStatus: () => void;
}

// Module-level singleton store
const cache: MediaCache = { gallery: [], favorites: [], trash: [] };
let loading: Record<Category, boolean> = { gallery: false, favorites: false, trash: false };
let errors: Record<Category, string | null> = { gallery: null, favorites: null, trash: null };
let pagination: Record<Category, PaginationState> = {
  gallery: { page: 1, hasMore: true },
  favorites: { page: 1, hasMore: true },
  trash: { page: 1, hasMore: true },
};

// Map of in-flight fetch controllers keyed by operation (e.g. "gallery-fetch").
// We store AbortController instances here so we can cancel previous requests when a
// new fetch for the same category starts.
const abortControllers: Map<string, AbortController> = new Map();

// Subscribers are UI callbacks (registered in the hook) that should run when the
// store changes. Each subscriber will trigger a React state update in a component.
const subscribers = new Set<() => void>();

// Notify all subscribers that the store changed. This forces components using the
// store hook to re-render and pick up the latest `cache`, `loading`, and `errors`.
const notify = () => subscribers.forEach(s => s());

const updateCacheState = (category: Category, newFiles: MediaFile[]) => {
  cache[category] = newFiles;
  notify();
};

const cleanupOperations = (category?: Category) => {
  // If a specific category is provided, cancel any in-flight request for that
  // category. Otherwise, cancel all ongoing operations. This prevents overlapping
  // fetch results from racing and ensures only the latest request's response is applied.
  if (category) {
    const ctrl = abortControllers.get(`${category}-fetch`);
    if (ctrl) {
      // Abort the fetch tied to this controller. The fetch will throw an AbortError.
      ctrl.abort();
      abortControllers.delete(`${category}-fetch`);
    }
  } else {
    abortControllers.forEach(c => c.abort());
    abortControllers.clear();
  }
};

const fetchMediaImpl = async (
  category: Category,
  pageOverride?: number,
  reset: boolean = false,
  authCheck?: { isAuthenticated: boolean; user: any }
) => {
  if (!authCheck?.isAuthenticated || !authCheck?.user) return;

  const targetPage = pageOverride ?? (reset ? 1 : pagination[category].page);

  if (loading[category] || (!reset && targetPage > 1 && !pagination[category].hasMore)) return;

  // Cancel any previous fetch for this category before starting a new one.
  cleanupOperations(category);
  // Create a fresh AbortController for this network request. We save it so callers
  // can cancel it (via cleanupOperations) if a newer request starts.
  const controller = new AbortController();
  abortControllers.set(`${category}-fetch`, controller);

  loading = { ...loading, [category]: true };
  errors = { ...errors, [category]: null };
  notify();

  try {
    let url = '';
    switch (category) {
      case 'favorites':
        url = `${API_ENDPOINTS.GET_FAVORITE_FILES}?page=${targetPage}&limit=${FILES_PER_PAGE}`;
        break;
      case 'trash':
        url = `${API_ENDPOINTS.GET_DELETED_FILES}?page=${targetPage}&limit=${FILES_PER_PAGE}`;
        break;
      default:
        url = `${API_ENDPOINTS.GET_FILES}?page=${targetPage}&limit=${FILES_PER_PAGE}`;
    }

  // Use the controller.signal so this fetch can be cancelled by calling
  // controller.abort() (see cleanupOperations above). `credentials: 'include'`
  // ensures cookies are sent with the request for authentication.
  const res = await fetch(url, { credentials: 'include', signal: controller.signal });
    if (controller.signal.aborted) return;
    if (!res.ok) throw new Error(`Failed to fetch ${category}`);

    const data: MediaResponse = await res.json();
    const filteredFiles = category !== 'trash' ? data.files.filter(f => f.type !== 'other') : data.files;
    const newFiles = (reset || targetPage === 1) ? filteredFiles : [...cache[category], ...filteredFiles];

    updateCacheState(category, newFiles);

    pagination = {
      ...pagination,
      [category]: { page: targetPage + 1, hasMore: data.hasMore ?? false },
    };
    notify();
  } catch (err) {
    if ((err as any).name === 'AbortError') return;
    errors = { ...errors, [category]: err instanceof Error ? err.message : 'Failed' };
    notify();
  } finally {
    loading = { ...loading, [category]: false };
    abortControllers.delete(`${category}-fetch`);
    notify();
  }
};

const addFilesToCache = (files: MediaFile[]) => {
  if (!files.length) return;
  const existingIds = new Set([...cache.gallery, ...cache.favorites, ...cache.trash].map(f => f.id));
  const newUnique = files.filter(f => !existingIds.has(f.id));

  if (!newUnique.length) return;

  updateCacheState('gallery', [...newUnique, ...cache.gallery]);
  const favs = newUnique.filter(f => f.is_favorite);
  if (favs.length) updateCacheState('favorites', [...favs, ...cache.favorites]);
  notify();
};

const removeFileFromCache = (fileId: string) => {
  (['gallery', 'favorites', 'trash'] as const).forEach(category => {
    const newFiles = cache[category].filter(f => f.id !== fileId);
    if (newFiles.length !== cache[category].length) updateCacheState(category, newFiles);
  });
};

const updateFileInCache = (fileId: string, updates: Partial<MediaFile>) => {
  (['gallery', 'favorites', 'trash'] as const).forEach(category => {
    const index = cache[category].findIndex(f => f.id === fileId);
    if (index === -1) return;

    const updatedFile = { ...cache[category][index], ...updates };
    let newFiles = cache[category].map((f, i) => (i === index ? updatedFile : f));

    if (updates.is_favorite === false && category === 'favorites') {
      newFiles = newFiles.filter(f => f.id !== fileId);
    }
    updateCacheState(category, newFiles);
  });
};

const preloadAllMedia = async (authCheck?: { isAuthenticated: boolean; user: any }) => {
  if (!authCheck?.isAuthenticated || !authCheck?.user) return;
  await Promise.allSettled([
    fetchMediaImpl('gallery', 1, true, authCheck),
    fetchMediaImpl('favorites', 1, true, authCheck),
    fetchMediaImpl('trash', 1, true, authCheck),
  ]);
};

const resetPreloadStatus = () => {
  cache.gallery = [];
  cache.favorites = [];
  cache.trash = [];
  pagination = {
    gallery: { page: 1, hasMore: true },
    favorites: { page: 1, hasMore: true },
    trash: { page: 1, hasMore: true },
  };
  cleanupOperations();
  notify();
};

// returns the store API (the shared media cache + actions).
// on mount sets subscribers and on unmount removes them
export const useMediaStore = (): StoreShape => {
  const { user, isAuthenticated } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    const sub = () => setTick(t => t + 1);
    subscribers.add(sub);
    
    return () => {
      subscribers.delete(sub);
    };
  }, []);


  const fetchMedia = (category: Category, pageOverride?: number, reset: boolean = false) =>
    fetchMediaImpl(category, pageOverride, reset, { isAuthenticated, user });

  return {
    galleryFiles: cache.gallery,
    favoritesFiles: cache.favorites,
    trashFiles: cache.trash,
    loading,
    errors,
    pagination,
    fetchMedia,
    addFilesToCache,
    updateFileInCache,
    removeFileFromCache,
    cleanupOperations,
    preloadAllMedia: () => preloadAllMedia({ isAuthenticated, user }),
    resetPreloadStatus,
  };
};
