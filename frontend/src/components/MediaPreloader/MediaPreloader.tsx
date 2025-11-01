// src/components/MediaPreloader/MediaPreloader.tsx - FIXED VERSION
import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMediaStore } from '../Gallery/hooks/useMediaStore';

const MediaPreloader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  // if (!user) return null;
  const mediaStore = useMediaStore();
  const preloadAttemptedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !preloadAttemptedRef.current) {
      preloadAttemptedRef.current = true;
      // Now the method exists
      mediaStore.preloadAllMedia();
    }
  }, [isAuthenticated, user, mediaStore]);

  useEffect(() => {
    if (!isAuthenticated) {
      preloadAttemptedRef.current = false;
      // Now the method exists
      mediaStore.resetPreloadStatus();
    }
  }, [isAuthenticated, mediaStore]);

  // MediaPreloader's responsibility is to kick off media preloads when the
  // user is authenticated. The initial auth boot and blocking loader are
  // handled centrally in AppInitializer (main.tsx), so do not show any
  // auth-specific loader here.
  return <>{children}</>;
};

export default MediaPreloader;