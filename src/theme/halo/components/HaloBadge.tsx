/**
 * HaloBadge — re-export of MUI Badge.
 *
 * Design system supports a 2x4 matrix per Figma:
 *   (Dot | Number) × (Primary | Light | Error | Disabled)
 *
 * Map design-system color → MUI prop:
 *   • Primary  → color="primary"
 *   • Light    → color="default" (moondust[200] light / moondust[700] dark)
 *   • Error    → color="error"
 *   • Disabled → disabled (custom Halo prop, overrides bg + text colors)
 *
 * All styling lives in `theme.ts → components.MuiBadge`:
 *   • font: 12px / 20px lineHeight / 0.14px tracking (Halo spec)
 *   • standard badge: 20×20 minimum, 100% radius, padding 0 4px
 *   • dot: 8×8 with 1px background-default ring (matches container)
 *   • disabled: action.disabledBackground bg + text.disabled fg
 *
 * Usage:
 *   <HaloBadge badgeContent={4} color="primary">
 *     <FontAwesomeIcon icon={faBell} />
 *   </HaloBadge>
 *
 *   <HaloBadge badgeContent={1000} max={999} color="error">…</HaloBadge>
 *
 *   <HaloBadge variant="dot" color="primary">…</HaloBadge>
 *
 *   <HaloBadge badgeContent={3} disabled>…</HaloBadge>
 */
export {
  Badge as HaloBadge,
  type BadgeProps as HaloBadgeProps,
} from '@mui/material';
