import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <Box sx={{ p: 6, textAlign: 'center' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Prototype not found
      </Typography>
      <Button component={Link} to="/" variant="outlined">
        ← Back to gallery
      </Button>
    </Box>
  );
}
