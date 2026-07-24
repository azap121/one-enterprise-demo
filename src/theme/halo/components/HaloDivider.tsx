/**
 * HaloDivider
 *
 * Full Halo-spec wrapper around MUI Divider.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Divider> (node 6645:53005)
 * Token: _components/divider/divider (#1919191f) — resolved via palette.divider
 *   = alpha(moondust[900], 0.12). No text variants in Figma.
 *
 * Usage:
 *   <HaloDivider />
 *   <HaloDivider orientation="vertical" flexItem />
 */
import { Divider, type DividerProps } from '@mui/material';

export function HaloDivider({ sx, ...props }: DividerProps) {
  return (
    <Divider
      sx={{
        borderColor: 'divider',
        ...sx,
      }}
      {...props}
    />
  );
}

export type HaloDividerProps = DividerProps;
