/**
 * HaloPaper
 *
 * Full Halo-spec wrapper around MUI Paper.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Paper> (node 11048:150287)
 * Tokens:
 *   background:    white (background.paper)
 *   border:        1px #E0E0E0 (divider)
 *   border-radius: 8px
 *   elevation:     0 (no box-shadow by default)
 *
 * Usage:
 *   <HaloPaper>Content</HaloPaper>
 *   <HaloPaper padding>Content with 16px padding</HaloPaper>
 *   <HaloPaper variant="alt">Uses background.default (#fafaf7)</HaloPaper>
 */
import { Paper, type PaperProps } from '@mui/material';

export interface HaloPaperProps extends PaperProps {
  /** Add 16px padding inside the paper */
  padding?: boolean;
  /** 'default' = white; 'alt' = background.default (#fafaf7) */
  background?: 'default' | 'alt';
}

export function HaloPaper({ padding, background = 'default', sx, children, ...props }: HaloPaperProps) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        backgroundColor: background === 'alt' ? 'background.default' : 'background.paper',
        borderColor: 'divider',
        borderRadius: '8px',
        ...(padding && { p: 2 }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}
