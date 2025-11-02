// src/components/MediaGallery/hooks/useMediaActions.ts - FINAL FIX: DIALOG MESSAGE LOGIC
import { useCallback, useRef } from 'react';
import type { MediaFile } from './types';
import { API_ENDPOINTS } from '../utils/galleryConstants';
import { useMediaStore } from './useMediaStore';

export interface UseMediaActionsProps {
  onSuccess?: () => void;
  showDialog?: (title: string, message: string) => void;
  currentSection?: 'gallery' | 'favorites' | 'trash';
}

export const useMediaActions = ({ 
  onSuccess, 
  showDialog,
  currentSection = 'gallery'
}: UseMediaActionsProps = {}) => {
  const mediaStore = useMediaStore();
  const operationInProgressRef = useRef(false);

  const handleDownload = useCallback(async (file: MediaFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      window.open(file.url, '_blank');
    }
  }, []);

  const handleDelete = useCallback(async (fileId: string) => {
    if (operationInProgressRef.current) return;
    operationInProgressRef.current = true;

    try {
      const response = await fetch(`${API_ENDPOINTS.DELETE_FILE}/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error');

      // 1. Optimistic UI update: Remove from cache immediately
      mediaStore.removeFileFromCache(fileId);
      
      // 2. Cross-category refresh: Refresh Trash (force reset: true to ensure fresh list of trash)
      if (currentSection === 'gallery' || currentSection === 'favorites') {
        mediaStore.fetchMedia('trash', 1, true);
      }
      
      onSuccess?.(); 
      showDialog?.('Delete Successful', 'File moved to deleted section.');
      
    } catch (error) {
      showDialog?.('Error', 'Please try again.');
    } finally {
      operationInProgressRef.current = false;
    }
  }, [mediaStore, onSuccess, showDialog, currentSection]);

  const handleToggleFavorite = useCallback(async (fileId: string) => {
    if (operationInProgressRef.current) return;
    operationInProgressRef.current = true;
    
    // Find the file globally from the cache data
    const currentFile = [
        ...mediaStore.galleryFiles, 
        ...mediaStore.favoritesFiles, 
        ...mediaStore.trashFiles
    ].find(f => f.id === fileId);
    
    // Determine the current state before the API call
    const wasFavorite = currentFile?.is_favorite ?? false;

    try {
      const response = await fetch(`${API_ENDPOINTS.FAVORITE_FILE}/${fileId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Favorite failed');

      const result = await response.json();
      
      // Determine the new state based on server response or assume successful toggle
      const isNowFavorite = result.is_favorite !== undefined ? result.is_favorite : !wasFavorite;

      // 1. Optimistic UI update: Update cache immediately
      mediaStore.updateFileInCache(fileId, { is_favorite: isNowFavorite });

      // 2. Cross-category refresh 
      if (currentSection === 'gallery') {
        mediaStore.fetchMedia('favorites', 1, true); 
      } else if (currentSection === 'favorites') {
        mediaStore.fetchMedia('gallery', 1, true);
        
        // If the file was unfavorited from the favorites list, trigger refresh
        if (!isNowFavorite) { 
           onSuccess?.(); 
        }
      }
      
      // Use the resolved new state (isNowFavorite) for the message
      showDialog?.('Success', isNowFavorite ? 'Added to favorites!' : 'Removed from favorites!');
      
    } catch (error) {
      showDialog?.('Error', 'Failed to update favorite.');
    } finally {
      operationInProgressRef.current = false;
    }
  }, [mediaStore, showDialog, currentSection, onSuccess]);

  const handleRestore = useCallback(async (fileId: string) => {
    if (operationInProgressRef.current) return;
    operationInProgressRef.current = true;

    try {
      const response = await fetch(`${API_ENDPOINTS.RESTORE_FILE}/${fileId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Restore failed');

      // Remove from trash cache
      mediaStore.removeFileFromCache(fileId);
      
      // Refresh other sections
      mediaStore.fetchMedia('gallery', 1, true);
      mediaStore.fetchMedia('favorites', 1, true);
      
      onSuccess?.(); 
      showDialog?.('Restore Successful', 'File restored successfully.');
      
    } catch (error) {
      showDialog?.('Restore Failed', 'Please try again.');
    } finally {
      operationInProgressRef.current = false;
    }
  }, [mediaStore, onSuccess, showDialog]);

  const handlePermanentDelete = useCallback(async (fileId: string) => {
    if (operationInProgressRef.current) return;
    operationInProgressRef.current = true;

    try {
      const response = await fetch(`${API_ENDPOINTS.PERMANENT_DELETE}/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error');

      // Remove from cache
      mediaStore.removeFileFromCache(fileId);
      
      // Dispatch storage change event to update storage charts
      try {
        window.dispatchEvent(new CustomEvent('storageChanged'));
      } catch (err) {
        // Ignore if event dispatching fails
      }
      
      onSuccess?.(); 
      showDialog?.('Permanent Deletion Succeeded', 'File permanently deleted.');
      
    } catch (error) {
      showDialog?.('Permanent Deletion Failed', 'Please try again.');
    } finally {
      operationInProgressRef.current = false;
    }
  }, [mediaStore, onSuccess, showDialog]);

  return {
    handleDownload,
    handleDelete,
    handleToggleFavorite,
    handleRestore,
    handlePermanentDelete,
  };
};