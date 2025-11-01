import React, { useState } from "react";
import { 
  Box, 
  Icon, 
  Typography, 
  Avatar, 
  Dialog, 
  useTheme, 
  useMediaQuery,
  IconButton 
} from "@mui/material";
import netDriveLogo from "../../assets/logo-flat-icon.png";
import userImg from "../../assets/user.png";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Profile from "../Profile/Profile"; 
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

interface TopbarProps {
  showSidebar: boolean;
  onToggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ showSidebar, onToggleSidebar }) => {
  const { user } = useAuth();
  // if (!user) return null;
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // sm and xs (below 900px)

  const [openDialog, setOpenDialog] = useState(false);

  const handleDashboard = () => navigate("/");
  const handleOpenProfile = () => setOpenDialog(true);
  const handleCloseProfile = () => setOpenDialog(false);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        minWidth: 200,
        borderBottom: "2px solid whitesmoke",
        paddingRight: '15px',
        paddingLeft: { xs: '10px', md: '15px' },
        height: 50,
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 1100, // Higher than sidebar zIndex
        // Mobile-specific sticky behavior
        ...(isSmallScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          // ensure the topbar left padding matches the sidebar's icon column so
          // the mobile burger icon visually lines up with the sidebar icons.
          paddingLeft: '10px',
        }),
      }}
    >
      {/* Left side: Logo + Title + Toggle Button */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Sidebar Toggle Button - Only show on sm and xs screens (below 900px) */}
        {isSmallScreen && (
          <IconButton
            onClick={onToggleSidebar}
            sx={{
              color: "#3185ff",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(49, 133, 255, 0.1)",
                transform: "scale(1.1)",
              },
            }}
          >
            {showSidebar ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        )}
        
        {/* Logo and Title */}
        <Box
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1, 
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-1px)",
            }
          }}
          onClick={handleDashboard}
        >
          <Icon
            sx={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={netDriveLogo}
              alt="NetDrive"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scale(1.7)",
                transformOrigin: "center",
              }}
            />
          </Icon>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 20,
              userSelect: "none",
              background: "linear-gradient(90deg, #3185ff, #5540ec)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transition: "all 0.3s ease",
            }}
          >
            NetDrive
          </Typography>
        </Box>
      </Box>

      {/* Right side: User avatar */}
      {user && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": { 
              transform: "scale(1.05)",
              "& .user-info": {
                transform: "translateX(-2px)",
              }
            },
          }}
          onClick={handleOpenProfile}
        >
          {/* Avatar */}
          <Avatar
            src={user.picture || userImg}
            alt={user.username}
            variant="square"
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              transition: "all 0.3s ease",
            }}
          />

          {/* User Info - Animated like sidebar */}
          <Box 
            className="user-info"
            sx={{ 
              display: 'flex',
              flexDirection: "column", 
              lineHeight: 1,
              width: isLargeScreen ? 'auto' : 0,
              opacity: isLargeScreen ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 0.5s ease',
              transform: isLargeScreen ? 'translateX(0)' : 'translateX(-10px)',
              gap: 0.2,
            }}
          >
            <Typography sx={{ 
              fontSize: 12, 
              color: "#3B3B3B",
              whiteSpace: 'nowrap',
              minWidth: 80,
            }}>
              {user.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Typography sx={{ 
                fontSize: 14, 
                fontWeight: 500, 
                color: "#3B3B3B",
                whiteSpace: 'nowrap',
                minWidth: 60,
              }}>
                {user.username}
              </Typography>
              <ArrowDropDownIcon sx={{ 
                fontSize: 20, 
                color: "#3B3B3B",
                transition: "all 0.3s ease",
              }} />
            </Box>
          </Box>
        </Box>
      )}

      {/* Dialog with Profile */}
      <Dialog
        open={openDialog}
        onClose={handleCloseProfile}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 2,
            boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
          }
        }}
      >
        <Profile onClose={handleCloseProfile} />
      </Dialog>
    </Box>
  );
};

export default Topbar;