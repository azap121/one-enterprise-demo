/**
 * HaloIconButton — re-export of MUI IconButton.
 *
 * All styling lives in `theme.ts → components.MuiIconButton`:
 *   • size variants: small (20×20), medium (24×24), large (36×36)
 *   • color variants: default, error, primary, secondary, white
 *   • palette-token driven; light + dark schemes wired
 *
 * The `color="white"` value is added via module augmentation
 * (IconButtonPropsColorOverrides) in `theme.ts`. Use it on dark surfaces.
 *
 * Usage:
 *   <HaloIconButton size="medium" aria-label="settings">
 *     <FontAwesomeIcon icon={faGear} />
 *   </HaloIconButton>
 *   <HaloIconButton size="large" color="primary" aria-label="add">
 *     <FontAwesomeIcon icon={faPlus} />
 *   </HaloIconButton>
 *   <HaloIconButton color="white" aria-label="close">
 *     <FontAwesomeIcon icon={faXmark} />
 *   </HaloIconButton>
 */
export {
  IconButton as HaloIconButton,
  type IconButtonProps as HaloIconButtonProps,
} from '@mui/material';
