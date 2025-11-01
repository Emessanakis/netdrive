// Privacy.tsx
import React from 'react';
import { Container, Typography, Link, Paper, List, ListItem, ListItemText } from '@mui/material';

const Privacy: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Privacy Policy
        </Typography>

        <Typography variant="body1" paragraph>
          Your privacy is important to us. This Privacy Policy explains how NetDrive collects, uses, and protects your personal information.
        </Typography>

        <List sx={{ listStyleType: 'decimal', pl: 4 }}>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <Typography>
                  <strong>Information Collection:</strong> We may collect personal information such as your name, email, and files you upload to our service.
                </Typography>
              }
            />
          </ListItem>

          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <Typography>
                  <strong>Use of Information:</strong> Your information is used to provide, maintain, and improve our services.
                </Typography>
              }
            />
          </ListItem>

          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <Typography>
                  <strong>Data Security:</strong> We implement appropriate measures to protect your data from unauthorized access, alteration, or disclosure.
                </Typography>
              }
            />
          </ListItem>

          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <Typography>
                  <strong>Sharing of Information:</strong> We do not sell your personal information. We may share data only as required by law or to operate the service.
                </Typography>
              }
            />
          </ListItem>

          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <Typography>
                  <strong>Changes to Privacy Policy:</strong> We may update this policy periodically. Continued use of NetDrive constitutes acceptance of the updated policy.
                </Typography>
              }
            />
          </ListItem>
        </List>

        <Typography variant="body1" paragraph>
          For more details, visit the full policy on our website:{' '}
          <Link href="https://emessanakis.gr/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy Page
          </Link>
          .
        </Typography>
      </Paper>
    </Container>
  );
};

export default Privacy;
