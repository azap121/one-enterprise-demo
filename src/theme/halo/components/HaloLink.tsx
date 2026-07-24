/**
 * HaloLink
 *
 * Full Halo-spec wrapper around MUI Link.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Link> (node 6574:50682)
 * Tokens (get_variable_defs, node 6574:50682):
 *   typography:  fontFamily, fontWeightRegular=400, 16px, lh 1.5, ls 0.15px (typography/body1)
 *   color:       text/primary (#323232) — default; override via color prop
 *   underline:   'hover' (On hover) default; 'always' (Always) variant
 *   focus ring:  outline 2px solid rgba(25,25,19,0.5), borderRadius 4px (borderRadiusS)
 *
 * Figma variants: underline = Always | On hover  ×  state = Enabled | Hovered | Focused
 *
 * Usage:
 *   <HaloLink href="/projects">All projects</HaloLink>
 *   <HaloLink href="/help" underline="always">Learn more</HaloLink>
 *   <HaloLink component="button" onClick={handler}>View details</HaloLink>
 */
import { Link, type LinkProps, alpha } from '@mui/material';

export function HaloLink({ underline = 'hover', color = 'text.primary' as LinkProps['color'], sx, ...props }: LinkProps) {
  return (
    <Link
      underline={underline}
      color={color}
      sx={[
        (theme) => ({
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightRegular ?? 400,
          fontSize: '1rem',
          lineHeight: 1.5,
          letterSpacing: '0.15px',
          cursor: 'pointer',
          '&:focus-visible': {
            outline: `2px solid ${alpha(theme.palette.primary.dark, 0.5)}`,
            outlineOffset: 2,
            borderRadius: '4px', // borderRadiusS
          },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );
}

export type HaloLinkProps = LinkProps;
