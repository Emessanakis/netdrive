// src/components/MediaGallery/FavoritesMedia.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Box } from '@mui/material';
import { useAuth } from "../../context/AuthContext";
import { MediaGrid } from './components/MediaGrid';
import { MediaDialog } from './components/MediaDialog';
import { useFavoritesFetch } from './hooks/useFavoritesFetch';
import { useMediaActions } from './hooks/useMediaActions';
import { useSnackbar } from '../Snackbar/SnackbarProvider';
import type { MediaFile } from './hooks/types';

interface FavoritesMediaProps {
  onLoadingChange?: (loading: boolean) => void;
  externalLoading?: boolean;
}

const FavoritesMedia: React.FC<FavoritesMediaProps> = ({ onLoadingChange, externalLoading = false }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const { showSnackbar } = useSnackbar();
  const initializedRef = useRef(false);

  const {
    favorites,
    loading: favoritesLoading,
    error,
    hasMore,
    fetchMore,
    refreshFavorites,
  } = useFavoritesFetch();

  useEffect(() => {
    onLoadingChange?.(favoritesLoading);
  }, [favoritesLoading, onLoadingChange]);

  // Load favorites when component mounts
  useEffect(() => {
    if (isAuthenticated && user && !initializedRef.current) {
      initializedRef.current = true;
      refreshFavorites(false);
    }
  }, [isAuthenticated, user, refreshFavorites]);

  const showDialog = (title: string, message: string) => {
    try { showSnackbar(`${title}: ${message}`, 'info'); } catch (e) {}
  };
  
  const { 
    handleDownload, 
    handleDelete, 
    handleToggleFavorite,
  } = useMediaActions({ 
    onSuccess: () => {
      refreshFavorites(true); 
    },
    showDialog,
    currentSection: 'favorites'
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
      <MediaGrid
        files={favorites}
        loading={favoritesLoading || externalLoading}
        error={error}
        hasMore={hasMore}
        onFileClick={setSelectedFile}
        onLoadMore={fetchMore}
        onRefresh={() => refreshFavorites(false)}
        onDelete={handleDelete}
        onFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        showActions={true}
        showFavorite={true}
        showFileName={true}
        variant="favorites"
        showHeader={false}
      />

      <MediaDialog
        file={selectedFile}
        open={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={handleDelete}
        onFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        variant="favorites"
      />

      {/* messages shown via centralized snackbar */}
    </Box>
  );
};

export default FavoritesMedia;