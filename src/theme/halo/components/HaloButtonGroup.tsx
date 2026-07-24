/**
 * HaloButtonGroup — re-export of MUI ButtonGroup.
 *
 * All styling lives in `theme.ts → components.MuiButtonGroup`:
 *   • borderRadius 8 (matches single Button)
 *   • 1px gap between grouped buttons
 *   • disableElevation + disableRipple defaults
 *
 * Per-button color, variant, and size flow through to the inner Buttons —
 * use the same `HaloButton` API.
 *
 * Usage:
 *   <HaloButtonGroup variant="outlined">
 *     <HaloButton>Left</HaloButton>
 *     <HaloButton>Center</HaloButton>
 *     <HaloButton>Right</HaloButton>
 *   </HaloButtonGroup>
 */
export {
  ButtonGroup as HaloButtonGroup,
  type ButtonGroupProps as HaloButtonGroupProps,
} from '@mui/material';
