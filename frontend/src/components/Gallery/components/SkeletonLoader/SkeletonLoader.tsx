// src/components/MediaGallery/components/SkeletonLoader/SkeletonLoader.tsx
import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { FILES_PER_PAGE } from '../../utils/galleryConstants';
import { cardContainerStyle } from '../MediaCard/MediaCard.styles';

export interface SkeletonLoaderProps {
  count?: number;
  variant?: 'gallery' | 'favorites' | 'trash';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  count, 
  variant = 'gallery' 
}) => {
  const getSkeletonCount = () => {
    if (typeof count === 'number') return count;

    switch (variant) {
      case 'favorites':
      case 'trash':
        return 6;
      case 'gallery':
      default:
        return FILES_PER_PAGE;
    }
  };

  const skeletonCount = getSkeletonCount();

  // Reuse card sizing so skeletons line up exactly with MediaCard
  const flexSizing = (cardContainerStyle as any).flex ?? {
    xs: '0 0 calc(50% - 8px)',
    sm: '0 0 calc(33.33% - 10.67px)',
    md: '0 0 calc(33.33% - 10.67px)',
    lg: '0 0 calc(25% - 12px)',
    xl: '0 0 calc(20% - 12.8px)',
  };

  const heightSizing = (cardContainerStyle as any).height ?? {
    xs: '150px',
    sm: '180px',
    md: '200px',
    lg: '220px',
    xl: '240px',
  };

  return (
    <>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <Box 
          key={index}
          sx={{ 
            position: 'relative',
            flex: flexSizing,
            height: heightSizing,
            minHeight: '150px',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'grey.100',
            }}
          >
            {/* Media Area Skeleton */}
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <Skeleton 
                variant="rectangular" 
                sx={{ 
                  width: '100%',
                  height: '100%',
                }} 
              />
              
              {/* Top bar skeleton */}
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                p: 1, 
                zIndex: 2,
              }}>
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
              
              {/* Action buttons skeleton */}
              <Box sx={{ 
                position: 'absolute',
                bottom: 8,
                right: 8,
                zIndex: 2,
                display: 'flex',
                gap: 1,
              }}>
                <Skeleton variant="circular" width={30} height={30} />
                <Skeleton variant="circular" width={30} height={30} />
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
    </>
  );
};