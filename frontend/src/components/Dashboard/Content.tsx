// src/components/Content/Content.tsx - FINAL FIXED VERSION
import React, { useEffect, useRef } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import CreateUser from '../CreateUser/CreateUser';
import { 
  GalleryMedia, 
  FavoritesMedia, 
  TrashMedia 
} from '../Gallery';

interface ContentProps {
  selectedItem: string;
  showSidebar: boolean;
  onContentClick?: () => void;
  onInitialLoadComplete?: () => void;
}

const scrollbarStyles = {
  '&::-webkit-scrollbar': { 
    width: '12px', 
    height: '12px' 
  },
  '&::-webkit-scrollbar-track': { 
    background: '#f1f1f1',
    borderRadius: '8px'
  },
  '&::-webkit-scrollbar-thumb': { 
    background: '#c1c1c1',
    borderRadius: '8px',
    border: '2px solid #f1f1f1',
    '&:hover': { 
      background: '#a8a8a8' 
    }
  },
  scrollbarWidth: 'thin' as const,
  scrollbarColor: '#c1c1c1 #f1f1f1',
};

const Content: React.FC<ContentProps> = ({ 
  selectedItem, 
  showSidebar, 
  onContentClick,
  onInitialLoadComplete 
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastSelectedItemRef = useRef<string>('');

  const [loadingStates, setLoadingStates] = React.useState({
    gallery: false,
    favorites: false,
    trash: false
  });

  useEffect(() => {
    if (onInitialLoadComplete) {
      onInitialLoadComplete();
    }
  }, [onInitialLoadComplete]);

  useEffect(() => {
    if (scrollContainerRef.current && selectedItem !== lastSelectedItemRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      lastSelectedItemRef.current = selectedItem;
    }
  }, [selectedItem]);

  const handleLoadingChange = (section: keyof typeof loadingStates) => (loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [section]: loading
    }));
  };

  return (
    <Box
      onClick={onContentClick}
      sx={{
        flex: 1,
        transition: 'margin-left 0.5s, width 0.5s, margin-top 0.3s',
        width: showSidebar ? 'calc(100% - 220px)' : 'calc(100% - 60px)',
        height: 'calc(100vh - 50px)',
        marginTop: isSmallScreen ? '50px' : '0px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Box
        ref={scrollContainerRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'auto',
          ...scrollbarStyles,
          p: 3,
        }}
      >
        {/* Gallery */}
        <Box sx={{ 
          display: selectedItem === 'Gallery' ? 'block' : 'none',
          mb: 3,
        }}>
          <GalleryMedia 
            onLoadingChange={handleLoadingChange('gallery')}
            externalLoading={loadingStates.gallery}
          />
        </Box>
        
        {/* Favorites */}
        <Box sx={{ 
          display: selectedItem === 'Favorites' ? 'block' : 'none',
          mb: 3,
        }}>
          <FavoritesMedia 
            onLoadingChange={handleLoadingChange('favorites')}
            externalLoading={loadingStates.favorites}
          />
        </Box>
        
        {/* Deleted */}
        <Box sx={{ 
          display: selectedItem === 'Deleted' ? 'block' : 'none',
          mb: 3,
        }}>
          <TrashMedia 
            onLoadingChange={handleLoadingChange('trash')}
            externalLoading={loadingStates.trash}
          />
        </Box>
        
        {/* CreateUser */}
        <Box sx={{ 
          display: selectedItem === 'CreateUser' ? 'block' : 'none',
        }}>
          <CreateUser />
        </Box>
      </Box>
    </Box>
  );
};

export default Content;