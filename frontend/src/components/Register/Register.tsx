import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Link, 
  Divider 
} from '@mui/material';
import googleImg from "../../assets/google.png";

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleLoginClick = () => {
    console.log('Navigate to login page');
  };

  const handleGoogleRegister = () => {
    console.log('Register with Google');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2,
      }}
    >
      <Paper elevation={6} sx={{ padding: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Create an Account
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Username"
            type="text"
            variant="standard"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete='true'
            required
            />

          <TextField
            label="Password"
            type="password"
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <TextField
            label="Confirm Password"
            type="password"
            variant="standard"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

        <FormControlLabel
            control={
            <Checkbox
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                color="primary"
            />
            }
            label={
            <span>
                I agree to the{' '}
                <Link
                component="button"
                variant="body2"
                onClick={() =>
                    window.open(
                    '/terms',
                    'Terms and Conditions',
                    'width=600,height=600,scrollbars=yes'
                    )
                }
                underline="hover"
                >
                Terms and Conditions
                </Link>
            </span>
            }
        />


          <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>
            Register
          </Button>

            <Divider
              sx={{
                color: "grey",
                display: "flex",
                alignItems: "center",
                margin: "0px 20px;"
              }}
            >
              or
            </Divider>

          <Button
            variant="outlined"
            fullWidth
            sx={{
              mb: 1,
              textTransform: 'none',
              backgroundColor: '#fff',
              color: '#555',
              borderColor: '#ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
            onClick={handleGoogleRegister}
          >
            <Box
              component="img"
              src={googleImg}
              alt="Google"
              sx={{ width: 20, height: 20 }}
            />
            Continue with Google
          </Button>

          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={handleLoginClick}
              underline="hover"
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
