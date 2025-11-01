import React, { useEffect, useState, useRef } from 'react';
import { Box, List, ListItemButton, ListItemText } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CollectionsIcon from '@mui/icons-material/Collections';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';

import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  selectedItem: string;
  onSidebarItemClick: (item: string) => void;
  showSidebar: boolean;
  onCloseSidebar: () => void;
}

const gradient = 'linear-gradient(90deg, #3185ff, #5540ec)';

const styles = {
  item: {
    padding: '5px',
    borderRadius: '10px',
    gap: '10px',
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow:
        '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    },
  },
  selectedButton: {
    background: gradient,
    color: 'white',
    fontWeight: 600,
    '&:hover': {
      background: gradient,
      opacity: 0.9,
    },
  },
};

const Sidebar: React.FC<SidebarProps> = ({ selectedItem, onSidebarItemClick, showSidebar, onCloseSidebar }) => {
  const { user } = useAuth();
  // if (!user) return null;
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedItem) onSidebarItemClick('Gallery');
  }, [selectedItem, onSidebarItemClick]);

  // Check screen width for mobile (below 900px - same as toggle button)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && 
          showSidebar && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node)) {
        onCloseSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, showSidebar, onCloseSidebar]);

  // If mobile and sidebar should be hidden, return null
  if (isMobile && !showSidebar) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && showSidebar && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 }
            }
          }}
        />
      )}
      
      <Box
        ref={sidebarRef}
        sx={{
          padding: '10px',
          width: showSidebar ? '220px' : '60px',
          minHeight: 'calc(100vh - 50px)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.5s ease, opacity 0.3s ease, transform 0.3s ease',
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          // Mobile-specific styles
          ...(isMobile && {
            position: 'fixed',
            zIndex: 1000,
            height: 'calc(100vh - 50px)',
            top: '50px',
            opacity: showSidebar ? 1 : 0,
            transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)',
            width: '220px',
          }),
        }}
      >
        <List sx={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
          {/* Gallery */}
          <ListItemButton
            sx={{ ...styles.item, ...(selectedItem === 'Gallery' ? styles.selectedButton : {}) }}
            onClick={() => onSidebarItemClick('Gallery')}
          >
            <CollectionsIcon sx={{ color: selectedItem === 'Gallery' ? 'white' : 'inherit' }} />
            {showSidebar && <ListItemText primary="Gallery" />}
          </ListItemButton>

          {/* Favorites */}
          <ListItemButton
            sx={{ ...styles.item, ...(selectedItem === 'Favorites' ? styles.selectedButton : {}) }}
            onClick={() => onSidebarItemClick('Favorites')}
          >
            <FavoriteIcon sx={{ color: selectedItem === 'Favorites' ? 'white' : 'inherit' }} />
            {showSidebar && <ListItemText primary="Favorites" />}
          </ListItemButton>

          {/* Deleted */}
          <ListItemButton
            sx={{ ...styles.item, ...(selectedItem === 'Deleted' ? styles.selectedButton : {}) }}
            onClick={() => onSidebarItemClick('Deleted')}
          >
            <DeleteIcon sx={{ color: selectedItem === 'Deleted' ? 'white' : 'inherit' }} />
            {showSidebar && <ListItemText primary="Deleted" />}
          </ListItemButton>

          {/* Create User - Admin only */}
          {user?.role === 'ROLE_ADMIN' && (
            <ListItemButton
              sx={{ ...styles.item, ...(selectedItem === 'CreateUser' ? styles.selectedButton : {}) }}
              onClick={() => onSidebarItemClick('CreateUser')}
            >
              <PersonAddIcon sx={{ color: selectedItem === 'CreateUser' ? 'white' : 'inherit' }} />
              {showSidebar && <ListItemText primary="Create User" />}
            </ListItemButton>
          )}
        </List>
      </Box>
    </>
  );
};

export default Sidebar;