import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Card, Typography, Button, LinearProgress, List, ListItem, ListItemText, IconButton } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import StorageDonutChart from './StorageDonutChart';
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
      }
    } catch (err) {
      // ignore for now
    }
  }, [API_URL]);

  useEffect(() => { fetchStorageStats(); }, [fetchStorageStats]);

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

    // Create local preview URLs for queued files so we can show optimistic thumbnails
    const previewUrls = files.map(f => URL.createObjectURL(f));

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
          const normalized = normalizedRaw.map((item: any, i: number) => {
          const n = normalize(item);
          // Ensure we have an id (generate temporary id if backend didn't provide one)
          const hadId = !!n.id;
          if (!n.id) n.id = `temp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

          // Normalize common backend fields we see: original_filename, has_thumbnail, uploaded_at
          if (!n.name && item.original_filename) n.name = item.original_filename;
          if (!n.uploadedAt && (item.uploaded_at || item.uploadedAt)) n.uploadedAt = item.uploaded_at || item.uploadedAt;

          // Prefer local preview URL when available (shows immediately and avoids CSP issues)
          const preview = previewUrls[i];
          // Compute a canonical remote thumbnail candidate (may be undefined).
          // Prefer the dedicated download-thumbnail endpoint whenever we
          // have a server id. Some backends set `item.url` to the raw file
          // (mp4), which causes clients to fetch the full video. Using the
          // thumbnail endpoint reduces bandwidth and yields PNG/JPEG when
          // available.
          // Some backends return a legacy `/api/auth/thumbnail/:id` URL. Normalize
          // those to the canonical download-thumbnail endpoint to avoid extra
          // or incorrect requests from the client.
          // Only construct a download-thumbnail candidate when the backend provided
          // a real id (hadId). For optimistic/temp ids we should not point the
          // client at a server thumbnail endpoint that won't exist yet.
          let remoteCandidate = item.thumbnail_url || (hadId ? API_ENDPOINTS.DOWNLOAD_THUMBNAIL(n.id) : null) || item.url;
          try {
            if (typeof remoteCandidate === 'string' && /\/api\/auth\/thumbnail\//.test(remoteCandidate) && n.id) {
              remoteCandidate = API_ENDPOINTS.DOWNLOAD_THUMBNAIL(n.id);
            }
          } catch (e) {}

          // Prefer the dedicated server-side thumbnail URL when possible so
          // the client consistently requests the same canonical thumbnail.
          // Fall back to the local preview only if we don't have a remote candidate.
          if (remoteCandidate) {
            n.thumbnail_url = remoteCandidate;
          } else if (preview) {
            n.thumbnail_url = preview;
          }

          // keep the canonical remote thumbnail separately so background fetch can try it
          (n as any).__remoteThumbnail = remoteCandidate || null;

          if (!n.url && preview) n.url = preview;

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
        // After optimistic insertion, query the canonical file record for each uploaded item
        // so we can obtain authoritative thumbnail_id/thumbnail_url values. Then run the
        // background fetch/convert-to-dataURL flow against those canonical URLs with retry.
        (async () => {
          // Helper: fetch the get-file endpoint for a single id and update cache
          const fetchCanonical = async (item: any) => {
            try {
              // Only fetch for items that have a (likely) server id
              if (!item.id || String(item.id).startsWith('temp-')) return null;
              const resp = await fetch(API_ENDPOINTS.GET_FILE(item.id), { credentials: 'include' });
              if (!resp.ok) return null;
              const json = await resp.json();
              if (!json || !json.file) return null;
              const file = json.file;
              // Update cache with canonical urls/thumbnail info
              try {
                mediaStore.updateFileInCache(item.id, {
                  url: file.url || item.url,
                  thumbnail_url: file.thumbnail_url || item.thumbnail_url || null,
                } as any);
              } catch (err) {}
              // Return the canonical thumbnail candidate for further fetching
              return file.thumbnail_url || null;
            } catch (err) {
              return null;
            }
          };

          // Try to fetch canonical metadata for all uploaded items in parallel (limited to those with ids)
          const canonicalResults = await Promise.all(normalized.map(async (item: any) => {
            const remote = await fetchCanonical(item);
            // store remote candidate on the item for later processing
            (item as any).__remoteThumbnail = remote || ((item as any).__remoteThumbnail || null);
            return item;
          }));

          // Update the cache using the canonical remote thumbnail URL when appropriate.
          // To avoid duplicate network requests, do not preflight-request the thumbnail URL;
          // instead, prefer the dedicated thumbnail endpoint or any URL that already looks
          // like an image (data/blob or image extension). Otherwise fall back to the local preview.
          try {
            await Promise.allSettled(canonicalResults.map(async (item: any, idx: number) => {
              const remote = (item as any).__remoteThumbnail || item.url || item.thumbnail_url;
              if (!remote) return;

              const isThumbnailEndpoint = typeof remote === 'string' && remote.includes('/download-thumbnail');
              const isImageUrl = typeof remote === 'string' && (/\.(png|jpe?g|gif|webp)(\?|$)/i.test(remote) || remote.startsWith('data:') || remote.startsWith('blob:'));

              try {
                if (isThumbnailEndpoint || isImageUrl) {
                  // Let the browser request and cache the image once; avoid prefetching here.
                  try { mediaStore.updateFileInCache(item.id, { thumbnail_url: remote, url: remote } as any); } catch (err) {}
                } else {
                  try {
                    if (previewUrls && previewUrls[idx]) {
                      mediaStore.updateFileInCache(item.id, { thumbnail_url: previewUrls[idx], url: previewUrls[idx] } as any);
                    }
                  } catch (err) {}
                }
              } catch (err) {}
            }));
          } catch (err) {}
        })();
        // Notify parent about the upload result after optimistic cache insertion
        // Parent (GalleryMedia) will show the overall success snackbar, so avoid
        // showing a duplicate success message here. Keep error messaging in this
        // component though.
        onUploadSuccess(normalized as any);

        // Revoke preview URLs after a short delay (backend should supply real URLs on fetch)
        setTimeout(() => {
          previewUrls.forEach(url => {
            try { URL.revokeObjectURL(url); } catch (err) { /* ignore */ }
          });
        }, 30_000);
  // Trigger a single delayed fetch to reconcile with backend processing (avoid duplicate immediate fetches)
  setTimeout(() => { try { mediaStore.fetchMedia('gallery', 1, true); mediaStore.fetchMedia('favorites', 1, true); } catch (err) {} }, 2000);
      }
      setFiles([]);
      setProgress(100);
      await fetchStorageStats();
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
          <StorageDonutChart data={{ images: storageData.images, videos: storageData.videos, freeSpace: storageData.freeSpace, totalSpace: storageData.totalSpace }} />
        </Box>
      </Card>
    </Box>
      {/* messages shown via centralized snackbar */}
    </>
  );
};

export default GalleryUpload;
