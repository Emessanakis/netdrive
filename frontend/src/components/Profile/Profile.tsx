import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, Logout as LogoutIcon } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface ProfileProps {
  onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleToggleNewPassword = () => setShowNewPassword(!showNewPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // -------------------------------------------------------------------
  // UPDATED: Added requirement for at least one number in the regex
  // -------------------------------------------------------------------
  const validatePassword = (password: string) => {
    // Regex:
    // ^                 Start of string
    // (?=.*[A-Z])       Must contain at least one uppercase letter (A-Z)
    // (?=.*[0-9])       Must contain at least one number (0-9)  <-- NEW REQUIREMENT
    // (?=.*[!@#$%^&*()...]) Must contain at least one symbol
    // .{12,}            Must be at least 12 characters long
    // $                 End of string
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]).{12,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async () => {
    setMessage(null);

    if (!validatePassword(newPassword)) {
      // -------------------------------------------------------------------
      // UPDATED: Error message to reflect the new requirement
      // -------------------------------------------------------------------
      setMessage({
        type: "error",
        text: "Password must be at least 12 characters, include one uppercase letter, one number, and one symbol.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (!user?.id || !user?.email) {
      setMessage({ type: "error", text: "User information is missing. Please log in again." });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            newPassword,
          }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Failed to update password." });
        return;
      }

      setMessage({ type: "success", text: data.message || "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "An error occurred while updating password." });
    }
  };

  const handleLogout = async () => {
    await logout();
    try { onClose(); } catch {}
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar
          src={user?.picture || ""}
          alt={user?.username}
          sx={{ width: 80, height: 80 }}
        />
        <Typography variant="h5" fontWeight={600}>
          {user?.name || user?.username}
        </Typography>
      </Box>

      <TextField label="Username" value={user?.username || ""} fullWidth disabled />
      <TextField label="Email" value={user?.email || ""} fullWidth disabled />

      <Typography variant="h6" fontWeight={500}>
        Change Password
      </Typography>

      <TextField
        label="New Password"
        type={showNewPassword ? "text" : "password"}
        value={newPassword}
        autoComplete="false"
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        // -------------------------------------------------------------------
        // UPDATED: Helper text to reflect the new requirement
        // -------------------------------------------------------------------
        helperText="Password must be at least 12 characters, include one uppercase letter, one number, and one symbol."
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleToggleNewPassword}>
                {showNewPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        value={confirmPassword}
        autoComplete="false"
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleToggleConfirmPassword}>
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        variant="contained"
        sx={{
          background: "linear-gradient(90deg, #3185ff, #5540ec)",
          color: (!newPassword || !confirmPassword) ? "lightgrey" : "whitesmoke",
          fontWeight: 600,
        }}
        onClick={handleChangePassword}
        disabled={!newPassword || !confirmPassword}
      >
        Update Password
      </Button>

      {/* Success/Error message below button */}
      {message && (
        <Alert severity={message.type}>
          {message.text}
        </Alert>
      )}

      <Button
        variant="outlined"
        startIcon={<LogoutIcon />}
        color="error"
        sx={{ mt: 1 }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Profile;