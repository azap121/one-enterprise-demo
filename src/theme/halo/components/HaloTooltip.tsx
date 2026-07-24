/**
 * HaloTooltip
 *
 * Full Halo-spec wrapper around MUI Tooltip.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Tooltip> (node 24467:14704)
 * Tokens:
 *   background:    _components/tooltip/fill → #191919e5 (rgba(25,25,25,0.90))
 *   text:          common/white_states/main → #ffffff
 *   font:          tooltip/label — Figtree Regular 12px, lh 14px, ls 0.15px
 *   medium:        p 8px, borderRadius 8px (borderRadiusM)
 *   small:         px 8px py 3px, borderRadius 4px (borderRadiusS)
 *   max-width:     320px
 *
 * Usage:
 *   <HaloTooltip title="Export as PDF">
 *     <IconButton>…</IconButton>
 *   </HaloTooltip>
 *
 *   // Small (compact):
 *   <HaloTooltip title="Remove" size="small">
 *     <IconButton>…</IconButton>
 *   </HaloTooltip>
 *
 *   // With arrow:
 *   <HaloTooltip title="More details" arrow>
 *     <span>hover me</span>
 *   </HaloTooltip>
 */
import { Tooltip, type TooltipProps } from '@mui/material';

// Figma tokens
const FILL = '#191919e5';               // _components/tooltip/fill (rgba(25,25,25,0.90))
const TEXT = '#ffffff';                 // common/white_states/main
const RADIUS_M = '8px';                 // borderRadiusM
const RADIUS_S = '4px';                 // borderRadiusS

export interface HaloTooltipProps extends TooltipProps {
  size?: 'small' | 'medium';
}

export function HaloTooltip({ size = 'medium', componentsProps, slotProps, ...props }: HaloTooltipProps) {
  const isSmall = size === 'small';
  const padding = isSmall ? '3px 8px' : '8px';
  const borderRadius = isSmall ? RADIUS_S : RADIUS_M;

  return (
    <Tooltip
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: FILL,
            borderRadius,
            maxWidth: 320,
            fontFamily: 'Figtree, system-ui, sans-serif',
            fontWeight: 400,          // fontWeightRegular
            fontSize: '0.75rem',      // _fontSize/0,75rem — 12px
            lineHeight: '14px',
            letterSpacing: '0.15px',  // tooltip/label spec
            color: TEXT,
            padding,
            margin: '0 !important',   // let Popper offset control distance exclusively
          },
        },
        arrow: {
          sx: { color: FILL },
        },
        ...componentsProps,
      }}
      slotProps={{
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
        },
        ...slotProps,
      }}
      {...props}
    />
  );
}
