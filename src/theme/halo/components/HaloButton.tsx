/**
 * HaloButton — re-export of MUI Button.
 *
 * All Halo styling lives in `theme.ts → components.MuiButton`:
 *   • size variants (large 42 / medium 36 / small 30)
 *   • contained / outlined / text + Error variants (palette-driven)
 *   • `ai` prop variant (Datasite-AI Neon Deep border)
 *   • Mui-loading state styling for MUI v6.4+ native `loading` prop
 *
 * The `ai` prop and dark-mode behaviour are wired via module augmentation
 * in `theme.ts`. Consumers import `HaloButton` for naming consistency with
 * the other Halo* components.
 *
 * Usage:
 *   <HaloButton variant="contained">Save</HaloButton>
 *   <HaloButton variant="outlined" color="error" startIcon={<FontAwesomeIcon icon={faTrash} />}>Delete</HaloButton>
 *   <HaloButton ai>Ask AI</HaloButton>
 *   <HaloButton loading>Saving…</HaloButton>
 */
export { Button as HaloButton, type ButtonProps as HaloButtonProps } from '@mui/material';
