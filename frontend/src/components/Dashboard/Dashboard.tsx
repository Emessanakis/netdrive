import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Content from './Content';
import Sidebar from './Sidebar';
import Topbar from '../Topbar/Tobar';

const Dashboard: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string>('Gallery');
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarItemClick = (item: string) => {
    setSelectedItem(item);
    if (window.innerWidth < 900) {
      setShowSidebar(false);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 900) {
      setShowSidebar(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      minWidth: '100vw',
      overflow: 'hidden'
    }}>
      <Topbar 
        showSidebar={showSidebar}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main area: Sidebar + Content */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row', 
        width: '100%',
        height: 'calc(100vh - 50px)',
        marginTop: '0px'
      }}>
        <Sidebar
          selectedItem={selectedItem}
          onSidebarItemClick={handleSidebarItemClick}
          showSidebar={showSidebar}
          onCloseSidebar={closeSidebar}
        />
        <Content 
          selectedItem={selectedItem} 
          showSidebar={showSidebar}
          onContentClick={closeSidebar}
          onInitialLoadComplete={() => {}} 
        />
      </Box>
    </Box>
  );
};

export default Dashboard;