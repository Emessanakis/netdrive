// Terms.tsx
import React from 'react';
import { Container, Typography, Link, Paper, List, ListItem, ListItemText } from '@mui/material';

const Terms: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Terms of Service
        </Typography>

        <Typography variant="body1" paragraph>
          Welcome to NetDrive! By using our application, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
        </Typography>

        <List sx={{ listStyleType: 'decimal', pl: 4 }}>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <Typography>
                  <strong>Acceptance of Terms:</strong> By accessing or using NetDrive, you agree to these Terms of Service.
                </Typography>
              }
            />
          </ListItem>

          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <Typography>
                  <strong>Use of Service:</strong> You agree to use NetDrive only for lawful purposes and not to engage in any activity that may harm the service or other users.
                </Typography>
              }
            />
          </ListItem>

          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <Typography>
                  <strong>Privacy:</strong> Your use of NetDrive is subject to our{' '}
                  <Link href="https://emessanakis.gr/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </Link>
                  .
                </Typography>
              }
            />
          </ListItem>

          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <Typography>
                  <strong>Account Responsibility:</strong> You are responsible for maintaining the security of your account and any activity under it.
                </Typography>
              }
            />
          </ListItem>

          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <Typography>
                  <strong>Modification of Terms:</strong> We may update these terms from time to time. Continued use of NetDrive constitutes acceptance of the updated terms.
                </Typography>
              }
            />
          </ListItem>
        </List>

        <Typography variant="body1" paragraph>
          For the full version of our terms, please visit{' '}
          <Link href="https://emessanakis.gr/terms" target="_blank" rel="noopener noreferrer">
            our website
          </Link>
          .
        </Typography>
      </Paper>
    </Container>
  );
};

export default Terms;
