import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Card, Typography, Button, LinearProgress, List, ListItem, ListItemText, IconButton } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import StorageDonutChart from './StorageDonutChart';
import StorageDonutChartSkeleton from './StorageDonutChartSkeleton';
import { useMediaStore } from './hooks/useMediaStore';
import { useSnackbar } from '../Snackbar/SnackbarProvider';
import { API_ENDPOINTS } from '../../constants';

interface GalleryUploadProps {
  // The callback receives the normalized MediaFile-like objects returned/created after upload.
  onUploadSuccess: (newFiles: any[]) => void;
}

const GalleryUpload: React.FC<GalleryUploadProps> = ({ onUploadSuccess }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [storageData, setStorageData] = useState({ images: 0, videos: 0, freeSpace: 0, totalSpace: 0 });
  const [isStorageDataLoaded, setIsStorageDataLoaded] = useState(false);
  const [helperMessage, setHelperMessage] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  const fetchStorageStats = useCallback(async () => {
    try {
  const res = await fetch(API_ENDPOINTS.STORAGE_STATS, { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.data) {
        const stats = json.data;
        setStorageData({
          images: stats.chartData?.images || 0,
          videos: stats.chartData?.videos || 0,
          freeSpace: stats.remainingSpaceBytes ?? 0,
          totalSpace: stats.storageLimitBytes ?? 0,
        });
        setIsStorageDataLoaded(true);
      }
    } catch (err) {
      // Set loaded even on error to prevent infinite loading
      setIsStorageDataLoaded(true);
    }
  }, [API_URL]);

  useEffect(() => { fetchStorageStats(); }, [fetchStorageStats]);

  // Listen for storage change events from permanent deletions
  useEffect(() => {
    const handleStorageChange = () => {
      fetchStorageStats();
    };

    window.addEventListener('storageChanged', handleStorageChange);
    return () => {
      window.removeEventListener('storageChanged', handleStorageChange);
    };
  }, [fetchStorageStats]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setHelperMessage(null);
    setFiles(prev => {
      // Prevent duplicates by name+size+lastModified
      const existing = new Set(prev.map(f => `${f.name}|${f.size}|${f.lastModified}`));
      const filtered = acceptedFiles.filter(f => !existing.has(`${f.name}|${f.size}|${f.lastModified}`));

      // Only accept images and videos, and enforce 10 MB per file
      const allowedByTypeAndSize: File[] = [];
      const rejected: string[] = [];
      const maxBytes = 10 * 1024 * 1024;
      for (const f of filtered) {
        const mime = f.type || '';
        const isImage = mime.startsWith('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name);
        const isVideo = mime.startsWith('video') || /\.(mp4|mov|webm|ogg|avi)$/i.test(f.name);
        if (!(isImage || isVideo)) {
          rejected.push(`${f.name} (unsupported type)`);
          continue;
        }
        if (f.size > maxBytes) {
          rejected.push(`${f.name} (exceeds 10 MB)`);
          continue;
        }
        allowedByTypeAndSize.push(f);
      }

      if (rejected.length > 0) {
        setHelperMessage(`Some files were skipped: ${rejected.join(', ')}`);
      }

      // If we know free space, ensure we don't exceed it
      const available = storageData.freeSpace ?? 0;
      const currentSize = prev.reduce((s, f) => s + f.size, 0);
      let allowed: File[] = [];
      let acc = 0;
      for (const f of allowedByTypeAndSize) {
        if (available === 0 || currentSize + acc + f.size <= available) {
          allowed.push(f);
          acc += f.size;
        } else {
          // skip files that don't fit
          setHelperMessage((m) => (m ? m + ' Some files skipped due to storage limit.' : 'Some files skipped due to storage limit.'));
        }
      }

      return [...prev, ...allowed];
    });
  }, [storageData]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, multiple: true, disabled: isUploading, noClick: true, noKeyboard: true, accept: { 'image/*': [], 'video/*': [] } });

  const totalQueuedSize = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const clearAll = () => setFiles([]);

  const mediaStore = useMediaStore();

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setProgress(0);

    const form = new FormData();
    files.forEach(f => form.append('files', f));

    try {
      const url = API_ENDPOINTS.UPLOAD;
      // Use fetch for uploads to keep consistency across the project. Fetch
      // doesn't provide upload progress events, so we show an indeterminate
      // progress bar while the request is in flight.
      setProgress(0);
      const resp = await fetch(url, {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      let result: any;
      try {
        result = await resp.json();
      } catch (err) {
        result = { rawResponseText: await resp.text() };
      }
      if (!resp.ok) throw new Error(result?.message || result?.rawResponseText || 'Upload failed');

      // Support multiple backend response shapes: { data: [...] } or { files: [...] } or direct array/object
      const payload = result?.data ?? result?.files ?? result;
      if (payload) {
        // Normalize backend response to the MediaFile shape we expect so
        // MediaGrid/MediaCard can render immediately.
        const normalize = (item: any) => {
          const name = item.original_filename || item.name || item.filename || item.fileName || item.title || '';
          const id = item.id || item._id || item.file_id || item.fileId || '';
          const url = item.url || item.file_url || item.path || item.location || (id ? API_ENDPOINTS.FILE(id) : '');
          const thumbnail_url = item.thumbnail_url || item.thumb || item.thumbnail || url;
          const mime = item.mimetype || item.content_type || item.type || '';
          const inferType = () => {
            if (mime.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name)) return 'image';
            if (mime.includes('video') || /\.(mp4|mov|webm|ogg|avi)$/i.test(name)) return 'video';
            return 'other';
          };
          return {
            id,
            name,
            url,
            type: inferType(),
            thumbnail_url,
            is_favorite: !!item.is_favorite || !!item.isFavorite,
            size: item.size || item.filesize || item.byteSize || 0,
            uploadedAt: item.uploaded_at || item.created_at || item.createdAt || '',
          };
        };

  const normalizedRaw = Array.isArray(payload) ? payload : [payload];
          const normalized = normalizedRaw.map((item: any) => {
          const n = normalize(item);
          // Ensure we have an id (generate temporary id if backend didn't provide one)
          const hadId = !!n.id;
          if (!n.id) n.id = `temp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

          // Normalize common backend fields we see: original_filename, has_thumbnail, uploaded_at
          if (!n.name && item.original_filename) n.name = item.original_filename;
          if (!n.uploadedAt && (item.uploaded_at || item.uploadedAt)) n.uploadedAt = item.uploaded_at || item.uploadedAt;

          // Compute a canonical remote thumbnail candidate (may be undefined).
          // Prefer the dedicated download-thumbnail endpoint whenever we
          // have a server id. Some backends set `item.url` to the raw file
          // (mp4), which causes clients to fetch the full video. Using the
          // thumbnail endpoint reduces bandwidth and yields PNG/JPEG when
          // available.
          // Only use thumbnail URLs that the server explicitly provided
          // For newly uploaded files, mark them as not ready for thumbnail loading yet
          let remoteCandidate = item.thumbnail_url || null;
          try {
            if (typeof remoteCandidate === 'string' && /\/api\/auth\/thumbnail\//.test(remoteCandidate) && n.id) {
              remoteCandidate = API_ENDPOINTS.DOWNLOAD_THUMBNAIL(n.id);
            }
          } catch (e) {}

          // Only set thumbnail URL if server explicitly provided one
          if (remoteCandidate) {
            n.thumbnail_url = remoteCandidate;
          }

          // Store the potential thumbnail endpoint for background fetch to try later
          (n as any).__remoteThumbnail = hadId ? API_ENDPOINTS.DOWNLOAD_THUMBNAIL(n.id) : null;

          // mark optimistic only when we generated a temp id (backend didn't supply a real id)
          (n as any).__optimistic = !hadId;
          return n;
        });

        // Optimistically add returned file objects to the shared cache so the gallery updates immediately
        try {
          mediaStore.addFilesToCache(normalized as any);
        } catch (err) {
          // ignore
        }
        // Notify parent about the upload result after optimistic cache insertion
        // Parent (GalleryMedia) will show the overall success snackbar, so avoid
        // showing a duplicate success message here. Keep error messaging in this
        // component though.
        onUploadSuccess(normalized as any);

        // Let MediaCard handle thumbnail loading on its own - no background fetch needed

  // Trigger a single delayed fetch to reconcile with backend processing (avoid duplicate immediate fetches)
  setTimeout(() => { try { mediaStore.fetchMedia('gallery', 1, true); mediaStore.fetchMedia('favorites', 1, true); } catch (err) {} }, 2000);
      }
      setFiles([]);
      setProgress(100);
      await fetchStorageStats();
      
      // Dispatch storage change event for any other components that might need to update
      try {
        window.dispatchEvent(new CustomEvent('storageChanged'));
      } catch (err) {
        // Ignore if event dispatching fails
      }
    } catch (err) {
      // Show a user-friendly message and set a helper note in the queue UI
      const messageText = err && (err as any).message ? String((err as any).message) : 'Upload failed. Please try again.';
  setHelperMessage('Upload failed. Please try again.');
  try { showSnackbar(messageText, 'error'); } catch (e) { /* ignore */ }
    } finally {
      setIsUploading(false);
      // reset progress after a short delay so the UI briefly shows completion
      setTimeout(() => setProgress(0), 800);
    }
  };

  return (<>
    <Box sx={{ display: 'flex', gap: { xs: 3, md: 4 }, flexDirection: { xs: 'column', md: 'row' }, mb: 4, width: '100%', maxWidth: '1900px' }}>
      {/* Use flexible widths instead of fixed 0 0 bases so layout matches media grid responsiveness */}
      <Card sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
        <Box {...getRootProps()} sx={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', mt: 2, border: '2px dashed', borderColor: isDragActive ? 'transparent' : 'grey.300', borderRadius: 2, p: 2, background: isDragActive ? 'linear-gradient(90deg,#3185ff,#5540ec)' : 'none' }}>
          {/* Hidden input controlled by react-dropzone; add an id so a label/button can trigger it */}
          <input {...getInputProps()} style={{ display: 'none' }} />
          <UploadIcon sx={{ fontSize: 40, color: isDragActive ? 'white' : 'primary.main', mb: 1 }} />
          <Typography variant="body1" sx={{ color: isDragActive ? 'white' : 'text.primary', fontWeight: 600 }}>Drag & Drop files here</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>or</Typography>
          <Button
            variant="contained"
            onClick={(e) => { e.stopPropagation(); open(); }}
            sx={{
              mt: 1,
              textTransform: 'capitalize',
              background: 'linear-gradient(90deg, #3185ff, #5540ec)',
              '&:hover': { background: 'linear-gradient(90deg, #3185ff, #5540ec)', opacity: 0.9 }
            }}
          >
            Browse files
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>You can upload videos and images up to 10 MB each.</Typography>

        {/* File queue */}
        <Box sx={{ mt: 2, flex: '1 1 auto', minHeight: 30, maxHeight: 220, overflowY: 'auto' }}>
          <List dense>
            {files.map((f, i) => (
              <ListItem key={`${f.name}-${f.size}-${f.lastModified}`} secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => removeFile(i)} disabled={isUploading}>
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemText primary={f.name} secondary={`${(f.size/1024/1024).toFixed(2)} MB`} />
              </ListItem>
            ))}
          </List>
        </Box>
        {helperMessage && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="error">{helperMessage}</Typography>
          </Box>
        )}

    {/* Make Total take the full row so buttons sit below it and won't wrap on narrow widths */}
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'stretch', justifyContent: 'flex-start', flex: '0 0 auto' }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: '100%' }}>Total: {(totalQueuedSize/1024/1024).toFixed(2)} MB</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
      <Button 
        variant="outlined"
        onClick={clearAll}
        disabled={isUploading || files.length === 0}
        sx={{ 
          textTransform: 'capitalize',
        }}
      >
        Clear
      </Button>

      <Button 
        variant="contained"
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
        sx={{ 
          textTransform: 'capitalize',
          color: (isUploading || files.length === 0) ? '#3d3d3dff' : 'whitesmoke',
          background: "linear-gradient(90deg, #3185ff, #5540ec)",
            '&:hover': {
              background: "linear-gradient(90deg, #3185ff, #5540ec)",
              opacity: 0.9,
            }
        }}
      >
        Upload
      </Button>
      </Box>
    </Box>

        { isUploading ? (
          <Box sx={{ width: '100%', mt: 2 }}><LinearProgress /></Box>
        ) : progress > 0 ? (
          <Box sx={{ width: '100%', mt: 2 }}><LinearProgress variant="determinate" value={progress} /></Box>
        ) : null }
      </Card>

      <Card sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: '100%' }}>
          {isStorageDataLoaded ? (
            <StorageDonutChart data={{ images: storageData.images, videos: storageData.videos, freeSpace: storageData.freeSpace, totalSpace: storageData.totalSpace }} />
          ) : (
            <StorageDonutChartSkeleton />
          )}
        </Box>
      </Card>
    </Box>
      {/* messages shown via centralized snackbar */}
    </>
  );
};

export default GalleryUpload;
