import { Alert, Box, Button } from '@mui/material';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class PrototypeErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Prototype error:', error, info);
  }

  override render() {
    if (this.state.error) {
      return (
        <Box sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load prototype: {this.state.error.message}
          </Alert>
          <Button component={Link} to="/" variant="outlined">
            ← Back to gallery
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
