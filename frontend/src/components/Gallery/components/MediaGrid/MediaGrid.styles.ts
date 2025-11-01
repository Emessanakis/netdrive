// src/components/MediaGallery/components/MediaGrid/MediaGrid.styles.ts
import type { SxProps } from '@mui/material';

export const gridContainerStyle: SxProps = {
  display: 'flex', 
  flexWrap: 'wrap', 
  justifyContent: 'flex-start',
  gap: '16px',
  minHeight: 'auto',
  overflow: 'visible',
};

export const errorContainerStyle: SxProps = {
  p: 2, 
  mb: 3, 
  bgcolor: 'error.light', 
  color: 'error.contrastText', 
  borderRadius: 1, 
  display: 'flex', 
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const loadMoreButtonStyle: SxProps = {
  textTransform: "capitalize", 
  background: "linear-gradient(90deg, #3185ff, #5540ec)", 
  '@keyframes spin': { 
    from: { transform: 'rotate(0deg)' }, 
    to: { transform: 'rotate(360deg)' } 
  },
};

export const emptyStateStyle: SxProps = {
  textAlign: 'center', 
  py: 8,
  color: 'text.secondary',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

export const loadMoreContainerStyle: SxProps = {
  mt: 4, 
  textAlign: 'center',
  pb: 3,
};

export const loadingMoreContainerStyle: SxProps = {
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center',
  mt: 2,
  py: 2,
  color: 'text.secondary',
};

// Remove overflow from main container
export const mainContainerStyle: SxProps = {
  p: 3, 
  bgcolor: 'background.paper', 
  borderRadius: 3, 
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  border: '1px solid',
  borderColor: 'divider',
  minHeight: 'fit-content',
  display: 'block',
  overflow: 'visible',
};

// Remove overflow from wrapper
export const paperWrapperStyle: SxProps = {
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: '1px solid',
  borderColor: 'divider',
  p: 3,
  mb: 3,
  overflow: 'visible',
};