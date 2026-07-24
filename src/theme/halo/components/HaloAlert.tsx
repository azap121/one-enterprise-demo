/**
 * HaloAlert / HaloAlertTitle
 *
 * Extends MUI Alert with a 5th "tip" severity, a severity-matched action chip,
 * and a HaloIconButton close button — matching the Figma <HALO_Alert> spec
 * (⭐️ [HALO] Design System, node 6595:48211).
 *
 * Icons are always shown — Figma has no icon-less alert variant.
 *
 * Figma severities:
 *   error   — bg ruby[50]      #feeef1, border rgba(233,65,96,0.5),  text ruby[700]      #c02641
 *   warning — bg amber[50]     #fff4ea, border rgba(239,96,26,0.5),  text amber[700]     #b34814
 *   info    — bg tanzanite[50] #eff1f8, border rgba(47,78,127,0.5),  text tanzanite[600] #2f3f7f
 *   success — bg jade[50]      #f1f5ed, border rgba(61,87,37,0.5),   text jade[700]      #3d5725
 *   tip     — bg moondust[100] #f7f6f2, border rgba(25,25,25,0.5),   text moondust[800]  #323232
 *
 * Usage:
 *   <HaloAlert severity="info">Informational message.</HaloAlert>
 *
 *   <HaloAlert severity="error" onClose={() => setOpen(false)}>
 *     Upload failed — HaloIconButton ✕ on the right.
 *   </HaloAlert>
 *
 *   <HaloAlert severity="warning" actionLabel="Retry" onActionClick={handleRetry}>
 *     Session expiring — filled chip in warning color on the right.
 *   </HaloAlert>
 *
 *   <HaloAlert severity="success" actionLabel="View" onActionClick={…} onClose={() => setOpen(false)}>
 *     Both chip and close button together.
 *   </HaloAlert>
 */
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faLightbulb,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, AlertTitle, Chip, IconButton, type AlertProps, type ChipProps } from '@mui/material';
import type { ReactNode } from 'react';
export { AlertTitle as HaloAlertTitle };
export type { AlertTitleProps } from '@mui/material';

export type HaloAlertSeverity = AlertProps['severity'] | 'tip';

export interface HaloAlertProps extends Omit<AlertProps, 'severity' | 'icon'> {
  severity?: HaloAlertSeverity;
  /** Label for an optional filled action chip, rendered in the severity color. */
  actionLabel?: string;
  /** Click handler for the action chip. */
  onActionClick?: () => void;
}

const defaultIcons: Record<NonNullable<HaloAlertSeverity>, ReactNode> = {
  error:   <FontAwesomeIcon icon={faCircleExclamation} style={{ fontSize: 16 }} />,
  warning: <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 16 }} />,
  info:    <FontAwesomeIcon icon={faCircleInfo} style={{ fontSize: 16 }} />,
  success: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
  tip:     <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: 16 }} />,
};

// Maps HaloAlertSeverity → MUI Chip color prop.
// "tip" uses secondary (moondust[600] = #6A6A69) per Figma secondary/main token.
const chipColorMap: Record<NonNullable<HaloAlertSeverity>, ChipProps['color']> = {
  error:   'error',
  warning: 'warning',
  info:    'info',
  success: 'success',
  tip:     'secondary',
};

export function HaloAlert({
  severity = 'info',
  children,
  sx,
  onClose,
  action,
  actionLabel,
  onActionClick,
  ...props
}: HaloAlertProps) {
  const resolvedIcon = defaultIcons[severity];

  // Severity-matched filled chip (Figma action container — chip goes before close button).
  const actionChip = actionLabel ? (
    <Chip
      label={actionLabel}
      size="small"
      variant="filled"
      color={chipColorMap[severity]}
      onClick={onActionClick}
      sx={{ cursor: onActionClick ? 'pointer' : 'default' }}
    />
  ) : null;

  // HaloIconButton close — never passed as onClose to MUI Alert (that renders MUI's own icon).
  const closeButton = onClose ? (
    <IconButton
      size="medium"
      aria-label="close"
      onClick={(e) => onClose(e)}
      sx={{ color: 'inherit' }}
    >
      <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
    </IconButton>
  ) : null;

  // Order: arbitrary action → chip → close (matches Figma action container layout).
  const resolvedAction = action != null || actionChip || closeButton
    ? <>{action}{actionChip}{closeButton}</>
    : undefined;

  if (severity !== 'tip') {
    return (
      <Alert severity={severity} icon={resolvedIcon} action={resolvedAction} sx={sx} {...props}>
        {children}
      </Alert>
    );
  }

  // "tip" severity — not in MUI, built as a styled wrapper
  return (
    <Alert
      icon={resolvedIcon}
      action={resolvedAction}
      sx={{
        bgcolor: '#f7f6f2', // NEW/alert/message/background = moondust[100]
        border: '1px solid rgba(25,25,25,0.5)', // primary/_states/outlinedBorder
        color: 'text.primary',
        '& .MuiAlert-icon': { color: 'text.primary' },
        '& .MuiAlertTitle-root': { color: 'text.primary' },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Alert>
  );
}
