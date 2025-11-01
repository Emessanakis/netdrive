import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from '../Snackbar/SnackbarProvider';
import netDriveFullLogo from "../../assets/netdrive-logo.png";
import statisticsIcon from "../../assets/netdrive-sign-in-image.jpg";
import Loader from "../Loader/Loader";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { showSnackbar } = useSnackbar();
  const [showLoader, setShowLoader] = useState(false);

  

  const handleLoginResponse = async (body: any) => {
    try {
      setShowLoader(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        try { showSnackbar(data.message || 'Login failed', 'error'); } catch (e) {}
        setShowLoader(false);
        return;
      }

      login({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        name: data.user.name,
        role: data.user.roles?.[0],
        picture: data.user.picture,
        planId: data.user.plan?.id ?? null,
        planName: data.user.plan?.name ?? null,
        storageLimitBytes: data.user.plan?.storageLimitBytes ?? 0,
        status: data.user.status,
      });

      // Navigate immediately after successful login
      setShowLoader(false);
      navigate("/");
      
    } catch (err) {
      try { showSnackbar((err as Error).message, 'error'); } catch (e) {}
      setShowLoader(false);
    }
  };

  // Normal login
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginResponse({ username, password });
  };

  // Google login
  const handleGoogleLogin = (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      try { showSnackbar('No Google credential received', 'error'); } catch (e) {}
      return;
    }
    handleLoginResponse({ credential: credentialResponse.credential });
  };

  const handleGoogleLoginError = () => {
    try { showSnackbar('Google authentication failed. Please try again.', 'error'); } catch (e) {}
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        padding: 2,
      }}
    >
      {showLoader && <Loader fullScreen loading={true} />}
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          width: "100%",
          maxWidth: {
            xs: 430,
            md: 1000
          },
          overflow: "hidden",
          minHeight: 300,
          maxHeight: 580,
        }}
      >
        {/* Left Side */}
        <Box
          sx={{
            width: 400,
            minWidth: 250,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            m: 2,
          }}
        >
          {/* Zoomed-in Logo */}
          <Box
            sx={{
              width: 300,
              height: 250,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={netDriveFullLogo}
              alt="NetDrive"
              sx={{
                width: "150%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>

          {/* Sign In Form */}
          <Typography variant="h5" align="center">
            Sign In
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", maxWidth: 300, mt: 1 }}>
            <TextField
              label="Username/Email"
              type="text"
              variant="standard"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />

            <TextField
              label="Password"
              type="password"
              variant="standard"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <Button type="submit" variant="contained" sx={{ mt: 1, background: "linear-gradient(90deg, #3185ff, #5540ec)", color: "whitesmoke" }}>
              Sign In
            </Button>
          </Box>

          <Divider sx={{ color: "grey", margin: "10px 20px" }}>or</Divider>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleLoginError}
              aria-label="Login with Google"
            />
          </Box>
        </Box>

        {/* Right Side */}
        <Box
          sx={{
            width: 600,
            background: "linear-gradient(135deg, #3185ff, #5540ec)",
            color: "white",
            display: {
              xs: "none",
              sm: "none", 
              md: "flex",
            },
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            m: 2,
            borderRadius: "15px",
            gap: 4,
            p: 2,
          }}
        >
          <Box sx={{ textAlign: "center", zIndex: 1, display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Typography variant="h4" fontWeight={600}>
              Welcome Back!
            </Typography>
            <Typography variant="body1">
              Please sign in to your NetDrive account
            </Typography>
            <Typography variant="body2">
              Unlock advanced features and monitor your stats easily
            </Typography>
          </Box>

          {/* Image with Border Radius */}
          <Box
            component="img"
            src={statisticsIcon}
            alt="Statistics"
            sx={{
              width: "100%",
              height: "auto",
              borderRadius: "10px",
              zIndex: 1,
              mb: 1,
            }}
          />
        </Box>
      </Paper>

      {/* Errors shown via centralized snackbar */}
    </Box>
  );
};

export default Login;