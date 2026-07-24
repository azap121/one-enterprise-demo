/**
 * HaloSnackbar
 *
 * Datasite toast notification. Always dark (#323232) with white text — not
 * severity-colored. Use HaloAlert for inline feedback, HaloSnackbar for
 * transient floating notifications.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Snackbar> (node 6586:47085)
 * Tokens from get_variable_defs + get_design_context, node 11045:147197, April 2026:
 *   fill:               #323232  (_components/snackbar/fill)
 *   border:             #a3a2a0  (secondary/light)
 *   action chip bg:     #dbdad7  (NEW/chip/defaultBackground)
 *   action chip text:   #323232  (text/primary)
 *
 * Usage:
 *   <HaloSnackbar
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     message="Invite sent to 3 people"
 *   />
 *
 *   // With action and custom icon:
 *   <HaloSnackbar
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     message="Upload failed — file too large"
 *     action="Retry"
 *     icon={<FontAwesomeIcon icon={faCircleXmark} />}
 *   />
 */
import { faCircleCheck, faXmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, IconButton, Snackbar, type SnackbarProps } from '@mui/material';
import React from 'react';

export interface HaloSnackbarProps extends Omit<SnackbarProps, 'children' | 'onClose'> {
  message: React.ReactNode;
  onClose: () => void;
  /** Optional action label — renders as a gray pill chip */
  action?: React.ReactNode;
  /** Optional icon — defaults to circle-check (FA Pro Light) */
  icon?: React.ReactNode;
}

export function HaloSnackbar({ open, onClose, message, action, icon, ...rest }: HaloSnackbarProps) {
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    onClose();
  };

  return (
    <Snackbar open={open} onClose={handleClose} {...rest}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          bgcolor: '#323232',
          border: '1px solid #a3a2a0',
          borderRadius: '8px',
          minWidth: 420,
          maxWidth: 600,
          minHeight: 42,
          px: 2,
          py: 1,
        }}
      >
        {/* Icon + message */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minHeight: 40,
              py: 1,
              pr: 1,
              color: 'white',
              flexShrink: 0,
              fontSize: 16,
            }}
          >
            {icon ?? <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16, width: 20 }} />}
          </Box>
          <Box
            sx={{
              flex: 1,
              py: 1,
              pr: 1,
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 400,
              lineHeight: 1.43,
              letterSpacing: '0.17px',
              fontFamily: 'Figtree, system-ui, sans-serif',
              overflow: 'hidden',
            }}
          >
            {message}
          </Box>
        </Box>

        {/* Action chip + close */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', pl: 2, py: 1, flexShrink: 0 }}>
          {action && (
            <Chip
              label={action}
              size="small"
              sx={{
                bgcolor: '#dbdad7',
                color: '#323232',
                borderRadius: '100px',
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 400,
                letterSpacing: '0.16px',
                '& .MuiChip-label': { px: '6px' },
              }}
            />
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              p: '2px',
              width: 24,
              height: 24,
              borderRadius: '4px',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Box>
    </Snackbar>
  );
}
