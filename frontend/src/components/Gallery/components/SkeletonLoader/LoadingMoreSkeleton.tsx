// LoadingMoreSkeleton - small lightweight skeleton used when loading more items
import React from 'react';
import { Box } from '@mui/material';

export interface LoadingMoreSkeletonProps {
  count?: number;
}

export const LoadingMoreSkeleton: React.FC<LoadingMoreSkeletonProps> = ({ count = 6 }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, pb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Box 
            key={index}
            sx={{ 
              width: 80, 
              height: 30, 
              borderRadius: 1,
              bgcolor: 'grey.200',
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.6 },
                '50%': { opacity: 0.3 },
                '100%': { opacity: 0.6 },
              }
            }} 
          />
        ))}
      </Box>
    </Box>
  );
};