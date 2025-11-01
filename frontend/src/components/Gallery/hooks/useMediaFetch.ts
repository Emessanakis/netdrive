// src/components/MediaGallery/hooks/useMediaFetch.ts - REVERTED TO DIRECT ACCESS
import { useCallback } from 'react';
import { useMediaStore } from './useMediaStore';

export const useMediaFetch = () => {
  const mediaStore = useMediaStore();
  
  // Directly access the store's latest immutable array. 
  // Any change to mediaStore.galleryFiles will force this hook to re-run.
  const mediaFiles = mediaStore.galleryFiles;
  
  const loading = mediaStore.loading.gallery;
  const error = mediaStore.errors.gallery;
  const { page: currentPage, hasMore } = mediaStore.pagination.gallery; 

  const fetchMore = useCallback(() => {
    mediaStore.fetchMedia('gallery', currentPage, false);
  }, [mediaStore, currentPage]);

  const refreshMedia = useCallback((preservePagination: boolean = false) => {
    const targetPage = preservePagination && currentPage > 1 ? currentPage - 1 : 1;
    mediaStore.fetchMedia('gallery', targetPage, !preservePagination);
  }, [mediaStore, currentPage]);

  return {
    mediaFiles,
    loading,
    error,
    hasMore,
    currentPage,
    fetchMore,
    refreshMedia,
  };
};