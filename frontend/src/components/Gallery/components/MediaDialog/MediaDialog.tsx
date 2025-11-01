// src/components/MediaGallery/components/MediaDialog/MediaDialog.tsx
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useMediaStore } from '../../hooks/useMediaStore';
import { 
  Box, Typography, Card, Button, Dialog, DialogContent,
  Tooltip, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import { 
  Download as DownloadIcon, Delete as DeleteIcon,
  StarBorder as StarBorderIcon, Close as CloseIcon, Star as StarIcon,
  ZoomOutMap as ZoomOutMapIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  Check as CheckIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import type { MediaFile } from '../../hooks/types';

// Add export keyword here
export interface MediaDialogProps {
  file: MediaFile | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (fileId: string) => Promise<any> | void;
  onFavorite?: (fileId: string) => Promise<any> | void;
  onDownload?: (file: MediaFile) => void;
  onRestore?: (fileId: string) => Promise<any> | void;
  onPermanentDelete?: (fileId: string) => Promise<any> | void;
  showActions?: boolean;
  showFavorite?: boolean;
  showRestore?: boolean;
  showPermanentDelete?: boolean;
  variant?: 'gallery' | 'favorites' | 'trash';
}

// Base style for the mirror/glass effect buttons
const mirrorButtonStyle = {
  bgcolor: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)', 
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.3)', 
  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
  fontSize: '0.8rem',
  py: 0.75,
  textTransform: 'capitalize' as const,
  minWidth: 0,
  borderRadius: 1,
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
};

// Style for confirmation buttons
const confirmButtonStyle = {
  ...mirrorButtonStyle,
  animation: 'pulse 0.5s ease-in-out',
  minWidth: '40px',
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.4)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
    border: '1px solid rgba(255, 255, 255, 0.7)',
  },
};

export const MediaDialog: React.FC<MediaDialogProps> = ({ 
  file, 
  open, 
  onClose,
  onDelete,
  onFavorite,
  onDownload,
  onRestore,
  onPermanentDelete,
  showActions = true,
  showFavorite = true,
  showRestore = false,
  showPermanentDelete = false,
  variant = 'gallery'
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const mediaStore = useMediaStore();
  const [currentFile, setCurrentFile] = useState<MediaFile | null>(file);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'permanent'>('soft');
  const mediaContainerRef = useRef<HTMLDivElement>(null);

  const zoomLevel = isZoomed ? 2 : 1;

  // Update currentFile when the file prop changes or when the store updates
  // (so the dialog reflects optimistic updates like favorites/deletes while open).
  useEffect(() => {
    if (!file) {
      setCurrentFile(null);
      return;
    }

    // Try to resolve the freshest instance of the file from the shared store
    const resolved = [
      ...mediaStore.galleryFiles,
      ...mediaStore.favoritesFiles,
      ...mediaStore.trashFiles
    ].find(f => f.id === file.id) ?? file;

    setCurrentFile(resolved);
  }, [file, mediaStore.galleryFiles, mediaStore.favoritesFiles, mediaStore.trashFiles]);

  // Reset delete confirmation state when dialog closes or file changes
  useEffect(() => {
    if (!open || !currentFile) {
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  }, [open, currentFile]);

  const handleZoomToggle = () => {
    setIsZoomed(prev => !prev);
    if (!isZoomed) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = () => {
    setIsZoomed(false);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      setIsDragging(true);
      setStartDragPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed) {
      const newX = e.clientX - startDragPosition.x;
      const newY = e.clientY - startDragPosition.y;
      
      if (mediaContainerRef.current) {
        const container = mediaContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const maxX = (zoomLevel - 1) * containerRect.width / 2;
        const maxY = (zoomLevel - 1) * containerRect.height / 2;
        
        setPosition({
          x: Math.max(Math.min(newX, maxX), -maxX),
          y: Math.max(Math.min(newY, maxY), -maxY)
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      handleZoomToggle();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteMode('soft');
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentFile) return;
    setIsDeleting(true);
    try {
      if (deleteMode === 'soft' && onDelete) {
        await onDelete(currentFile.id);
      } else if (deleteMode === 'permanent' && onPermanentDelete) {
        await onPermanentDelete(currentFile.id);
      }
      // Close the dialog after successful deletion
      onClose();
    } catch (error) {
      console.error('Error', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const MediaElement = useMemo(() => {
    if (!currentFile) return null;

    const maxHeightValue = isSmallScreen ? '50vh' : '80vh';
    
    const mediaWrapperStyle = {
      width: '100%', 
      height: '100%',
      maxHeight: maxHeightValue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: currentFile.type === 'video' ? 'default' : (isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'),
      transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
      transition: isDragging ? 'none' : 'transform 0.2s ease',
      transformOrigin: 'center center',
    };

    const mediaStyle = { 
      maxWidth: '100%', 
      maxHeight: maxHeightValue, 
      objectFit: 'contain' as const,
      // Allow pointer events on videos so the native controls are clickable
      pointerEvents: currentFile.type === 'video' ? 'auto' as const : ('none' as any),
    };

  if (currentFile.type === 'image') {
      return (
        <Box 
          sx={mediaWrapperStyle}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={() => {
            if (!isDragging && currentFile?.type === 'image') {
              handleZoomToggle();
            }
          }}
          ref={mediaContainerRef}
        >
          <img 
            src={currentFile.url} 
            alt={currentFile.name} 
            style={mediaStyle}
            draggable={false}
          />
        </Box>
      );
    }
    if (currentFile.type === 'video') {
      return (
        <Box sx={mediaWrapperStyle} ref={mediaContainerRef}>
          <video 
            src={currentFile.url} 
            controls 
            style={mediaStyle}
            // stopPropagation so clicks on controls don't close the dialog
            onClick={(e) => e.stopPropagation()}
          />
        </Box>
      );
    }
    return (
      <Box sx={{ ...mediaWrapperStyle, bgcolor: 'primary.light' }}>
        <Typography variant="h6" color="primary.contrastText">
          Preview not available
        </Typography>
      </Box>
    );
  }, [currentFile, isSmallScreen, isZoomed, isDragging, position, zoomLevel]);

// In MediaDialog.tsx - Update the favorite handler
const handleFavoriteClick = async (e: React.MouseEvent) => {
  e.stopPropagation();
  if (currentFile && onFavorite) {
    try {
      // The UI will be updated immediately via useMediaActions
      await onFavorite(currentFile.id);
      // If we're viewing the favorites variant, closing the dialog after a successful toggle
      // ensures the UI stays consistent (the item will be removed from the favorites list).
      if (variant === 'favorites') {
        try { onClose(); } catch (err) { /* ignore */ }
      }
    } catch (error) {
      console.error('Error', error);
    }
  }
};

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentFile && onDownload) {
      onDownload(currentFile);
    }
  };

  const handleRestoreClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentFile || !onRestore) return;
    setIsRestoring(true);
    try {
      // Await the provided restore handler so we can close the dialog on success
      await onRestore(currentFile.id);
      try { onClose(); } catch (err) { /* ignore */ }
    } catch (err) {
      // keep dialog open on failure; logging for diagnostics
      // eslint-disable-next-line no-console
      console.error('Error', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open confirmation for permanent delete
    setDeleteMode('permanent');
    setShowDeleteConfirm(true);
  };

  // Reset zoom and position when file changes
  React.useEffect(() => {
    setIsZoomed(false);
    setPosition({ x: 0, y: 0 });
  }, [currentFile]);

  const renderActionButtons = () => {
    if (!showActions) return null;

    // Gallery & Favorites actions
    if (variant === 'gallery' || variant === 'favorites') {
      return (
        <>
          {/* Delete Button or Confirmation Buttons */}
          {showDeleteConfirm ? (
            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                sx={{ 
                  ...confirmButtonStyle,
                  flex: 1,
                }}
              >
                <CheckIcon />
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                sx={{ 
                  ...confirmButtonStyle,
                  flex: 1,
                }}
              >
                <ClearIcon />
              </Button>
            </Box>
          ) : (
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              sx={{ ...mirrorButtonStyle }}
            >
              Delete
            </Button>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadClick}
            sx={{ ...mirrorButtonStyle }}
          >
            Download
          </Button>
        </>
      );
    }

    // Trash actions
    if (variant === 'trash') {
      return (
        <>
          {showPermanentDelete && (
            showDeleteConfirm ? (
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  sx={{
                    ...confirmButtonStyle,
                    flex: 1,
                  }}
                >
                  <CheckIcon />
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  sx={{
                    ...confirmButtonStyle,
                    flex: 1,
                  }}
                >
                  <ClearIcon />
                </Button>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<DeleteForeverIcon />}
                onClick={handlePermanentDeleteClick}
                sx={{ ...mirrorButtonStyle }}
              >
                Delete
              </Button>
            )
          )}

          {showRestore && (
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<RestoreIcon />}
              onClick={handleRestoreClick}
              disabled={isRestoring}
              sx={{ ...mirrorButtonStyle }}
            >
              Restore
            </Button>
          )}
        </>
      );
    }

    return null;
  };

  if (!currentFile) return null;

  return (
    <Dialog 
      key={currentFile?.id ?? 'media-dialog'}
      open={open} 
      onClose={onClose} 
      PaperProps={{ 
        sx: { 
          position: 'relative', 
          p: 0, 
          bgcolor: 'transparent', 
          boxShadow: 'none', 
          minHeight: { xs: '90vh', sm: 'auto' }, 
          m: { xs: 1, sm: 4 }, 
        } 
      }}
      maxWidth={false}
    >
      <DialogContent sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        p: 0, 
        bgcolor: 'transparent', 
        position: 'relative', 
        minHeight: 'auto',
      }}>
        <Card sx={{ 
          display: 'flex', 
          maxWidth: 1000, 
          width: '100%',
          maxHeight: '90vh', 
          overflow: 'hidden',
          borderRadius: 2, 
        }}>
          {/* Media Preview Area - DARK BACKGROUND */}
          <Box sx={{ 
            flexGrow: 1, 
            minWidth: 0, 
            width: '100%',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'hidden',
            bgcolor: '#333', 
            p: 0, 
            position: 'relative', 
          }}>
            {MediaElement}
            
            {/* TOP OVERLAY AREA (Name, Favorite, Close) */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              zIndex: 10, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 1.5,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
            }}>
              {/* File Name & Edit Icon (Top Left) */}
              <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '75%' }}>
                <Tooltip title={currentFile.name} arrow placement="bottom-start">
                  <Typography 
                    variant="body1" 
                    color="white" 
                    noWrap 
                    sx={{ 
                      fontWeight: 'bold', 
                      mr: 0.5,
                    }}
                  >
                    {currentFile.name}
                  </Typography>
                </Tooltip>
              </Box>

              {/* Zoom Controls & Close Icon (Top Right) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Zoom Controls - Only for images */}
                {currentFile.type === 'image' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
                    {/* Reset Zoom - Only show when zoomed */}
                    {isZoomed && (
                      <Tooltip title="Reset Zoom" arrow>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetZoom();
                          }}
                          sx={{ 
                            color: 'white', 
                            bgcolor: 'rgba(0,0,0,0.4)', 
                            p: 0.5,
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' }
                          }}
                        >
                          <ZoomOutMapIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}

                {/* FAVORITE STAR ICON */}
                {showFavorite && currentFile.type !== 'other' && onFavorite && (
                  <IconButton 
                    size="small" 
                    onClick={handleFavoriteClick}
                    sx={{ 
                      bgcolor: currentFile.is_favorite ? 'rgba(0, 102, 255, 0.6)' : 'rgba(0,0,0,0.4)', 
                      p: 0.5, 
                      zIndex: 3,
                      '&:hover': {
                        bgcolor: currentFile.is_favorite ? 'rgba(0, 102, 255, 0.8)' : 'rgba(0,0,0,0.6)'
                      }
                    }}
                  >
                    {currentFile.is_favorite ? (
                      <StarIcon sx={{ 
                        fontSize: 20, 
                        color: 'white'
                      }} />
                    ) : (
                      <StarBorderIcon sx={{ 
                        fontSize: 20, 
                        color: 'white'
                      }} />
                    )}
                  </IconButton>
                )}
                
                {/* Close Icon */}
                <IconButton 
                  onClick={onClose}
                  sx={{ 
                    color: 'white', 
                    bgcolor: 'rgba(0,0,0,0.4)', 
                    p: 0.5, 
                    zIndex: 3,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } 
                  }}
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>
            
            {/* BOTTOM OVERLAY AREA (Action Buttons) */}
            {currentFile.type !== 'video' && (
              <Box 
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  px: 2, 
                  pb: 2, 
                  pt: 4, 
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  gap: 2, 
                }}
              >
                {renderActionButtons()}
              </Box>
            )}
          </Box>
        </Card>
      </DialogContent>

      {/* Add CSS animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Dialog>
  );
};