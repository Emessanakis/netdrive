// src/components/MediaGallery/hooks/useFavoritesFetch.ts - FINAL FIX: LOCAL STATE TRACKING
import { useState, useEffect, useCallback } from 'react';
import { useMediaStore } from './useMediaStore';
import type { MediaFile } from './types'; 

export const useFavoritesFetch = () => {
  const mediaStore = useMediaStore();
  
  // 1. Get the source data array directly from the store
  const sourceFavorites = mediaStore.favoritesFiles;

  // 2. Local state to hold the files
  const [favorites, setFavorites] = useState<MediaFile[]>(sourceFavorites);

  // 3. EFFECT: Update local state whenever the source data array reference changes.
  // This guarantees a re-render in FavoritesMedia.tsx after any mutation.
  useEffect(() => {
    // Only update if the array reference itself changes
    if (sourceFavorites !== favorites) {
        setFavorites(sourceFavorites);
    }
  }, [sourceFavorites]); 

  const loading = mediaStore.loading.favorites;
  const error = mediaStore.errors.favorites;
  const { page: currentPage, hasMore } = mediaStore.pagination.favorites; 
  
  const fetchMore = useCallback(() => {
    mediaStore.fetchMedia('favorites', currentPage, false);
  }, [mediaStore, currentPage]);

  const refreshFavorites = useCallback((preservePagination: boolean = false) => {
    const targetPage = preservePagination && currentPage > 1 ? currentPage - 1 : 1;
    mediaStore.fetchMedia('favorites', targetPage, !preservePagination);
  }, [mediaStore, currentPage]);

  return {
    favorites, // Return local state
    loading,
    error,
    hasMore,
    currentPage,
    fetchMore,
    refreshFavorites,
  };
};