/**
 * HaloAvatar
 *
 * Full Halo-spec wrapper around MUI Avatar.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Avatar> (node 6587:47387)
 * Tokens (get_variable_defs, node 6587:47387, May 2026):
 *   sizes:             xs=24px, sm=36px (default), md=48px
 *   initials font:     Figtree Regular — avatar/initialsSm/Md/Lg
 *   xs (24px):         12px, lh 10, ls 0       — avatar/initialsSm
 *   sm (36px):         18px, lh 12, ls 0       — avatar/initialsMd
 *   md (48px):         24px, lh 20, ls 0.14px  — avatar/initialsLg
 *   color/main:        #b34814  (_components/avatar/fill)
 *   color/a:           #2f3f7f  (NEW/avatar/variantA)
 *   color/b:           #872962  (NEW/avatar/variantB)
 *   color/c:           #286648  (NEW/avatar/variantC)
 *   color/d:           #6c6e1c  (NEW/avatar/variantD)
 *
 * Usage:
 *   <HaloAvatar src="/user.jpg" alt="Annie Kim" />
 *   <HaloAvatar size="xs">AK</HaloAvatar>
 *   <HaloAvatar size="md" color="a">JD</HaloAvatar>
 */
import { Avatar, type AvatarProps } from '@mui/material';

const SIZES = { xs: 24, sm: 36, md: 48 } as const;

const INITIALS_STYLE = {
  xs: { fontSize: '0.75rem', lineHeight: '10px', letterSpacing: 0 },
  sm: { fontSize: '18px',    lineHeight: '12px', letterSpacing: 0 },
  md: { fontSize: '1.5rem',  lineHeight: '20px', letterSpacing: '0.14px' },
} as const;

// _components/avatar/fill + NEW/avatar/variant* tokens
const BG_COLORS = {
  main: '#b34814',
  a:    '#2f3f7f',
  b:    '#872962',
  c:    '#286648',
  d:    '#6c6e1c',
} as const;

export interface HaloAvatarProps extends AvatarProps {
  size?: keyof typeof SIZES;
  color?: keyof typeof BG_COLORS;
}

export function HaloAvatar({ size = 'sm', color = 'main', sx, ...props }: HaloAvatarProps) {
  const { fontSize, lineHeight, letterSpacing } = INITIALS_STYLE[size];

  return (
    <Avatar
      sx={{
        width: SIZES[size],
        height: SIZES[size],
        fontSize,
        lineHeight,
        letterSpacing,
        fontFamily: 'Figtree, system-ui, sans-serif',
        fontWeight: 400,
        bgcolor: BG_COLORS[color],
        color: '#ffffff',
        ...sx,
      }}
      {...props}
    />
  );
}
