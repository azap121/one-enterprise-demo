import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface DatasitePageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function DatasitePageHeader({ title, description, actions }: DatasitePageHeaderProps) {
  return (
    <Box
      sx={{
        px: 4,
        py: 3,
        borderBottom: '1px solid',
        borderColor: 'background.defaultAlt',
        bgcolor: 'background.paper',
      }}>
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: description ? 0.5 : 0 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1} alignItems="center">
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
