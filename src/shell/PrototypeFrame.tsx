import { Box, CircularProgress } from '@mui/material';
import { Suspense } from 'react';
import type { PrototypeEntry } from '~/projects/types';
import { PrototypeErrorBoundary } from './ErrorBoundary';

export function PrototypeFrame({ entry }: { entry: PrototypeEntry }) {
  const Component = entry.component;
  return (
    <PrototypeErrorBoundary>
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        }>
        <Component />
      </Suspense>
    </PrototypeErrorBoundary>
  );
}
