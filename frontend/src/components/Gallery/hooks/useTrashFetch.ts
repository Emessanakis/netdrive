// src/components/MediaGallery/hooks/useTrashFetch.ts - FINAL FIX: LOCAL STATE TRACKING
import { useState, useEffect, useCallback } from 'react';
import { useMediaStore } from './useMediaStore';
import type { MediaFile } from './types'; 

export const useTrashFetch = () => {
  const mediaStore = useMediaStore();
  
  // 1. Get the source data array directly from the store
  const sourceTrashFiles = mediaStore.trashFiles;

  // 2. Local state to hold the files
  const [trashFiles, setTrashFiles] = useState<MediaFile[]>(sourceTrashFiles);

  // 3. EFFECT: Update local state whenever the source data array reference changes.
  // This guarantees a re-render in TrashMedia.tsx after any mutation.
  useEffect(() => {
    if (sourceTrashFiles !== trashFiles) {
        setTrashFiles(sourceTrashFiles);
    }
  }, [sourceTrashFiles]); 
  
  const loading = mediaStore.loading.trash;
  const error = mediaStore.errors.trash;
  const { page: currentPage, hasMore } = mediaStore.pagination.trash; 
  
  const fetchMore = useCallback(() => {
    mediaStore.fetchMedia('trash', currentPage, false);
  }, [mediaStore, currentPage]);

  const refreshTrash = useCallback((preservePagination: boolean = false) => {
    const targetPage = preservePagination && currentPage > 1 ? currentPage - 1 : 1;
    mediaStore.fetchMedia('trash', targetPage, !preservePagination);
  }, [mediaStore, currentPage]);

  const softRefresh = useCallback(() => {
    mediaStore.fetchMedia('trash', 1, true);
  }, [mediaStore]);

  return {
    trashFiles, // Return local state
    loading,
    error,
    hasMore,
    currentPage,
    fetchMore,
    refreshTrash,
    softRefresh,
  };
};