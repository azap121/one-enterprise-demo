/**
 * HaloChip
 *
 * Halo-spec wrapper around MUI Chip.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Chip> (node 11033:144919)
 * Halo theme overrides (canonical) live in `theme.ts → components.MuiChip`:
 *   - radius 100 (pill), filled bg moondust[100] (#F7F6F2), outlined border alpha(moondust[900], 0.5)
 *   - label 12px, weight 300 (theme font: Figtree Light)
 *   - dark mode boost on outlined (moondust[100] text + border)
 *
 * This wrapper layers only what's not theme-able:
 *   - Default deleteIcon = FA Pro Light xmark (Halo icon system)
 *   - Slot inset tweaks for FA glyph alignment
 *
 * Usage:
 *   <HaloChip label="Active" />
 *   <HaloChip label="Buyer" variant="outlined" />
 *   <HaloChip label="Error" color="error" />
 *   <HaloChip label="Removable" onDelete={() => {}} />
 *   <HaloChip label="With icon" icon={<FontAwesomeIcon icon={faUser} />} />
 */
import { faXmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, type ChipProps } from '@mui/material';

export type HaloChipProps = ChipProps;

export function HaloChip({ sx, deleteIcon, ...props }: HaloChipProps) {
  return (
    <Chip
      deleteIcon={deleteIcon ?? <FontAwesomeIcon icon={faXmark} size="xs" />}
      sx={[
        {
          // Inset rule (Halo):
          // - No icon: 12px each side (label px: 1.5).
          // - Edge→icon = 8, edge→delete = 8 (icon margins).
          // - Icon→label gap = 4 (Halo).
          // - Label→delete gap = 8.
          // - Left edge stays 12 when only the delete icon is present.
          '& .MuiChip-label': { px: 1.5 },
          '& .MuiChip-icon': { fontSize: 12, ml: '8px', mr: 0 },
          '& .MuiChip-deleteIcon': {
            fontSize: 12,
            color: 'text.secondary',
            ml: 0,
            mr: '8px',
            '&:hover': { color: 'text.primary' },
          },
          // Delete present → right gap 8 (left edge keeps default 12)
          '&:has(.MuiChip-deleteIcon) .MuiChip-label': { paddingRight: '8px' },
          // Start icon present → left gap 4, right edge 8
          // Second so paddingRight stays 8 when both icon and delete exist
          '&:has(.MuiChip-icon) .MuiChip-label': { paddingLeft: '4px', paddingRight: '8px' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
