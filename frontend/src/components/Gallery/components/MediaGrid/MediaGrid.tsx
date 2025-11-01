// src/components/MediaGallery/components/MediaGrid/MediaGrid.tsx
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { MediaCard } from '../MediaCard';
import { useMediaStore } from '../../hooks/useMediaStore';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader'; // Import directly from file
import type { MediaFile } from '../../hooks/types';
import {
  gridContainerStyle,
  errorContainerStyle,
  loadMoreButtonStyle,
  emptyStateStyle,
  loadMoreContainerStyle,
  paperWrapperStyle
} from './MediaGrid.styles'; // Fixed import path
import { EMPTY_MESSAGES } from '../../utils/galleryConstants'; 

export interface MediaGridProps {
  files: MediaFile[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onFileClick?: (file: MediaFile) => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onDelete?: (fileId: string) => Promise<any> | void;
  onFavorite?: (fileId: string) => Promise<any> | void;
  onDownload?: (file: MediaFile) => void;
  onRestore?: (fileId: string) => Promise<any> | void;
  onPermanentDelete?: (fileId: string) => Promise<any> | void;
  showActions?: boolean;
  showFavorite?: boolean;
  showFileName?: boolean;
  showRestore?: boolean;
  showPermanentDelete?: boolean;
  variant?: 'gallery' | 'favorites' | 'trash';
  emptyMessage?: string;
  emptyDescription?: string;
  showHeader?: boolean;
  headerContent?: React.ReactNode;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  files,
  loading,
  error,
  hasMore,
  onFileClick,
  onLoadMore,
  onRefresh,
  onDelete,
  onFavorite,
  onDownload,
  onRestore,
  onPermanentDelete,
  showActions = true,
  showFavorite = true,
  showFileName = true,
  showRestore = false,
  showPermanentDelete = false,
  variant = 'gallery',
  emptyMessage,
  emptyDescription,
  showHeader = false,
  headerContent
}) => {
  const isInitialLoad = loading && files.length === 0;

  const mediaStore = useMediaStore();

  // Use constants for empty messages
  const getDefaultEmptyMessage = () => {
    switch (variant) {
      case 'favorites':
        return EMPTY_MESSAGES.favorites.title;
      case 'trash':
        return EMPTY_MESSAGES.trash.title;
      default:
        return EMPTY_MESSAGES.gallery.title;
    }
  };

  const getDefaultEmptyDescription = () => {
    switch (variant) {
      case 'favorites':
        return EMPTY_MESSAGES.favorites.description;
      case 'trash':
        return EMPTY_MESSAGES.trash.description;
      default:
        return EMPTY_MESSAGES.gallery.description;
    }
  };

  const finalEmptyMessage = emptyMessage || getDefaultEmptyMessage();
  const finalEmptyDescription = emptyDescription || getDefaultEmptyDescription();

  // Show empty state ONLY when not loading, no files, and no error
  const showEmptyState = !loading && files.length === 0 && !error;

  // Dynamic skeleton count based on variant
  const getSkeletonCount = () => {
    switch (variant) {
      case 'favorites':
        return 12;
      case 'trash':
        return 12;
      case 'gallery':
      default:
        return 18;
    }
  };

  if (showEmptyState) {
    return (
      <Paper sx={paperWrapperStyle}>
        <Box sx={emptyStateStyle}>
          <Typography variant="h6" gutterBottom>
            {finalEmptyMessage}
          </Typography>
          <Typography variant="body2">
            {finalEmptyDescription}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={paperWrapperStyle}>
      {/* Header Section */}
      {showHeader && headerContent && (
        <Box sx={{ mb: 3 }}>
          {headerContent}
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Box sx={errorContainerStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {onRefresh && (
              <RefreshIcon 
                sx={{ mr: 1, cursor: 'pointer' }} 
                onClick={onRefresh} 
              />
            )}
            <Typography variant="body2">{error}</Typography>
          </Box>
          {onRefresh && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={onRefresh}
              sx={{ color: 'error.contrastText', borderColor: 'error.contrastText' }}
            >
              Retry
            </Button>
          )}
        </Box>
      )}

      {/* Media Grid */}
      <Box sx={gridContainerStyle}>
        {/* Show skeleton only for initial load */}
        {isInitialLoad ? (
          <SkeletonLoader count={getSkeletonCount()} variant={variant} />
        ) : (
          // Show files when not in initial load
          files.map((file, i) => (
            <MediaCard 
              key={file.id || file.url || i} 
              file={file}
              onFileClick={onFileClick}
              onDelete={onDelete}
              onFavorite={onFavorite}
              onDownload={onDownload}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
              showActions={showActions}
              showFavorite={showFavorite}
              showFileName={showFileName}
              showRestore={showRestore}
              showPermanentDelete={showPermanentDelete}
              variant={variant}
              // persist fetched thumbnails into the shared media store to avoid
              // redundant network requests across remounts
              onPersistThumbnail={(fileId: string, thumbnailUrl: string) => {
                try {
                  mediaStore.updateFileInCache(fileId, { thumbnail_url: thumbnailUrl } as any);
                } catch (e) {
                  // ignore
                }
              }}
            />
          ))
        )}
      </Box>

        {hasMore && files.length > 0 && onLoadMore && (
          <Box sx={loadMoreContainerStyle}>
            <Button
              variant="contained"
              onClick={onLoadMore}
              disabled={loading} // Disabled when loading
              sx={loadMoreButtonStyle}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </Box>
        )}
      
    </Box>
  );
};