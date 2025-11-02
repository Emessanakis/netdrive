// StorageDonutChartSkeleton.tsx
import React from 'react';
import { Box, Skeleton } from '@mui/material';

interface StorageDonutChartSkeletonProps {
  size?: number | string;
}

const StorageDonutChartSkeleton: React.FC<StorageDonutChartSkeletonProps> = ({
  size = 180,
}) => {
  const numericSize = typeof size === 'number' ? size : 180;

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 3, 
      width: '100%', 
      height: '100%', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 2, 
      flexDirection: { xs: 'column', md: 'column', lg: 'column', xl:'row' } 
    }}>
      {/* Donut Chart Skeleton */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: numericSize, 
          aspectRatio: `${numericSize} / ${numericSize}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Circular skeleton for the donut chart */}
          <Skeleton 
            variant="circular" 
            width={numericSize} 
            height={numericSize}
            sx={{ 
              bgcolor: 'action.hover',
              opacity: 0.3
            }}
          />
          
          {/* Center text skeleton */}
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5
          }}>
            <Skeleton variant="text" width={40} height={24} sx={{ fontSize: '1.5rem' }} />
            <Skeleton variant="text" width={30} height={16} sx={{ fontSize: '0.75rem' }} />
            <Skeleton variant="text" width={35} height={12} sx={{ fontSize: '0.6rem' }} />
          </Box>
        </Box>
      </Box>

      {/* Legend Skeleton */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Images skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width={60} height={20} />
          </Box>
          <Skeleton variant="text" width={50} height={20} />
        </Box>

        {/* Videos skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width={50} height={20} />
          </Box>
          <Skeleton variant="text" width={45} height={20} />
        </Box>

        {/* Free space skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width={35} height={20} />
          </Box>
          <Skeleton variant="text" width={55} height={20} />
        </Box>
      </Box>
    </Box>
  );
};

export default StorageDonutChartSkeleton;