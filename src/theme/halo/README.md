# Halo Component Library

Shared Halo theme and component library for the halo-app prototype gallery.

Location: `src/theme/halo/`

---

## Files

| File | Purpose |
|---|---|
| `theme.ts` | Standalone MUI theme (`haloTheme` + `haloThemeDark`). No GAR dependency. |
| `components/` | 36 Halo-spec component wrappers (see barrel export in `components/index.ts`) |

---

## Usage

Import the theme from `~/theme/halo/theme`:

```tsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import { haloTheme } from '~/theme/halo/theme';

<ThemeProvider theme={haloTheme}>
  <CssBaseline />
  <App />
</ThemeProvider>
```

Import components from the barrel:

```tsx
import { HaloButton, HaloDialog, HaloTextField } from '~/theme/halo/components';
```

For date/time pickers, wrap once at the prototype root:

```tsx
import { HaloLocalizationProvider, AdapterDayjs } from '~/theme/halo/components';

<HaloLocalizationProvider dateAdapter={AdapterDayjs}>
  <YourPrototype />
</HaloLocalizationProvider>
```

Token aliases (`moondust`, `ruby`, `amber`, `tanzanite`, `jade`) are available from `~/theme/halo/theme`:

```ts
import { haloTheme, moondust, ruby, amber } from '~/theme/halo/theme';
```

---

## Component coverage

All 36 components map directly to the Figma HALO Design System (`MocqvKfuogd2Re1tyFr4d4`).

| Category | Components |
|---|---|
| Inputs | HaloButton, HaloIconButton, HaloButtonGroup, HaloCheckbox, HaloRadioGroup, HaloRating, HaloSelect, HaloSlider, HaloSwitch, HaloTextField, HaloAutocomplete, HaloToggleButtonGroup |
| Data Display | HaloAvatar, HaloBadge, HaloChip, HaloDivider, HaloList, HaloListItem, HaloTooltip, HaloTree |
| Feedback | HaloAlert, HaloBackdrop, HaloDialog, HaloEmptyState, HaloProgress, HaloSkeleton, HaloSnackbar |
| Surfaces | HaloAccordion, HaloAccordionGroup, HaloPaper, HaloPopover |
| Navigation | HaloBreadcrumbs, HaloLink, HaloMenu, HaloMenuItem, HaloPagination, HaloStepper, HaloTabs, HaloTab |
| Date/Time | HaloDatePicker, HaloTimePicker, HaloDateRangePicker |

---

## Ownership

Halo Team — Irene / Annie
Questions? Slack `#design-ops`
