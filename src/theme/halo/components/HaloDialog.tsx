/**
 * HaloDialog
 *
 * MUI Dialog wrapped with built-in close button. Halo theme overrides
 * (radius, paper border, padding) live in `theme.ts → MuiDialog*`.
 *
 * Visual reference: PROD MUI Library (Fo6hsjtXuJCH4XiwkhErC4) —
 *   sm: 6586:47184  · md: 11480:179010  · xl: 6586:47196
 * No HALO Design System Dialog exists; Halo inherits MUI defaults
 * with Halo tokens (Figtree, moondust, theme-aware paper).
 *
 * Variants:
 *   - default  — background.defaultAlt paper, divider border (theme-aware)
 *   - caution  — background.alertError paper (#feeef1 light / #310c13 dark),
 *                error border rgba(233,65,96,0.5). text.primary resolves correctly
 *                in both modes. Pass a Button with sx={{ bgcolor: 'error.main' }}
 *                as the primary action.
 *
 * Sizes:
 *   - sm  (default) — input forms, confirmations            → MUI maxWidth 'sm' (600)
 *   - md            — terms, longer body with inline scroll → MUI maxWidth 'md' (900)
 *   - xl            — full editor / rich layouts            → MUI maxWidth 'lg' (1200)
 *
 * Scroll: header + actions stay fixed, body scrolls when content overflows
 * (relies on MUI scroll="paper" default + flex layout — no manual maxHeight).
 *
 * Usage:
 *   <HaloDialog
 *     open={open}
 *     onClose={close}
 *     title="Deal room access expiring"
 *     actions={
 *       <>
 *         <Button variant="outlined" onClick={close}>Cancel</Button>
 *         <Button variant="contained">Confirm</Button>
 *       </>
 *     }
 *   >
 *     <Typography>Body content here.</Typography>
 *   </HaloDialog>
 *
 *   // Medium with scrolling terms:
 *   <HaloDialog size="md" title="Terms and conditions" ...>{long content}</HaloDialog>
 *
 *   // Caution / destructive:
 *   <HaloDialog variant="caution" title="Delete files permanently" ...>
 *     <Typography>Files cannot be recovered.</Typography>
 *   </HaloDialog>
 */
import { faXmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import React from 'react';

const PAPER_STYLES = {
  default: {
    bgcolor: 'background.defaultAlt',
    borderColor: 'divider',
  },
  caution: {
    // background.alertError: #feeef1 light / #310c13 dark
    bgcolor: 'background.alertError',
    borderColor: 'rgba(233,65,96,0.5)',
  },
  success: {
    // background.alertSuccess: light jade tint / dark jade tint
    bgcolor: 'background.alertSuccess',
    borderColor: 'rgba(22,163,74,0.5)',
  },
};

// Halo size → MUI maxWidth mapping
//   sm → 600  (forms, confirmations)
//   md → 900  (terms, scrolling body)
//   xl → 1200 (rich editor / xl modal)
const SIZE_TO_MAXWIDTH = {
  sm: 'sm',
  md: 'md',
  xl: 'lg',
} as const;

export interface HaloDialogProps extends Omit<DialogProps, 'title' | 'onClose' | 'maxWidth'> {
  title?: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'caution' | 'success';
  size?: 'sm' | 'md' | 'xl';
}

export function HaloDialog({
  title,
  onClose,
  actions,
  children,
  open,
  variant = 'default',
  size = 'sm',
  ...rest
}: HaloDialogProps) {
  const paper = PAPER_STYLES[variant];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={SIZE_TO_MAXWIDTH[size]}
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: paper.bgcolor,
          border: '1px solid',
          borderColor: paper.borderColor,
          borderRadius: '4px',
          ...rest.PaperProps?.sx,
        },
        ...rest.PaperProps,
      }}
      {...rest}>
      {title !== undefined && (
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
            pt: 3,
            pb: 2,
            px: 3,
          }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              fontSize: '1.25rem',
              lineHeight: 1.6,
              letterSpacing: '0.15px',
              flex: 1,
              fontFamily: 'Figtree, Helvetica, Arial, sans-serif',
              color: 'text.primary',
            }}>
            {title}
          </Typography>
          <IconButton
            aria-label="close dialog"
            onClick={onClose}
            size="small"
            sx={{
              width: 24,
              height: 24,
              flexShrink: 0,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
            }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent
        sx={{
          // background.alertError: #feeef1 light / #310c13 dark — fully theme-aware
          bgcolor: variant === 'caution' ? 'background.alertError' : variant === 'success' ? 'background.alertSuccess' : 'background.paper',
          color: 'text.primary',
          ...(variant !== 'caution' && variant !== 'success' && {
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }),
          // Header + actions pin; only this content scrolls when it overflows.
          // No manual maxHeight — MUI's scroll="paper" + flex Paper handles it.
          overflowY: 'auto',
          px: 3,
          pt: '8px !important',
          pb: 1,
        }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{
          pt: 2, pb: 3, px: 3, gap: 2,
          // Figma: outlined action button uses background/default token
          // (#ffffff light / #191919 dark) so it reads correctly on any dialog bg
          '& .MuiButton-outlined': { bgcolor: 'background.default' },
        }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
