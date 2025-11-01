// src/components/MediaGallery/components/MediaCard/MediaCard.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Button,
  Tooltip,
  IconButton,
  Skeleton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Movie as MovieIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import type { MediaFile } from '../../hooks/types';
import { API_ENDPOINTS } from '../../../../constants';
import { useSnackbar } from '../../../Snackbar/SnackbarProvider';
import {
  mirrorButtonStyle,
  cardStyle,
  cardContainerStyle,
  mediaContainerStyle,
  mediaStyle,
  fileNameStyle,
  actionButtonsStyle,
  mobileActionsStyle,
  videoIconStyle,
} from './MediaCard.styles';

// Note: we intentionally removed client-side blob extraction and object-URL
// creation. Thumbnails are fetched via the server-side `DOWNLOAD_THUMBNAIL`
// endpoint and served as regular images. Keep module state minimal.

export interface MediaCardProps {
  file: MediaFile;
  onFileClick?: (file: MediaFile) => void;
  onDelete?: (fileId: string) => Promise<any> | void;
  onFavorite?: (fileId: string) => Promise<any> | void;
  onDownload?: (file: MediaFile) => void;
  onRestore?: (fileId: string) => Promise<any> | void;
  onPermanentDelete?: (fileId: string) => Promise<any> | void;
  // optional callback so parent can persist fetched thumbnails (recommended)
  onPersistThumbnail?: (fileId: string, thumbnailDataUrl: string) => void;
  showActions?: boolean;
  showFavorite?: boolean;
  showFileName?: boolean;
  showRestore?: boolean;
  showPermanentDelete?: boolean;
  variant?: 'gallery' | 'favorites' | 'trash';
}

export const MediaCard: React.FC<MediaCardProps> = ({
  file,
  onFileClick,
  onDelete,
  onFavorite,
  onDownload,
  onRestore,
  onPermanentDelete,
  onPersistThumbnail,
  showActions = true,
  showFavorite = true,
  showFileName = true,
  showRestore = true,
  showPermanentDelete = true,
  variant = 'gallery',
}) => {
  const [localSrc, setLocalSrc] = useState<string | null>(file.thumbnail_url ?? null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'permanent'>('soft');
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  // no object URLs anymore
  const isVideo = file.type === 'video';
    const isOther = false;

    useEffect(() => {
      // Always prefer the canonical thumbnail URL from the file metadata.
      // If missing, fall back to the server-side thumbnail endpoint for the id.
      let candidate = file.thumbnail_url ?? API_ENDPOINTS.DOWNLOAD_THUMBNAIL(file.id);
      // If backend supplied a legacy /api/auth/thumbnail/ URL, rewrite to the
      // canonical download-thumbnail endpoint which the client should use.
      try {
        if (typeof candidate === 'string' && /\/api\/auth\/thumbnail\//.test(candidate)) {
          candidate = API_ENDPOINTS.DOWNLOAD_THUMBNAIL(file.id);
        }
      } catch (e) {}
      const normalizedCandidate = normalizeRemoteUrl(candidate);
      // Only update localSrc / reset loading state if the candidate actually changed.
      // This prevents a flash where the component toggles loading off/on when the
      // parent updates the file object with an identical thumbnail URL.
      if (normalizedCandidate && normalizedCandidate !== localSrc) {
        setLocalSrc(normalizedCandidate);
        setImageLoaded(false);
        setImageError(false);
      }
    }, [file.thumbnail_url, file.id, localSrc]);

    // Ensure we mark images as loaded even when the browser serves them from cache
    // (some browsers may not fire onLoad on the <img> if it was cached before the
    // handler attached). We proactively create an Image() and listen for load/error
    // when `localSrc` changes.
    useEffect(() => {
      if (!localSrc) return;
      setImageLoaded(false);
      setImageError(false);

      let mounted = true;
      try {
        const img = new Image();
        // keep same credentials mode used by CardMedia
        try { (img as any).crossOrigin = 'use-credentials'; } catch (e) {}
        img.onload = () => { if (!mounted) return; setImageLoaded(true); };
        img.onerror = () => { if (!mounted) return; setImageError(true); };
        img.src = localSrc;
      } catch (e) {
        // ignore
      }

      return () => { mounted = false; };
    }, [localSrc]);

    // Use centralized snackbar

    const handleImageLoad = () => {
      setImageLoaded(true);
      // Persist the thumbnail into the parent/store so other instances can reuse it
      // but only if the file metadata doesn't already include the same thumbnail.
      try {
        if (localSrc && file.thumbnail_url !== localSrc) onPersistThumbnail?.(file.id, localSrc);
      } catch (e) {}
    };

    // Note: we intentionally removed the previous fallback that attempted
    // to extract a video frame client-side or create an object URL from a
    // video blob. Instead we prefer to wait briefly for the server-side
    // thumbnail to become available and fetch the dedicated
    // `DOWNLOAD_THUMBNAIL` endpoint which should return an image. This
    // avoids fetching the raw video file and repeated/canceled requests.
  // No client-side thumbnail delay or blob fetching; server endpoint used directly.

      // Normalize remote thumbnail URLs to the current page origin when appropriate.
      // This avoids double-fetches caused by host differences (example: api URL uses
      // emessanakis.gr while the page is served from www.emessanakis.gr) which can
      // trigger CSP or cross-origin issues and duplicate network requests.
      const normalizeRemoteUrl = (u?: string | null) => {
        if (!u) return u ?? null;
        try {
          if (u.startsWith('data:') || u.startsWith('blob:')) return u;
          // If it's a relative path, ensure it becomes absolute on current origin
          if (u.startsWith('/')) return `${window.location.origin}${u}`;
          const parsed = new URL(u);
          if (parsed.hostname === window.location.hostname) return parsed.toString();
          // Replace origin with current origin but keep pathname/search/hash
          return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
        } catch (e) {
          return u;
        }
      };

    const handleImageError = () => {
      setImageError(true);
      try { showSnackbar('Failed to load thumbnail', 'error'); } catch (e) {}
    };

    const handleFavoriteClick = (e: React.MouseEvent) => { e.stopPropagation(); onFavorite?.(file.id); };

    const handleDeleteClick = (e: React.MouseEvent) => { e.stopPropagation(); setDeleteMode('soft'); setDeleteDialogOpen(true); };

    const handleConfirmDelete = async () => {
      if (!onDelete && !(deleteMode === 'permanent' && onPermanentDelete)) return;
      setIsDeleting(true);
      try {
        if (deleteMode === 'soft' && onDelete) await onDelete(file.id);
        else if (deleteMode === 'permanent' && onPermanentDelete) await onPermanentDelete(file.id);
        setDeleteDialogOpen(false);
  } catch (error: any) { showSnackbar(error?.message ? String(error.message) : 'Error', 'error'); } finally { setIsDeleting(false); }
    };

    const handleCancelDelete = () => setDeleteDialogOpen(false);
    const handleDownloadClick = (e: React.MouseEvent) => { e.stopPropagation(); onDownload?.(file); };
    const handleRestoreClick = (e: React.MouseEvent) => { e.stopPropagation(); onRestore?.(file.id); };
    const handlePermanentDeleteClick = (e: React.MouseEvent) => { e.stopPropagation(); setDeleteMode('permanent'); setDeleteDialogOpen(true); };
    const handleCardClick = () => onFileClick?.(file);

    const renderActionButtons = () => {
      if (!showActions) return null;
      if (variant === 'gallery' || variant === 'favorites') {
        return (
          <>
            <Box sx={actionButtonsStyle}>
              {onDelete && <Button fullWidth variant="contained" size="small" startIcon={<DeleteIcon fontSize="small" />} onClick={handleDeleteClick} sx={mirrorButtonStyle}>Delete</Button>}
              {onDownload && <Button fullWidth variant="contained" size="small" startIcon={<DownloadIcon fontSize="small" />} onClick={handleDownloadClick} sx={mirrorButtonStyle}>Download</Button>}
            </Box>
            <Box sx={mobileActionsStyle}>
              {onDelete && <Button variant="contained" size="small" onClick={handleDeleteClick} sx={{ ...mirrorButtonStyle, p: 0.5, minWidth: '30px', height: '30px' }}><DeleteIcon fontSize="small" /></Button>}
              {onDownload && <Button variant="contained" size="small" onClick={handleDownloadClick} sx={{ ...mirrorButtonStyle, p: 0.5, minWidth: '30px', height: '30px' }}><DownloadIcon fontSize="small" /></Button>}
            </Box>
          </>
        );
      }
      if (variant === 'trash') {
        return (
          <>
            <Box sx={actionButtonsStyle}>
              {showPermanentDelete && onPermanentDelete && <Button fullWidth variant="contained" size="small" startIcon={<DeleteForeverIcon fontSize="small" />} onClick={handlePermanentDeleteClick} sx={mirrorButtonStyle}>Delete</Button>}
              {showRestore && onRestore && <Button fullWidth variant="contained" size="small" startIcon={<RestoreIcon fontSize="small" />} onClick={handleRestoreClick} sx={mirrorButtonStyle}>Restore</Button>}
            </Box>
            <Box sx={mobileActionsStyle}>
              {showPermanentDelete && onPermanentDelete && <Button variant="contained" size="small" onClick={handlePermanentDeleteClick} sx={{ ...mirrorButtonStyle, p: 0.5, minWidth: '30px', height: '30px' }}><DeleteForeverIcon fontSize="small" /></Button>}
              {showRestore && onRestore && <Button variant="contained" size="small" onClick={handleRestoreClick} sx={{ ...mirrorButtonStyle, p: 0.5, minWidth: '30px', height: '30px' }}><RestoreIcon fontSize="small" /></Button>}
            </Box>
          </>
        );
      }
      return null;
    };

    return (
      <>
        <Box sx={cardContainerStyle}>
          <Card sx={cardStyle} onClick={handleCardClick}>
            <Box sx={mediaContainerStyle}>
              {!imageLoaded && <Skeleton variant="rectangular" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />}

              {localSrc && !imageError && (
                <CardMedia component="img" image={localSrc} alt={`${file.name} thumbnail`} onLoad={handleImageLoad} onError={() => handleImageError()} crossOrigin="use-credentials" sx={{ ...mediaStyle, bgcolor: isVideo ? 'black' : 'grey.100', display: imageLoaded ? 'block' : 'none' }} />
              )}

              {imageError && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.300', color: 'grey.600', flexDirection: 'column', px: 2 }}>
                  {isVideo ? (
                    <>
                      <MovieIcon sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="caption" align="center">Video preview unavailable</Typography>
                    </>
                  ) : (
                    <Typography variant="caption" align="center">Failed to load image</Typography>
                  )}
                </Box>
              )}

              {isVideo && imageLoaded && !imageError && (
                <Box sx={videoIconStyle}><MovieIcon sx={{ fontSize: 20, color: 'white' }} /></Box>
              )}

              {showFavorite && !isOther && imageLoaded && !imageError && onFavorite && (
                <IconButton size="small" onClick={handleFavoriteClick} sx={{ position: 'absolute', top: 8, right: isVideo ? 40 : 8, bgcolor: file.is_favorite ? 'rgba(0, 102, 255, 0.6)' : 'rgba(0,0,0,0.4)', p: 0.5, zIndex: 10, pointerEvents: 'auto' }}>
                  {file.is_favorite ? <StarIcon sx={{ fontSize: 20, color: 'white' }} /> : <StarBorderIcon sx={{ fontSize: 20, color: 'white' }} />}
                </IconButton>
              )}

              {showFileName && imageLoaded && (
                <Box sx={fileNameStyle}><Tooltip title={file.name} arrow placement="bottom-start"><Typography variant="caption" color="white" noWrap sx={{ display: 'block', textAlign: 'left', lineHeight: 1.2, width: '60%', px: 0.5 }}>{file.name}</Typography></Tooltip></Box>
              )}

              {renderActionButtons()}
            </Box>
          </Card>
        </Box>

        <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">File Deletion</DialogTitle>
          <DialogContent><Typography>{deleteMode === 'permanent' ? 'Are you sure you want to permanently delete the file?' : 'Are you sure you want to delete the file?'}</Typography></DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} disabled={isDeleting} variant="outlined" sx={{textTransform: 'capitalize'}}>Cancel</Button>
            <Button onClick={handleConfirmDelete} disabled={isDeleting} variant="contained" sx={{textTransform: 'capitalize'}}>Delete</Button>
          </DialogActions>
        </Dialog>

  {/* centralized snackbar is provided at app root */}
      </>
    );
  };

  export default MediaCard;
