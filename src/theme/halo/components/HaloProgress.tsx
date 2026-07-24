/**
 * HaloProgress
 *
 * Halo-spec wrapper around MUI CircularProgress and LinearProgress.
 *
 * Figma:
 *   - Linear:   ⭐ [HALO] Design System → <HALO_Progress> | Linear   (node 16152:91311)
 *   - Circular: ⭐ [HALO] Design System → <HALO_Progress> | Circular (node 17351:108422)
 *
 * Tokens (verbatim from Figma):
 *   primary/dark               #191919             ring + bar fill
 *   primary/_states/focus      rgba(25,25,25,0.12) track
 *   text/primary               #323232             label text
 *   _components/tooltip/fill   rgba(25,25,25,0.9)  bottom-label bg
 *   borderRadiusS              4px                 bottom-label corner
 *   typography/caption         Figtree 400 12/1.66/0.4   right + circular labels
 *   tooltip/label              Figtree 400 12/14/0.15    bottom-tooltip label
 *
 * Linear variants (label prop):
 *   <HaloProgress variant="linear" />                              // indeterminate, no label
 *   <HaloProgress variant="linear" value={40} />                   // determinate
 *   <HaloProgress variant="linear" value={40} label="right" />     // bar + "40%" right
 *   <HaloProgress variant="linear" value={40} label="bottom" />    // bar + tooltip "40%" below
 *
 * Circular variants (size + label):
 *   <HaloProgress variant="circular" />                                  // 24px spinner
 *   <HaloProgress variant="circular" size="small" />                     // 16px spinner
 *   <HaloProgress variant="circular" value={75} />                       // 24px ring
 *   <HaloProgress variant="circular" size="large" value={60} />          // 48px ring, "60%" inside
 *   <HaloProgress variant="circular" label="Processing 198 files..." /> // 24px + label below
 */
import {
  Box,
  CircularProgress,
  type CircularProgressProps,
  LinearProgress,
  type LinearProgressProps,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

type CircularSize = 'small' | 'medium' | 'large' | number;

export interface HaloCircularProgressProps extends Omit<CircularProgressProps, 'size'> {
  size?: CircularSize;
  /** Free-text label. Shown below the spinner (medium) or as ${value}% inside (large determinate). */
  label?: string;
}

export type HaloLinearProgressProps = LinearProgressProps & {
  label?: 'none' | 'right' | 'bottom';
};

export interface HaloProgressProps {
  variant: 'circular' | 'linear';
  /** Circular only: 'small'=16, 'medium'=24, 'large'=48, or any px number. */
  size?: CircularSize;
  /** 0–100 for determinate; omit for indeterminate. */
  value?: number;
  /**
   * Linear: 'none' (default), 'right' (renders `${value}%` on right), 'bottom' (tooltip-style label centered below).
   * Circular: free-text label. Below the spinner for medium, centered inside the ring for large determinate.
   */
  label?: string | 'none' | 'right' | 'bottom';
  sx?: CircularProgressProps['sx'] | LinearProgressProps['sx'];
}

const sizeToPx = (size: CircularSize): number => {
  if (typeof size === 'number') return size;
  if (size === 'small') return 16;
  if (size === 'large') return 48;
  return 24;
};

// thickness tuned to match Figma ring proportions per size
const sizeToThickness = (px: number): number => (px >= 40 ? 3.5 : 4);

export function HaloProgress({ variant, size = 'medium', value, label, sx }: HaloProgressProps) {
  const theme = useTheme();
  const isDeterminate = value !== undefined;
  const progressVariant = isDeterminate ? 'determinate' : 'indeterminate';

  if (variant === 'circular') {
    const px = sizeToPx(size);
    const thickness = sizeToThickness(px);
    const isLarge = px >= 40;

    const ring = (
      <CircularProgress
        variant={progressVariant}
        value={value}
        size={px}
        thickness={thickness}
        sx={{
          color: 'primary.dark', // primary/dark
          ...(sx as CircularProgressProps['sx']),
        }}
      />
    );

    // Large determinate: render value% (or explicit label) centered inside the ring
    if (isLarge && isDeterminate) {
      const inner = label ?? `${Math.round(value as number)}%`;
      return (
        <Box sx={{ position: 'relative', display: 'inline-flex', width: px, height: px }}>
          {ring}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.primary' }}>
              {inner}
            </Typography>
          </Box>
        </Box>
      );
    }

    // Medium with text label: stack ring + label below (gap 8 = primitive `1`)
    if (label && px >= 24 && typeof label === 'string') {
      return (
        <Box
          sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {ring}
          <Typography variant="caption" sx={{ color: 'text.primary' }}>
            {label}
          </Typography>
        </Box>
      );
    }

    return ring;
  }

  // ── Linear ────────────────────────────────────────────────────────────────
  const linearLabel = (label as 'none' | 'right' | 'bottom' | undefined) ?? 'none';
  const trackColor = alpha(theme.palette.primary.dark, 0.12); // primary/_states/focus
  const labelText = isDeterminate ? `${Math.round(value as number)}%` : '';

  const bar = (
    <LinearProgress
      variant={progressVariant}
      value={value}
      sx={{
        height: 4,
        backgroundColor: trackColor,
        '& .MuiLinearProgress-bar': {
          backgroundColor: 'primary.dark', // primary/dark
        },
        flex: linearLabel === 'right' ? 1 : undefined,
        width: linearLabel === 'right' ? undefined : '100%',
        ...(sx as LinearProgressProps['sx']),
      }}
    />
  );

  if (linearLabel === 'right') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        {bar}
        <Typography variant="caption" sx={{ color: 'text.primary', whiteSpace: 'nowrap' }}>
          {labelText}
        </Typography>
      </Box>
    );
  }

  if (linearLabel === 'bottom') {
    // Tooltip-style label tracks the fill position (left: ${value}%)
    const leftPct = isDeterminate ? Math.max(0, Math.min(100, value as number)) : 50;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
        {bar}
        <Box sx={{ position: 'relative', width: '100%', height: 20 }}>
          <Box
            sx={{
              position: 'absolute',
              left: `${leftPct}%`,
              transform: 'translateX(-50%)',
              backgroundColor: alpha(theme.palette.primary.dark, 0.9), // _components/tooltip/fill
              color: 'common.white',
              borderRadius: '4px', // borderRadiusS
              px: 1, // 8
              py: '3px',
              fontFamily: theme.typography.fontFamily,
              fontSize: 12,
              lineHeight: '14px',
              letterSpacing: '0.15px',
              fontWeight: 400,
              whiteSpace: 'nowrap',
            }}
          >
            {labelText}
          </Box>
        </Box>
      </Box>
    );
  }

  return bar;
}
