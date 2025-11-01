// src/components/MediaGallery/TrashMedia.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MediaGrid } from './components/MediaGrid';
import { MediaDialog } from './components/MediaDialog';
import { useTrashFetch } from './hooks/useTrashFetch';
import { useMediaActions } from './hooks/useMediaActions';
import { useSnackbar } from '../Snackbar/SnackbarProvider';
import type { MediaFile } from './hooks/types';
import { Box } from '@mui/material';

interface TrashMediaProps {
  onLoadingChange?: (loading: boolean) => void;
  externalLoading?: boolean;
}

const TrashMedia: React.FC<TrashMediaProps> = ({ onLoadingChange, externalLoading = false }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const { showSnackbar } = useSnackbar();
  const initializedRef = useRef(false);

  const {
    trashFiles,
    loading: trashLoading,
    error,
    hasMore,
    fetchMore,
    refreshTrash,
  } = useTrashFetch();

  useEffect(() => {
    onLoadingChange?.(trashLoading);
  }, [trashLoading, onLoadingChange]);

  // Load trash when component mounts
  useEffect(() => {
    if (isAuthenticated && user && !initializedRef.current) {
      initializedRef.current = true;
      refreshTrash(false);
    }
  }, [isAuthenticated, user, refreshTrash]);

  const showDialog = (title: string, message: string) => {
    try { showSnackbar(`${title}: ${message}`, 'info'); } catch (e) {}
  };
  
  const { 
    handleDownload, 
    handleToggleFavorite,
    handleRestore,
    handlePermanentDelete,
  } = useMediaActions({ 
    onSuccess: () => {
      refreshTrash(true); 
    },
    showDialog,
    currentSection: 'trash'
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

  return (
    <Box sx={{ maxWidth: '1900px' }}>
      <MediaGrid
        files={trashFiles}
        loading={trashLoading || externalLoading}
        error={error}
        hasMore={hasMore}
        onFileClick={setSelectedFile}
        onLoadMore={fetchMore}
        onRefresh={() => refreshTrash(false)}
        onDelete={handlePermanentDelete}
        onFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        showActions={true}
        showFavorite={false}
        showFileName={true}
        showRestore={true}
        showPermanentDelete={true}
        variant="trash"
        showHeader={true}
      />

      <MediaDialog
        file={selectedFile}
        open={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={handlePermanentDelete}
        onFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        showActions={true}
        showFavorite={false}
        showRestore={true}
        showPermanentDelete={true}
        variant="trash"
      />

      {/* messages shown via centralized snackbar */}
    </Box>
  );
};

export default TrashMedia;