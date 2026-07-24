/**
 * HaloSlider
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Slider> (node 6562:39045)
 *
 * Tokens:
 *   rail:         NEW/surfaceNeutral → #dbdad7 (4px h, borderRadius 100px)
 *   track:        primary/main → #4e4e4d (enabled); primary/dark → #191919 (hover)
 *   thumb:        16×16px, borderRadius 100px
 *     enabled:    primary/main fill, no border
 *     hover:      common/white_states/main (#fff) fill
 *     focused:    primary/main fill + 2px solid primary/_states/outlinedBorder (rgba(25,25,25,0.5))
 *     disabled:   action/disabled (rgba(78,78,77,0.38))
 *   tooltip:      _components/tooltip/fill (#191919e5), borderRadiusS (4px), pad 3px 8px
 *                 font: Figtree Regular 12px white, lineHeight 14px
 *   label:        input/label — Figtree Regular 12px, text/secondary, pb 4px
 *   limit labels: typography/body2 — 14px regular, text/primary; disabled: text/disabled
 *
 * Variants (per Figma): Continuous (single value) and Range
 */
import { useState } from 'react';
import { Box, Slider, type SliderProps, Typography } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

// Figma tokens
const RAIL_COLOR = '#dbdad7';                      // NEW/surfaceNeutral
const TRACK_COLOR = '#4e4e4d';                     // primary/main
const TRACK_HOVER = '#191919';                     // primary/dark
const THUMB_HOVER_FILL = '#ffffff';                // common/white_states/main
const THUMB_FOCUS_BORDER = 'rgba(25,25,25,0.5)';  // primary/_states/outlinedBorder
const THUMB_DISABLED = 'rgba(78,78,77,0.38)';     // action/disabled
const TOOLTIP_BG = 'rgba(25,25,25,0.90)';         // _components/tooltip/fill

export interface HaloSliderProps extends Omit<SliderProps, 'onChange' | 'valueLabelDisplay'> {
  label?: string;
  /** Show min/max value labels below the slider (matches Figma "Values" row) */
  showLimits?: boolean;
  onChange?: (value: number | number[]) => void;
}

function pct(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}

export function HaloSlider({
  label,
  showLimits = false,
  onChange,
  min = 0,
  max = 100,
  disabled,
  value: valueProp,
  defaultValue,
  sx,
  ...props
}: HaloSliderProps) {
  const isRange = Array.isArray(valueProp) || Array.isArray(defaultValue);

  // Internal display value for the custom tooltip badge
  const initialValue = valueProp ?? defaultValue ?? (isRange ? [min, max] : min);
  const [displayValue, setDisplayValue] = useState<number | number[]>(initialValue);
  const [showTooltip, setShowTooltip] = useState(false);

  // Keep displayValue in sync when controlled value changes externally
  const controlledValue = valueProp !== undefined ? valueProp : undefined;

  const currentValue = controlledValue ?? displayValue;

  // Hoist width/flex layout props to the outer container so showLimits
  // row always matches the slider width (not the full parent width).
  const { width = '100%', minWidth, maxWidth, flex, ...sliderSx } = (sx ?? {}) as Record<string, SxProps<Theme>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const boxSx = { width, minWidth, maxWidth, flex } as any as SxProps<Theme>;

  const handleChange = (_: Event, value: number | number[]) => {
    setDisplayValue(value);
    onChange?.(value);
  };

  // Render tooltip badge(s) at correct horizontal position(s)
  const renderBadges = () => {
    if (!showTooltip || disabled) return null;
    const values = Array.isArray(currentValue) ? currentValue : [currentValue];
    return values.map((v, i) => {
      const left = pct(v, min, max);
      return (
        <Typography
          key={i}
          variant="caption"
          sx={{
            position: 'absolute',
            left: `${left}%`,
            transform: 'translateX(-50%)',
            backgroundColor: TOOLTIP_BG,
            color: '#ffffff',
            borderRadius: '4px',
            padding: '3px 8px',
            fontFamily: 'Figtree, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '0.75rem',
            lineHeight: '14px',
            letterSpacing: '0.15px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {v}
        </Typography>
      );
    });
  };

  return (
    <Box sx={boxSx}>
      {label && (
        <Typography
          variant="caption"
          sx={{ display: 'block', color: 'text.secondary', mb: '4px' }}
        >
          {label}
        </Typography>
      )}

      <Slider
        min={min}
        max={max}
        disabled={disabled}
        value={controlledValue}
        defaultValue={controlledValue === undefined ? (defaultValue ?? initialValue) : undefined}
        onChange={handleChange}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        valueLabelDisplay="off"
        sx={{
          // ── track + rail ─────────────────────────────────
          color: TRACK_COLOR,
          padding: '13px 0',
          '& .MuiSlider-rail': {
            backgroundColor: RAIL_COLOR,
            opacity: 1,
            height: 4,
            borderRadius: '100px',
          },
          '& .MuiSlider-track': {
            height: 4,
            borderRadius: '100px',
            border: 'none',
          },
          // ── thumb (outlined ring style per Figma _HALO_SliderThumb) ──
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
            backgroundColor: THUMB_HOVER_FILL,      // white fill always (enabled/hover/focused)
            border: `2px solid ${TRACK_COLOR}`,      // primary/main ring — enabled
            boxShadow: 'none',
            '&::before': { display: 'none' },
            '&:hover': {
              backgroundColor: THUMB_HOVER_FILL,
              border: `2px solid ${TRACK_HOVER}`,    // primary/dark ring — hover
              boxShadow: 'none',
            },
            '&.Mui-focusVisible': {
              backgroundColor: THUMB_HOVER_FILL,
              border: `2px solid ${THUMB_FOCUS_BORDER}`, // rgba(25,25,25,0.5) — focused
              boxShadow: 'none',
            },
            '&.Mui-active': {
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              backgroundColor: THUMB_HOVER_FILL,            // common/white_states/main
              border: `2px solid ${THUMB_DISABLED}`,         // action/disabled ring
            },
          },
          // ── hover: also darken the track ────────────────
          '&:hover .MuiSlider-track': {
            backgroundColor: TRACK_HOVER,
            borderColor: TRACK_HOVER,
          },
          // ── disabled ────────────────────────────────────
          '&.Mui-disabled': {
            color: THUMB_DISABLED,
            '& .MuiSlider-track': {
              backgroundColor: THUMB_DISABLED,
              borderColor: THUMB_DISABLED,
            },
          },
          ...sliderSx,
        }}
        {...props}
      />

      {showLimits && (
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', mt: '-8px' }}>
          {renderBadges()}
          <Typography
            variant="body2"
            sx={{ color: disabled ? alpha(TRACK_COLOR, 0.38) : 'text.primary' }}
          >
            {min}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: disabled ? alpha(TRACK_COLOR, 0.38) : 'text.primary' }}
          >
            {max}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
