/**
 * HaloBackdrop
 *
 * Full Halo-spec wrapper around MUI Backdrop.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Backdrop> (node 11477:167022)
 * Tokens:
 *   background: rgba(31,34,39,0.5) scrim
 *
 * Usage:
 *   <HaloBackdrop open={open} onClick={() => setOpen(false)} />
 *
 *   // With loading indicator:
 *   <HaloBackdrop open={loading}>
 *     <CircularProgress color="inherit" />
 *   </HaloBackdrop>
 */
import { Backdrop, type BackdropProps } from '@mui/material';

export function HaloBackdrop({ sx, ...props }: BackdropProps) {
  return (
    <Backdrop
      sx={{
        backgroundColor: 'rgba(31,34,39,0.5)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        ...sx,
      }}
      {...props}
    />
  );
}

export type HaloBackdropProps = BackdropProps;
