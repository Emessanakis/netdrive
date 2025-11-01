// src/components/MediaGallery/GalleryMedia.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MediaGrid } from './components/MediaGrid';
import GalleryUpload from './GalleryUpload';
import { MediaDialog } from './components/MediaDialog';
import { useSnackbar } from '../Snackbar/SnackbarProvider';
import { useMediaFetch } from './hooks/useMediaFetch';
import { useMediaActions } from './hooks/useMediaActions';
import type { MediaFile } from './hooks/types';

interface GalleryMediaProps {
  onLoadingChange?: (loading: boolean) => void;
  externalLoading?: boolean;
  refreshKey?: number;
}

const GalleryMedia: React.FC<GalleryMediaProps> = ({ onLoadingChange, externalLoading = false, refreshKey }) => {
  const { user, isAuthenticated} = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const { showSnackbar } = useSnackbar();
  const initializedRef = useRef(false);

  const {
    mediaFiles,
    loading: mediaLoading,
    error,
    hasMore,
    fetchMore,
    refreshMedia,
  } = useMediaFetch();

  // Report loading state to parent
  useEffect(() => {
    onLoadingChange?.(mediaLoading);
  }, [mediaLoading, onLoadingChange]);

  // Load media when component mounts
  useEffect(() => {
    if (isAuthenticated && user && !initializedRef.current) {
      initializedRef.current = true;
      refreshMedia(false);
    }
  }, [isAuthenticated, user, refreshMedia]);

  // When refreshKey changes (e.g. after an upload), refresh media list
  useEffect(() => {
    if (typeof refreshKey !== 'undefined') {
      // force refresh
      refreshMedia(true);
    }
  }, [refreshKey, refreshMedia]);

  const showDialog = (title: string, message: string) => {
    // Forward to centralized snackbar (include title for context)
    try { showSnackbar(`${title}: ${message}`, 'info'); } catch (e) {}
  };
  
  const { 
    handleDownload, 
    handleDelete, 
    handleToggleFavorite,
  } = useMediaActions({ 
    onSuccess: () => {
      refreshMedia(true);
    },
    showDialog,
    currentSection: 'gallery'
  });

  // Reset initialized ref when authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      initializedRef.current = false;
    }
  }, [isAuthenticated]);

    // 🔒 Redirect if user is not authenticated
    useEffect(() => {
      if (!isAuthenticated || !user) {
        navigate("/login");
      }
    }, [isAuthenticated, user, navigate]);
    
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      setSelectedFile(null);
    };
  }, []);
  
  // 🔒 Redirect if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <Box sx={{ maxWidth: '1900px' }}>
      {/* Upload + Storage Donut shown above the media grid */}
      <GalleryUpload onUploadSuccess={(normalized) => {
        // After a successful upload, refresh media list (reset to first page)
        refreshMedia(false);
        try {
          const count = Array.isArray(normalized) ? normalized.length : 1;
          showDialog('Success', `${count} file${count !== 1 ? 's' : ''} uploaded`);
        } catch (err) {
          // ignore
        }
      }} />

      <MediaGrid
        files={mediaFiles}
        loading={mediaLoading || externalLoading}
        error={error}
        hasMore={hasMore}
        onFileClick={setSelectedFile}
        onLoadMore={fetchMore}
        onRefresh={() => refreshMedia(false)}
        onDelete={handleDelete}
        onFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        showActions={true}
        showFavorite={true}
        showFileName={true}
        variant="gallery"
      />

      <MediaDialog
        file={selectedFile}
        open={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={handleDelete}
        onFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        variant="gallery"
      />
    </Box>
  );
};

export default GalleryMedia;