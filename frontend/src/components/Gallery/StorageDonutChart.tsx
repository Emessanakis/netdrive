// StorageDonutChart.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

interface StorageData {
  images: number;
  videos: number;
  freeSpace: number;
  totalSpace: number;
}

interface StorageDonutChartProps {
  data: StorageData;
  size?: number | string;
  strokeWidth?: number;
}

const StorageDonutChart: React.FC<StorageDonutChartProps> = ({
  data,
  size = 180,
  strokeWidth = 16,
}) => {
  const colors = {
    images: '#ff6b6b',
    videos: '#4ecdc4',
    freeSpace: '#e0e0e0',
  };

  const calculateSegments = () => {
    // Build segments but draw the free/background segment first so it does
    // not paint on top of the small colored segments (images/videos).
    const { images, videos, freeSpace, totalSpace } = data;

    const raw = [
      { name: 'free', value: freeSpace, color: colors.freeSpace },
      { name: 'images', value: images, color: colors.images },
      { name: 'videos', value: videos, color: colors.videos },
    ];

    // Use reported totalSpace when available; otherwise sum all parts
    const sumParts = raw.reduce((s, r) => s + (r.value || 0), 0);
    const total = (typeof totalSpace === 'number' && totalSpace > 0) ? totalSpace : (sumParts > 0 ? sumParts : 1);

    let cumulative = 0;
    return raw
      .map(r => ({ ...r, percentage: (r.value / total) * 100 }))
      .filter(r => r.percentage > 0)
      .map(r => {
        const seg = { ...r, startPercentage: cumulative, endPercentage: cumulative + r.percentage };
        cumulative += r.percentage;
        return seg;
      });
  };

  const segments = calculateSegments();
  const numericSize = typeof size === 'number' ? size : 180;
  const radius = (numericSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usedSpace = data.images + data.videos;
  const usedPercentage = data.totalSpace > 0 ? (usedSpace / data.totalSpace) * 100 : 0;

  const allCategories = [
    { name: 'images', value: data.images, color: colors.images },
    { name: 'videos', value: data.videos, color: colors.videos },
  ];

  return (
    // Stack the donut and the legend vertically on small screens and again on large (lg)
    // Keeping md as row so the donut doesn't stack prematurely — this makes the
    // donut behave as you requested (stack at lg) while leaving parent layouts untouched.
    <Box sx={{ display: 'flex', gap: 3, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', p: 2, flexDirection: { xs: 'column', md: 'column', lg: 'column', xl:'row' } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <Box sx={{ position: 'relative', width: '100%', maxWidth: numericSize, aspectRatio: `${numericSize} / ${numericSize}` }}>
          <svg viewBox={`0 0 ${numericSize} ${numericSize}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={numericSize / 2} cy={numericSize / 2} r={radius} fill="none" stroke={colors.freeSpace} strokeWidth={strokeWidth} opacity={0.3} />
            {segments.map((segment, index) => {
              const previousLength = (segment.startPercentage / 100) * circumference;
              const segmentLength = (segment.percentage / 100) * circumference;
              // Draw the segment with a dasharray equal to the segment length followed by the remainder
              const strokeDasharray = `${segmentLength} ${circumference - segmentLength}`;
              // offset so the segment starts at the correct cumulative position.
              // using circumference - previousLength aligns the start correctly
              const strokeDashoffset = circumference - previousLength;
              return (
                <circle
                  key={index}
                  cx={numericSize / 2}
                  cy={numericSize / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              );
            })}
            {usedSpace === 0 && (
              <circle cx={numericSize / 2} cy={numericSize / 2} r={radius} fill="none" stroke={colors.images} strokeWidth={strokeWidth} strokeDasharray={`${circumference * 0.02} ${circumference * 0.98}`} strokeDashoffset={0} strokeLinecap="round" />
            )}
          </svg>

          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap' }}>
            <Typography variant="h5" fontWeight="bold" color="text.primary" fontSize="1.5rem" sx={{ whiteSpace: 'nowrap' }}>{Math.round(usedPercentage)}%</Typography>
            <Typography variant="body2" color="text.secondary" fontSize="0.75rem" fontWeight="500" sx={{ lineHeight: 1.2, whiteSpace: 'nowrap' }}>Used</Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.6rem" sx={{ lineHeight: 1.2, mt: 0.5, whiteSpace: 'nowrap' }}>{formatBytes(usedSpace)}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {allCategories.map((category) => (
          // Use a small fixed gap between the title (left) and the value so
          // the label/value pair has consistent spacing instead of stretching
          // excessively with `space-between`.
          <Box key={category.name} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: category.color, border: `2px solid white`, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              <Typography variant="body1" color="text.primary" fontSize="1rem" fontWeight="500" sx={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{category.name}</Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" fontWeight="bold" fontSize="1rem" sx={{ whiteSpace: 'nowrap', marginLeft: '15px' }}>{formatBytes(category.value)}</Typography>
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: colors.freeSpace, border: `2px solid white`, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            <Typography variant="body1" color="text.primary" fontSize="1rem" fontWeight="500" minWidth={'px'}>Free</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" fontWeight="bold" fontSize="1rem">{formatBytes(data.freeSpace)}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StorageDonutChart;
