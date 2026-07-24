/**
 * HaloEmptyState
 *
 * Zero-state container. White card, centered content, large icon,
 * title, body, primary + secondary CTAs, and an optional caption link.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_EmptyState> (node 25828:106747)
 * Tokens from get_variable_defs + get_design_context, node 25828:106805, April 2026:
 *   container bg:       #ffffff  (paper/default)
 *   container radius:   16px     (borderRadiusL)
 *   container padding:  24px / 32px
 *   icon color:         #4e4e4d  (action/active)
 *   title:              20px, weight 500, #323232 (typography/h6)
 *   body:               16px, weight 400, #323232 (typography/body1)
 *   caption:            12px, weight 400, #6a6a69 (typography/caption, text/secondary)
 *   primary btn bg:     #4e4e4d  (primary/main)
 *   secondary btn border: rgba(106,106,105,0.3) (secondary/_states/outlinedBorder)
 *
 * Usage:
 *   <HaloEmptyState
 *     title="No documents yet"
 *     body="Upload your due diligence files to get started."
 *     primaryAction={{ label: 'Browse to upload', onClick: handleUpload }}
 *     secondaryAction={{ label: 'Import folder structure', onClick: handleImport }}
 *     caption={{ text: 'Need help uploading?', linkLabel: 'How to upload', href: '/help' }}
 *   />
 *
 *   // Custom icon:
 *   <HaloEmptyState
 *     icon={<FontAwesomeIcon icon={faFolderOpen} />}
 *     title="No folders yet"
 *   />
 */
import { faCloudArrowUp } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Link, Stack, Typography, type SxProps } from '@mui/material';
import React from 'react';

export interface HaloEmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface HaloEmptyStateCaption {
  text: string;
  linkLabel?: string;
  href?: string;
  onLinkClick?: () => void;
}

export interface HaloEmptyStateProps {
  /** Icon element — defaults to cloud-arrow-up (FA Pro Light) */
  icon?: React.ReactNode;
  title: string;
  /** Supporting body copy — string or JSX */
  body?: React.ReactNode;
  /** Rendered as filled/contained button, on the right */
  primaryAction?: HaloEmptyStateAction;
  /** Rendered as outlined button, on the left */
  secondaryAction?: HaloEmptyStateAction;
  /** Small helper text below buttons, with optional inline link */
  caption?: HaloEmptyStateCaption;
  sx?: SxProps;
}

export function HaloEmptyState({
  icon,
  title,
  body,
  primaryAction,
  secondaryAction,
  caption,
  sx,
}: HaloEmptyStateProps) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '16px',
        width: 448,
        px: 3,
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        ...sx,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 80,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'action.active',
          fontSize: 56,
          flexShrink: 0,
        }}
      >
        {icon ?? <FontAwesomeIcon icon={faCloudArrowUp} style={{ width: 80, height: 64 }} />}
      </Box>

      {/* Title */}
      <Typography
        sx={{
          fontFamily: 'Figtree, system-ui, sans-serif',
          fontSize: '1.25rem',
          fontWeight: 500,
          lineHeight: 1.6,
          letterSpacing: '0.15px',
          color: 'text.primary',
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        {title}
      </Typography>

      {/* Body */}
      {body && (
        <Typography
          sx={{
            fontFamily: 'Figtree, system-ui, sans-serif',
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0.15px',
            color: 'text.primary',
            textAlign: 'center',
            maxWidth: 400,
            width: '100%',
          }}
        >
          {body}
        </Typography>
      )}

      {/* CTAs — secondary (outlined) left, primary (filled) right */}
      {(primaryAction || secondaryAction) && (
        <Stack
          direction="row"
          sx={{ gap: 2, justifyContent: 'center', maxWidth: 400, width: '100%', py: 1 }}
        >
          {secondaryAction && (
            <Button
              variant="outlined"
              onClick={secondaryAction.onClick}
              {...(secondaryAction.href ? { component: 'a', href: secondaryAction.href } : {})}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant="contained"
              onClick={primaryAction.onClick}
              {...(primaryAction.href ? { component: 'a', href: primaryAction.href } : {})}
            >
              {primaryAction.label}
            </Button>
          )}
        </Stack>
      )}

      {/* Caption */}
      {caption && (
        <Typography
          sx={{
            fontFamily: 'Figtree, system-ui, sans-serif',
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.66,
            letterSpacing: '0.4px',
            color: 'text.secondary',
            textAlign: 'center',
            maxWidth: 400,
            width: '100%',
          }}
        >
          {caption.text}{' '}
          {caption.linkLabel && (
            <Link
              href={caption.href ?? '#'}
              onClick={caption.onLinkClick}
              underline="always"
              sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}
            >
              {caption.linkLabel}
            </Link>
          )}
        </Typography>
      )}
    </Box>
  );
}
