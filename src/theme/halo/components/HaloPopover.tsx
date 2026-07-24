/**
 * HaloPopover
 *
 * Halo-spec wrapper around MUI Popover.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Popover> (node 1488:24844)
 * Tokens:
 *   bg:            white (background.paper)
 *   border:        1px #E0E0E0 (divider)
 *   border-radius: 8px
 *   padding:       16px (default, override with noPadding)
 *
 * Usage:
 *   <HaloPopover
 *     anchorEl={anchor}
 *     open={Boolean(anchor)}
 *     onClose={close}
 *   >
 *     <Typography>Popover content</Typography>
 *   </HaloPopover>
 *
 *   // No built-in padding (custom layout):
 *   <HaloPopover anchorEl={anchor} open={Boolean(anchor)} onClose={close} noPadding>
 *     <HaloList items={[...]} />
 *   </HaloPopover>
 */
import { Popover, type PopoverProps } from '@mui/material';

export interface HaloPopoverProps extends PopoverProps {
  /** Remove the default 16px padding (for custom content like lists) */
  noPadding?: boolean;
}

export function HaloPopover({ noPadding, PaperProps, children, ...props }: HaloPopoverProps) {
  return (
    <Popover
      elevation={0}
      PaperProps={{
        ...PaperProps,
        sx: {
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          ...(!noPadding && { p: 2 }),
          ...PaperProps?.sx,
        },
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      {...props}
    >
      {children}
    </Popover>
  );
}
