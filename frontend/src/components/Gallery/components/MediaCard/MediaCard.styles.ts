// src/components/MediaGallery/components/MediaCard/MediaCard.styles.ts
import type { SxProps } from '@mui/material';

export const mirrorButtonStyle: SxProps = {
  bgcolor: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)', 
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.3)', 
  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
  fontSize: '0.7rem',
  py: 0.5, 
  textTransform: 'capitalize',
  minWidth: 0,
  borderRadius: 1,
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
};

export const cardStyle: SxProps = {
  height: '100%',
  borderRadius: 2,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer',
  transformStyle: 'preserve-3d',
  '&:hover': { 
    transform: 'translateY(-4px)', 
    boxShadow: 6,
  },
};

// Fixed size container for the card - SIMPLIFIED
export const cardContainerStyle: SxProps = {
  position: 'relative',
  flex: {
    xs: '0 0 calc(50% - 8px)',
    sm: '0 0 calc(33.33% - 10.67px)',
    // Keep 3 columns at md to avoid an awkward 4-column layout on medium widths
    md: '0 0 calc(33.33% - 10.67px)',
    // Use 4 columns starting at large screens
    lg: '0 0 calc(25% - 12px)',
    // 5 columns on extra-large
    xl: '0 0 calc(20% - 12.8px)',
  },
  height: {
    xs: '150px',
    sm: '180px',
    md: '200px',
    lg: '220px',
    xl: '240px',
  },
  minHeight: '150px',
};

export const mediaContainerStyle: SxProps = {
  position: 'relative', 
  width: '100%',
  height: '100%',
  bgcolor: 'grey.100',
  display: 'flex',
  flexDirection: 'column',
};

export const mediaStyle: SxProps = {
  width: '100%',
  height: '100%', 
  objectFit: 'cover',
  flexGrow: 1,
};

export const fileNameStyle: SxProps = {
  position: 'absolute', 
  top: 0, 
  left: 0, 
  right: 0, 
  p: 1, 
  zIndex: 3, 
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
};

export const actionButtonsStyle: SxProps = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 3,
  display: { xs: 'none', md: 'flex' },
  justifyContent: 'space-between',
  px: 1, 
  pb: 1, 
  pt: 3, 
  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  gap: 1, 
};

export const mobileActionsStyle: SxProps = {
  position: 'absolute',
  bottom: 8, 
  right: 8, 
  zIndex: 4,
  display: { xs: 'flex', md: 'none' }, 
  flexDirection: 'row', 
  alignItems: 'center',
  p: 0.5,
  gap: 1, 
  bgcolor: 'rgba(0,0,0,0.4)', 
  borderRadius: 2,
};

export const videoIconStyle: SxProps = {
  position: 'absolute', 
  top: 8, 
  right: 8, 
  bgcolor: 'rgba(0,0,0,0.6)', 
  borderRadius: '50%', 
  p: 0.5, 
  zIndex: 2, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
};

export const favoriteIconStyle: SxProps = {
  position: 'absolute', 
  top: 8, 
  right: 8,
  bgcolor: 'rgba(0, 102, 255, 0.6)', 
  p: 0.5, 
  zIndex: 10,
  '&:hover': { 
    bgcolor: 'rgba(0, 102, 255, 0.8)',
  },
};

export const favoriteIconNotStyle: SxProps = {
  position: 'absolute', 
  top: 8, 
  right: 8,
  bgcolor: 'rgba(0,0,0,0.4)', 
  p: 0.5, 
  zIndex: 10,
  '&:hover': { 
    bgcolor: 'rgba(0,0,0,0.6)',
  },
};