/**
 * Halo component library
 *
 * Import from here in any prototype:
 *   import { HaloButton, HaloDialog, HaloTextField } from '~/theme/halo/components';
 *
 * Each component requires haloTheme (or haloThemeDark) active in ThemeProvider.
 * Setup: wrap your prototype tree with <ThemeProvider theme={haloTheme}>.
 *
 * Date picker components (HaloDatePicker, HaloTimePicker, HaloDateRangePicker) require
 * <LocalizationProvider dateAdapter={AdapterDayjs}> wrapping the tree.
 */

// Inputs
export * from './HaloAIBadge';
export * from './HaloAutocomplete';
export * from './HaloButton';
export * from './HaloButtonGroup';
export * from './HaloIconButton';
export * from './HaloCheckbox';
export * from './HaloRadioButton';
export * from './HaloRating';
export * from './HaloSelect';
export * from './HaloSlider';
export * from './HaloSwitch';
export * from './HaloTextField';
export * from './HaloToggleButtonGroup';

// Data Display
export * from './HaloAvatar';
export * from './HaloBadge';
export * from './HaloChip';
export * from './HaloDivider';
export * from './HaloLeftDrawerTree';
export * from './HaloList';
export * from './HaloTooltip';
export * from './HaloTree';

// Feedback
export * from './HaloAlert';
export * from './HaloBackdrop';
export * from './HaloDialog';
export * from './HaloEmptyState';
export * from './HaloProgress';
export * from './HaloSkeleton';
export * from './HaloSnackbar';

// Surfaces
export * from './HaloAccordion';
export * from './HaloPaper';
export * from './HaloPopover';

// Navigation
export * from './HaloBreadcrumbs';
export * from './HaloLink';
export * from './HaloMenu';
export * from './HaloPagination';
export * from './HaloStepper';
export * from './HaloTabs';

// Date / Time (requires LocalizationProvider + AdapterDayjs)
export * from './HaloDatePicker';
