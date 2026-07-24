/**
 * HaloMenu / HaloMenuItem
 *
 * Halo-spec wrappers around MUI Menu and MenuItem.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Menu> (node 11402:162587)
 *                                   <HALO_MenuItem> (node 6576:50735)
 * Tokens (get_variable_defs, nodes 11402:162587 + 6576:50735):
 *   paper bg:        paper/default (#ffffff)
 *   border:          1px solid elevation/outlined (rgba(25,25,25,0.12))
 *   border-radius:   borderRadiusM (8px)
 *   list padding:    pt 4px (--new), pb 8px (--1)
 *   item padding:    px 16px (--2), py 8px (--1)
 *   icon container:  20×16px, gap 4px (--new), pr 8px (--1) from Left Slot
 *   label:           fontFamily, fontWeightRegular=400, 14px, lh 24px, ls 0.17px (menu/itemDense)
 *   label color:     text/primary (#323232)
 *   icon color:      text.secondary (non-destructive), error.main (destructive)
 *   hover bg:        primary/_states/hover rgba(25,25,25,0.04)
 *   selected bg:     primary/_states/selected rgba(25,25,25,0.08)
 *   disabled:        text/disabled rgba(78,78,77,0.38)
 *   destructive:     error.main text + rgba(192,38,65,0.04) hover
 *
 * Usage:
 *   <HaloMenu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
 *     <HaloMenuItem icon={<FontAwesomeIcon icon={faPencil} />} onClick={handleEdit}>
 *       Edit details
 *     </HaloMenuItem>
 *     <HaloMenuItem icon={<FontAwesomeIcon icon={faShare} />} onClick={handleShare}>
 *       Share
 *     </HaloMenuItem>
 *     <HaloDivider />
 *     <HaloMenuItem icon={<FontAwesomeIcon icon={faTrash} />} destructive onClick={handleDelete}>
 *       Delete
 *     </HaloMenuItem>
 *   </HaloMenu>
 */
import {
  Box,
  Menu,
  type MenuProps,
  MenuItem,
  type MenuItemProps,
  Typography,
  alpha,
} from '@mui/material';
import React from 'react';

export function HaloMenu({ sx, PaperProps, children, ...props }: MenuProps) {
  return (
    <Menu
      elevation={0}
      PaperProps={{
        ...PaperProps,
        sx: [
          (theme) => ({
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`, // elevation/outlined
            borderRadius: '8px',                           // borderRadiusM
            minWidth: 220,
            '& .MuiList-root': {
              pt: '4px',  // --new
              pb: '8px',  // --1
            },
          }),
          ...(Array.isArray(PaperProps?.sx)
            ? PaperProps.sx
            : PaperProps?.sx
              ? [PaperProps.sx]
              : []),
        ],
      }}
      sx={sx}
      {...props}
    >
      {children}
    </Menu>
  );
}

export interface HaloMenuItemProps extends MenuItemProps {
  /** Left icon before the label */
  icon?: React.ReactNode;
  /** Red text + icon for destructive actions */
  destructive?: boolean;
}

export function HaloMenuItem({ icon, destructive, children, sx, ...props }: HaloMenuItemProps) {
  return (
    <MenuItem
      sx={[
        (theme) => ({
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightRegular ?? 400,
          fontSize: '0.875rem',
          lineHeight: '24px',
          letterSpacing: '0.17px',
          color: destructive ? 'error.main' : 'text.primary',
          px: '16px', // --2
          py: '8px',  // --1
          gap: '8px', // Left Slot pr (--1) — gap between icon container and label
          '&:hover': {
            bgcolor: destructive
              ? alpha(theme.palette.error.main, 0.04)
              : theme.palette.action.hover,
          },
          '&.Mui-selected': { bgcolor: theme.palette.action.selected },
          '&.Mui-disabled': { color: 'text.disabled' },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    >
      {icon && (
        <Box
          sx={{
            width: 20,   // Figma icon container width
            height: 16,  // Figma icon container height
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 14,
            color: destructive ? 'error.main' : 'text.secondary',
          }}
        >
          {icon}
        </Box>
      )}
      <Typography
        component="span"
        sx={{
          fontFamily: 'inherit',
          fontWeight: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          flex: 1,
        }}
      >
        {children}
      </Typography>
    </MenuItem>
  );
}
