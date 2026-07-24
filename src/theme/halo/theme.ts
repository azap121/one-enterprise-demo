/**
 * halo/theme.ts
 *
 * Interim Halo theme for standalone prototypes. No dependency on
 * @ds/ui-common-react — safe to use in any prototype without GAR access.
 *
 * Tokens sourced from:
 *   • ⭐️ [HALO] Design System (Figma) — visual spec
 *   • MerrillCorporation/ds-ui-libraries/packages/ui-utilities/src/constants/ds-halo-design-tokens.ts — canonical values (May 2026)
 *
 * Production React apps should consume DsThemeProvider from @ds/ui-common-react;
 * this bridge keeps halo-app GAR-free.
 */

import { alpha, createTheme } from '@mui/material/styles';

// ── Extend MUI palette with Halo custom keys ──────────────────────────────────
declare module '@mui/material/styles' {
  interface TypeBackground {
    defaultAlt: string;
    paperAlt: string;
    snackbar: string;
    alertError: string;
    alertWarning: string;
    alertInfo: string;
    alertSuccess: string;
    sandbox: string;
  }
  interface TypeText {
    alertError: string;
    alertWarning: string;
    alertInfo: string;
    alertSuccess: string;
  }
}

// ── Halo Button extensions ────────────────────────────────────────────────────
// `ai` prop opts a button into the Datasite-AI treatment (Neon Deep border).
// Styling lives in components.MuiButton.variants in both light and dark schemes.
declare module '@mui/material/Button' {
  interface ButtonOwnProps {
    /** Render with the Datasite-AI treatment (Neon Deep border + sparkle badge). */
    ai?: boolean;
  }
}

// ── Halo IconButton extensions ────────────────────────────────────────────────
// Adds `color="white"` for use on dark surfaces.
declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    white: true;
  }
}

// HaloBadge custom props — `disabled` enables the design-system disabled state
// per Figma 2x4 matrix (Primary | Light | Error | Disabled).
declare module '@mui/material/Badge' {
  interface BadgeOwnProps {
    disabled?: boolean;
  }
}

// ── Extend Chip color prop with Halo "data" variant (turquoise/teal) ──────────
declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    data: true;
  }
}

// ── Color tokens (refreshed from packages/ui-utilities/src/constants/ds-halo-design-tokens.ts · ds-ui-libraries main) ──
export const moondust = {
  50: '#FAFAF7', 100: '#F7F6F2', 200: '#DBDAD7', 300: '#BFBEBB',
  400: '#A3A2A0', 500: '#868684', 600: '#6A6A69', 700: '#4E4E4D',
  800: '#323232', 900: '#191919',
} as const;

export const amber = {
  50: '#FFF4EA', 100: '#FFE0C6', 200: '#FFC690', 300: '#FFB36B',
  400: '#FFA046', 500: '#FF8818', 600: '#EF601A', 700: '#B34814',
  800: '#78300D', 900: '#371606',
} as const;

export const ruby = {
  50: '#FEEEF1', 100: '#FBD3DA', 200: '#F9A9B8', 300: '#F78DA0',
  400: '#F57088', 500: '#EF5974', 600: '#E94160', 700: '#C02641',
  800: '#781D2E', 900: '#310C13',
} as const;

export const purpurite = {
  50: '#F8F1F5', 100: '#EAD8E3', 200: '#D1ADC2', 300: '#C191AE',
  400: '#B2769A', 500: '#9F5481', 600: '#872962', 700: '#651F4A',
  800: '#4D162D', 900: '#2E0D1B',
} as const;

export const amethyst = {
  50: '#F4F1F6', 100: '#DED6E5', 200: '#C1B5CB', 300: '#AD9DBA',
  400: '#9884A9', 500: '#7E6594', 600: '#5E3E79', 700: '#472F5B',
  800: '#351F3E', 900: '#201326',
} as const;

export const tanzanite = {
  // 400–800 synced to ds-ui-libraries ds-halo-design-tokens.ts (v2.1.566, 2026-04-14);
  // 50–300/900 are local extended shades (canonical ramp defines 400–800 only).
  50: '#EFF1F8', 100: '#D7DCED', 200: '#A9B3D9', 300: '#8C99CD',
  400: '#6F8DC0', 500: '#5C78A6', 600: '#2F4E7F', 700: '#233B5F',
  800: '#162235', 900: '#0D111F',
} as const;

export const topaz = {
  50: '#EDF3F8', 100: '#D2E1EC', 200: '#AAC5DA', 300: '#8DB2CD',
  400: '#719FC1', 500: '#477EA7', 600: '#1D5D8D', 700: '#16486E',
  800: '#11354F', 900: '#0A2233',
} as const;

export const turquoise = {
  50: '#EFF7F7', 100: '#D9E9EA', 200: '#B2D0D1', 300: '#99C1C2',
  400: '#7FB1B3', 500: '#54979A', 600: '#27777A', 700: '#1D595C',
  800: '#143C3D', 900: '#0C2425',
} as const;

export const emerald = {
  50: '#F1F6F3', 100: '#D9E7E0', 200: '#ACC4B9', 300: '#91B1A1',
  400: '#759D8A', 500: '#53856D', 600: '#286648', 700: '#1E4D36',
  800: '#0F2B2F', 900: '#08191C',
} as const;

export const jade = {
  50: '#F1F5ED', 100: '#DCE7D2', 200: '#C1CDB5', 300: '#ACBD9C',
  400: '#97AC83', 500: '#74905A', 600: '#517431', 700: '#3D5725',
  800: '#293A19', 900: '#18220F',
} as const;

export const peridot = {
  50: '#FAFBF1', 100: '#ECEECF', 200: '#D4D6AC', 300: '#C6C890',
  400: '#B8BA74', 500: '#A6A951', 600: '#909325', 700: '#6C6E1C',
  800: '#515315', 900: '#30310D',
} as const;

export const citrine = {
  50: '#FEF9EA', 100: '#FCF0C9', 200: '#FAE7AE', 300: '#F8DF93',
  400: '#F6D778', 500: '#F4CD56', 600: '#F1C02C', 700: '#B59021',
  800: '#735C15', 900: '#45370D',
} as const;

// Accessible color pairs for charts and data viz. Always use this palette for
// data viz — do not reach for gemstone ramps directly or invent hex values.
export const accessibleColors = {
  // Synced to dsHaloAccessibleColors — ds-ui-libraries ds-halo-design-tokens.ts (v2.1.566, 2026-04-14)
  darkYellow: citrine[700],    lightYellow: citrine[400],
  darkOrange: amber[700],      lightOrange: amber[400],
  darkRed: ruby[700],          lightRed: ruby[400],
  darkPink: purpurite[600],    lightPink: purpurite[400],
  darkPurple: amethyst[600],   lightPurple: amethyst[400],
  darkIndigo: tanzanite[600],  lightIndigo: tanzanite[400],
  darkBlue: turquoise[700],    lightBlue: turquoise[400],
  darkTeal: emerald[700],      lightTeal: emerald[400],
  darkGreen: peridot[700],     lightGreen: peridot[400],
  darkGray: moondust[600],     lightGray: moondust[300],
} as const;

// ── Alert tokens — Figma ⭐️ [HALO] Design System node 6595:48211, May 2026 ──
const alertBg = {
  error:   ruby[50],       // _components/alert/error/background   = ruby[50]   #FEEEF1
  warning: amber[50],      // _components/alert/warning/background = amber[50]  #FFF4EA
  info:    tanzanite[50],  // _components/alert/info/background    = tanzanite[50] #EFF1F8
  success: jade[50],       // _components/alert/success/background = jade[50]   #F1F5ED
  message: moondust[100],  // NEW/alert/message/background         = moondust[100] #F7F6F2
} as const;

const alertIcon = {
  error:   ruby[700],      // error/main   = ruby[700]      #C02641
  warning: amber[700],     // warning/main = amber[700]     #B34814
  info:    tanzanite[600], // info/main    = tanzanite[600] #2F4E7F
  success: jade[700],      // success/main = jade[700]      #3D5725
  message: moondust[600],  // secondary/main
} as const;

const alertBorder = {
  error:   'rgba(233,65,96,0.5)',   // error/_states/outlinedBorder #e9416080
  warning: 'rgba(239,96,26,0.5)',   // warning/_states/outlinedBorder #ef601a80
  info:    'rgba(47,78,127,0.5)',   // info/_states/outlinedBorder #2f4e7f80
  success: 'rgba(61,87,37,0.5)',    // success/_states/outlinedBorder #3d572580
  message: 'rgba(25,25,25,0.5)',    // primary/_states/outlinedBorder from get_design_context
} as const;

// ── Dark mode alert backgrounds — dsHaloDarkPalette, May 2026 ─────────────────
const alertBgDark = {
  error:   '#372226',    // dsHaloDarkPalette.background.alertError (was ruby[900]=#310C13)
  warning: '#3C2A19',    // unchanged
  info:    '#23262C',    // unchanged
  success: '#272B23',    // unchanged
} as const;

// ── Switch component tokens (_components/switch/) ─────────────────────────────
// Shared by haloTheme + haloThemeDark; ({ theme }) callbacks resolve per mode.
// Figma: ⭐️ HALO Design System → Input / <HALO_Switch> (node 11022:144509)
//   _components/switch/slideFill        → primary.main      (checked track)
//   _components/switch/knobFillEnabled  → grey[50]          (moondust[50]  = #fafaf7)
//   _components/switch/knowFillDisabled → grey[100]         (moondust[100] = #f7f6f2)
//   unchecked track fill                → alpha(primary.main, 0.25)
//   disabled track fill                 → action.disabledBackground
const haloSwitchOverrides = {
  styleOverrides: {
    root: {
      width: 36,
      height: 20,
      padding: 0,
      // Halo has one switch size — no "small" variant in Figma.
      // MUI's sizeSmall nested selector (.MuiSwitch-sizeSmall .MuiSwitch-switchBase)
      // has specificity (0,2,0), beating our per-slot switchBase override (0,1,0).
      // This re-anchors the geometry at (0,3,0) so padding:2px wins and the thumb
      // stays vertically centered in the 20px track regardless of the size prop.
      '&.MuiSwitch-sizeSmall': {
        width: 36,
        height: 20,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: '2px',
          '&.Mui-checked': {
            transform: 'translateX(16px)',
          },
        },
        '& .MuiSwitch-thumb': {
          width: 16,
          height: 16,
        },
      },
    },
    switchBase: ({ theme }: { theme: ReturnType<typeof createTheme> }) => ({
      padding: '2px',
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        '& .MuiSwitch-thumb': {
          // _components/switch/knobFillEnabled — reinforce in checked state;
          // MUI sets color: primary.main on .Mui-checked which can bleed into
          // the thumb via currentColor inheritance. Explicit bg wins specificity.
          // Dark mode: moondust[300] (#BFBEBB) for contrast against the light track.
          backgroundColor: theme.palette.mode === 'dark'
            ? theme.palette.grey[300]
            : theme.palette.grey[50],
        },
        '& + .MuiSwitch-track': {
          // _components/switch/slideFill
          backgroundColor: theme.palette.primary.main,
          opacity: 1,
        },
      },
      '&.Mui-disabled': {
        '& .MuiSwitch-thumb': {
          // _components/switch/knowFillDisabled — light: moondust[300], dark: moondust[600]
          backgroundColor: theme.palette.mode === 'dark'
            ? theme.palette.grey[600]
            : theme.palette.grey[300],
        },
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: theme.palette.action.disabledBackground,
        },
      },
      // Focused: 2px border on track — _components/switch/primary._states/outlinedBorder
      '&.Mui-focusVisible + .MuiSwitch-track': {
        border: '2px solid',
        borderColor: alpha(theme.palette.primary.dark, 0.5),
      },
    }),
    thumb: ({ theme }: { theme: ReturnType<typeof createTheme> }) => ({
      width: 16,
      height: 16,
      // _components/switch/knobFillEnabled (moondust[50] = #fafaf7, not pure white)
      backgroundColor: theme.palette.grey[50],
      boxShadow: theme.shadows[1],
    }),
    track: ({ theme }: { theme: ReturnType<typeof createTheme> }) => ({
      borderRadius: '10px',
      backgroundColor: alpha(theme.palette.primary.main, 0.25),
      opacity: 1,
    }),
  },
};

// ── Light theme ───────────────────────────────────────────────────────────────
export const haloTheme = createTheme({
  palette: {
    grey: moondust,
    divider: alpha(moondust[900], 0.12),
    primary: {
      main: moondust[700],
      light: moondust[500],
      dark: moondust[900],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: moondust[600],
      light: moondust[400],
      dark: moondust[800],
      contrastText: '#FFFFFF',
    },
    error: { light: ruby[600], main: ruby[700], dark: ruby[800], contrastText: '#FFFFFF' },
    warning: { light: amber[600], main: amber[700], dark: amber[800], contrastText: '#FFFFFF' },
    info: { light: tanzanite[500], main: tanzanite[600], dark: tanzanite[700], contrastText: '#FFFFFF' },
    success: { light: jade[600], main: jade[700], dark: jade[800], contrastText: '#FFFFFF' },
    text: {
      primary: moondust[800],
      secondary: moondust[600],
      disabled: alpha(moondust[700], 0.38),
      alertError: ruby[700],       // canonical: dsHaloLightPalette.text.alertError
      alertWarning: amber[700],    // canonical: dsHaloLightPalette.text.alertWarning
      alertInfo: tanzanite[600],   // info/main = tanzanite[600] #2F4E7F
      alertSuccess: jade[700],     // canonical: dsHaloLightPalette.text.alertSuccess
    },
    background: {
      default: '#FFFFFF',         // dsHaloLightPalette.background.default = white
      paper: '#FFFFFF',
      defaultAlt: moondust[50],   // dsHaloLightPalette.background.defaultAlt = moondust[50]
      paperAlt: moondust[50],     // dsHaloLightPalette.background.paperAlt (new)
      snackbar: moondust[800],    // dsHaloLightPalette.background.snackbar (new)
      alertError: alertBg.error,
      alertWarning: alertBg.warning,
      alertInfo: alertBg.info,
      alertSuccess: alertBg.success,
      // Halo: background/sandbox = #FF8818 @ 10% (amber[500] alpha 0.1)
      // Used by HaloLeftDrawerTree variant="sandbox"; mirrors alertError/alertWarning slot pattern
      sandbox: alpha(amber[500], 0.1),
    },
    action: {
      active: moondust[700],
      hover: alpha(moondust[700], 0.04),
      selected: alpha(moondust[700], 0.08),
      focus: alpha(moondust[700], 0.12),
      disabled: alpha(moondust[700], 0.38),
      disabledBackground: alpha(moondust[700], 0.12),
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ['Figtree', 'system-ui', 'sans-serif'].join(','),
    h1: { fontSize: '5rem', letterSpacing: '-1.5px' },
    h4: { fontWeight: 400, letterSpacing: '0.00735em' },
    h5: { fontWeight: 400 },
    h6: { fontWeight: 500, letterSpacing: '0.009375rem' },
    body1: { lineHeight: 1.5 },
    body2: { lineHeight: 1.43, letterSpacing: '0.17px' },
    subtitle1: { fontWeight: 500 },
    overline: { fontWeight: 400, letterSpacing: '0.08333em' },
    caption: { letterSpacing: '0.4px' },
  },
  components: {
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Figtree', system-ui, sans-serif; }
      `,
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    // === BUTTON (light) ===
    // Ports the canonical Halo MuiButton override (size variants + color variants
    // + `ai` prop variant). All values theme-token-driven; no hardcoded hex.
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      variants: [
        {
          props: { ai: true },
          style: ({ theme }) => ({
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: amber[600],
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: amber[600],
              backgroundColor: alpha(amber[600], 0.04),
            },
            '&.Mui-focusVisible': {
              outline: `2px solid ${alpha(amber[600], 0.5)}`,
              outlineOffset: 1,
            },
            '&.Mui-disabled': {
              borderColor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
              backgroundColor: theme.palette.action.disabledBackground,
            },
          }),
        },
      ],
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          fontFamily: theme.typography.fontFamily,
          fontWeight: 500,
          textTransform: 'capitalize',
          '&.Mui-focusVisible': {
            outline: `2px solid ${alpha(moondust[900], 0.5)}`,
            outlineOffset: '0px',
          },
          // MUI v6.4+ native loading prop: dim when loading
          '&.MuiButton-loading, &.Mui-loading': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
          },
          // text variant: align loading spinner with contained/outlined
          // (MUI default puts text-variant spinner at left:6 / right:6)
          '&.MuiButton-text.MuiButton-loadingPositionStart .MuiButton-loadingIndicator': { left: 14 },
          '&.MuiButton-text.MuiButton-loadingPositionEnd .MuiButton-loadingIndicator': { right: 14 },
        }),
        sizeLarge: {
          height: 42,
          padding: '4px 20px',
          fontSize: '0.9375rem',
          lineHeight: '26px',
          letterSpacing: '0.46px',
          '& .MuiButton-startIcon svg.svg-inline--fa, & .MuiButton-endIcon svg.svg-inline--fa': { fontSize: '16px' },
        },
        sizeMedium: {
          height: 36,
          padding: '4px 16px',
          fontSize: '0.875rem',
          lineHeight: '24px',
          letterSpacing: '0.4px',
          '& .MuiButton-startIcon svg.svg-inline--fa, & .MuiButton-endIcon svg.svg-inline--fa': { fontSize: '16px' },
        },
        sizeSmall: {
          height: 30,
          padding: '4px 10px',
          fontSize: '0.8125rem',
          lineHeight: '22px',
          letterSpacing: '0.46px',
          '& .MuiButton-startIcon svg.svg-inline--fa, & .MuiButton-endIcon svg.svg-inline--fa': { fontSize: '14px' },
        },
        contained: ({ theme }) => ({
          '&:hover': { backgroundColor: theme.palette.primary.dark },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
          },
        }),
        containedError: ({ theme }) => ({
          backgroundColor: theme.palette.error.main,
          '&:hover': { backgroundColor: theme.palette.error.dark },
        }),
        outlined: () => ({
          borderWidth: 1,
          borderStyle: 'solid',
          '&:hover': { borderWidth: 1 },
        }),
        outlinedError: ({ theme }) => ({
          borderColor: theme.palette.error.main,
          color: theme.palette.error.main,
          '&:hover': {
            borderColor: theme.palette.error.dark,
            backgroundColor: alpha(theme.palette.error.main, 0.04),
          },
        }),
        text: {},
        textSizeLarge: { padding: '4px 20px' },
        textSizeMedium: { padding: '4px 16px' },
        textSizeSmall: { padding: '4px 10px' },
        textError: ({ theme }) => ({
          color: theme.palette.error.main,
          '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.04) },
        }),
      },
    },
    // === BUTTON GROUP (light) ===
    MuiButtonGroup: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: {
        root: { borderRadius: 8, gap: 1 },
        grouped: {
          '&:not(:last-of-type)': { borderRight: 'none' },
        },
      },
    },
    // === ICON BUTTON (light) ===
    // Color variants (default/error/primary/secondary/white) live as theme variants.
    MuiIconButton: {
      defaultProps: { disableRipple: true },
      variants: [
        {
          props: { color: 'error' },
          style: ({ theme }) => ({
            color: theme.palette.error.main,
            '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.04) },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
              outline: `2px solid ${alpha(moondust[900], 0.5)}`,
              outlineOffset: '0px',
            },
            '&.Mui-disabled': { color: theme.palette.action.disabled },
          }),
        },
        {
          props: { color: 'primary' },
          style: ({ theme }) => ({
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
            '&.Mui-focusVisible': {
              backgroundColor: theme.palette.primary.main,
              outline: `2px solid ${alpha(moondust[900], 0.5)}`,
              outlineOffset: '0px',
            },
            '&.Mui-disabled': {
              backgroundColor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
          }),
        },
        {
          props: { color: 'secondary' },
          style: ({ theme }) => ({
            color: theme.palette.text.primary,
            border: `1px solid ${alpha(moondust[600], 0.3)}`,
            '&:hover': { backgroundColor: alpha(moondust[700], 0.04) },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(moondust[700], 0.08),
              outline: `2px solid ${alpha(moondust[900], 0.5)}`,
              outlineOffset: '0px',
            },
            '&.Mui-disabled': {
              color: theme.palette.action.disabled,
              borderColor: theme.palette.action.disabledBackground,
            },
          }),
        },
        {
          props: { color: 'white' },
          style: () => ({
            color: '#FFFFFF',
            '&:hover': { backgroundColor: alpha('#FFFFFF', 0.04) },
            '&.Mui-focusVisible': {
              backgroundColor: alpha('#FFFFFF', 0.08),
              outline: `2px solid ${alpha('#FFFFFF', 0.5)}`,
              outlineOffset: '0px',
            },
            '&.Mui-disabled': { color: alpha('#FFFFFF', 0.38) },
          }),
        },
      ],
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          '&:hover': { backgroundColor: alpha(moondust[700], 0.04) },
          '&.Mui-focusVisible': {
            backgroundColor: alpha(moondust[700], 0.08),
            outline: `2px solid ${alpha(moondust[900], 0.5)}`,
            outlineOffset: '0px',
          },
          '&.Mui-disabled': { color: theme.palette.action.disabled },
        }),
        sizeSmall:  { borderRadius: 4, width: 20, height: 20, padding: '3px', '& svg.svg-inline--fa': { fontSize: 14, width: 14 } },
        sizeMedium: { borderRadius: 4, width: 24, height: 24, padding: '4px', '& svg.svg-inline--fa': { fontSize: 16, width: 16 } },
        sizeLarge:  { borderRadius: 8, width: 32, height: 32, padding: '6px', '& svg.svg-inline--fa': { fontSize: 20, width: 20 } },
      },
    },
    MuiDialog: {
      defaultProps: { fullWidth: true, maxWidth: 'sm' },
      styleOverrides: {
        root: {
          '& .MuiDialog-paper': {
            border: `0.5px solid ${moondust[300]}`,
            backgroundImage: 'none',
            borderRadius: 8,
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          letterSpacing: '0.009375rem',
          fontWeight: 600,
          padding: '20px 24px 12px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: { root: { padding: '8px 24px 16px' } },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: '12px 24px 20px', gap: 8 } },
    },
    // === BADGE (light) ===
    // Design system 2x4 matrix per Figma (Primary | Light | Error | Disabled)
    // × (Dot | Number). Halo spec: 12px font / 20px lineHeight / 0.14px tracking.
    // Number: borderRadius 100, min 20×20 (circle for 1–2 digits, pill for "99+").
    // Dot: 8×8 with 1px surface ring. MUI default max={99} → "99+" when exceeded.
    MuiBadge: {
      styleOverrides: {
        badge: ({ theme, ownerState }) => ({
          fontFamily: theme.typography.fontFamily,
          fontWeight: 500,
          fontSize: '0.75rem',
          lineHeight: '20px',
          letterSpacing: '0.14px',
          minWidth: 20,
          height: 20,
          padding: '0 4px',
          borderRadius: 100,
          border: `1px solid ${theme.palette.background.default}`,
          boxSizing: 'border-box',
          ...(ownerState.color === 'default' && {
            backgroundColor: moondust[200],
            color: theme.palette.text.primary,
          }),
          ...(ownerState.variant === 'dot' && {
            minWidth: 8,
            width: 8,
            height: 8,
            padding: 0,
          }),
          ...(ownerState.disabled && {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.text.disabled,
          }),
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: () => ({
          borderRadius: 8,
          border: '1px solid',
          padding: '4px 16px 8px', // pt=NEW(4px), pb=1(8px), px=2(16px) — Figma node 6595:48211
          alignItems: 'flex-start', // Figma root: items-start — keeps icon + action top-aligned on multiline
          '& .MuiAlert-icon': {
            padding: '8px 8px 8px 0', // pt=1(8px), pr=1(8px), pb=1(8px) — Figma icon container
            marginRight: 0,           // spacing handled by pr above
            minHeight: 40,            // Figma icon column: min-h-40px — matches action slot height so both centres align on single-line alerts
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiAlert-action': {
            alignSelf: 'flex-start',          // pin to top — don't stretch to full alert height
            padding: '8px 0 8px 8px',         // py=1(8px), pl=1(8px) — Figma action container
            gap: 8,                           // gap=1(8px) between chip and close button
            alignItems: 'center',
            marginTop: 0,
            marginRight: 0,
          },
          variants: [
            {
              props: { severity: 'error', variant: 'standard' },
              style: {
                backgroundColor: alertBg.error,
                borderColor: alertBorder.error,
                color: alertIcon.error,
                '& .MuiAlert-icon': { color: alertIcon.error },
              },
            },
            {
              props: { severity: 'warning', variant: 'standard' },
              style: {
                backgroundColor: alertBg.warning,
                borderColor: alertBorder.warning,
                color: alertIcon.warning,
                '& .MuiAlert-icon': { color: alertIcon.warning },
              },
            },
            {
              props: { severity: 'info', variant: 'standard' },
              style: {
                backgroundColor: alertBg.info,
                borderColor: alertBorder.info,
                color: alertIcon.info,
                '& .MuiAlert-icon': { color: alertIcon.info },
              },
            },
            {
              props: { severity: 'success', variant: 'standard' },
              style: {
                backgroundColor: alertBg.success,
                borderColor: alertBorder.success,
                color: alertIcon.success,
                '& .MuiAlert-icon': { color: alertIcon.success },
              },
            },
          ],
        }),
      },
    },
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
        autoHideDuration: 6000,
      },
    },
    // === TOGGLE BUTTON GROUP (light) ===
    // node 6601:51012 — alpha tokens replace hardcoded rgba.
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${alpha(moondust[600], 0.3)}`,
          borderRadius: 8,
          padding: 4,
          gap: 4,
          '& .MuiToggleButtonGroup-grouped': {
            border: 'none',
            borderRadius: '4px !important',
            '&.Mui-selected': {
              backgroundColor: alpha(moondust[900], 0.08),
              color: theme.palette.text.primary,
              '&:hover':  { backgroundColor: alpha(moondust[900], 0.12) },
              '&:active': { backgroundColor: alpha(moondust[900], 0.12) },
            },
            '&:not(.Mui-selected)': {
              color: theme.palette.text.primary,
              '&:hover':  { backgroundColor: alpha(moondust[900], 0.04) },
              '&:active': { backgroundColor: alpha(moondust[900], 0.04) },
            },
          },
        }),
      },
    },
    MuiToggleButton: {
      // button/medium token: fontWeightMedium=500, fontSize=14px, letterSpacing=0.4px
      // padding from Figma: py=2px, px=8px; min-height=28px
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '2px 8px',
          minHeight: 28,
          fontSize: '0.875rem',
          letterSpacing: '0.4px',
          lineHeight: '24px',
        },
      },
    },
    // === CHIP ===
    // Halo spec — ⭐️ [HALO] Design System → <HALO_Chip> (node 11033:144919)
    //   radius:        100 (pill)
    //   label:         Figtree Light (300), 0.75rem (12px), lh 18, ls 0.16
    //   filled/default bg:    moondust[100]   (#F7F6F2)
    //                  hover: moondust[300]   (_components/chip/defaultHoverFill)
    //                  focus: moondust[300] + 2px outline alpha(moondust[900], 0.5)
    //   filled/<color>:       rely on palette.<color>.main + contrastText + .dark hover
    //   outlined/default:     border alpha(moondust[900], 0.5)
    //   outlined/<color>:     border palette.<color>.main, text palette.<color>.main
    //   disabled:             MUI default 38% opacity (action.disabled)
    MuiChip: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          borderRadius: 100,
          height: 24,
          // Halo: single 24px chip height. Override MUI's small/medium size deltas.
          '&.MuiChip-sizeSmall, &.MuiChip-sizeMedium': { height: 24 },
          ...(ownerState.variant === 'filled' &&
            ownerState.color === 'default' && {
              backgroundColor: moondust[100],
              '&:hover': { backgroundColor: moondust[300] },
              '&.Mui-focusVisible': {
                backgroundColor: moondust[300],
                boxShadow: `0 0 0 2px ${alpha(moondust[900], 0.5)}`,
              },
            }),
          ...(ownerState.variant === 'outlined' &&
            ownerState.color === 'default' && {
              // _components/chip/defaultEnabledBorder = #191919b2 (moondust[900] @ 70%)
              borderColor: alpha(moondust[900], 0.7),
            }),
          // Halo "data" color (turquoise/teal — accessible)
          ...(ownerState.variant === 'filled' &&
            (ownerState.color as string) === 'data' && {
              backgroundColor: turquoise[200],
              color: turquoise[700],
              '&:hover': { backgroundColor: turquoise[300] },
              '&.Mui-focusVisible': {
                backgroundColor: turquoise[300],
                boxShadow: `0 0 0 2px ${alpha(moondust[900], 0.5)}`,
              },
            }),
          ...(ownerState.variant === 'outlined' &&
            (ownerState.color as string) === 'data' && {
              color: turquoise[700],
              borderColor: turquoise[600],
            }),
        }),
        label: {
          fontWeight: 400,
          fontSize: '0.75rem',
          lineHeight: '18px',
          letterSpacing: '0.16px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: moondust[800], fontSize: '0.75rem' },
        arrow: { color: moondust[800] },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiSwitch: haloSwitchOverrides,
  },
});

// ── Dark theme ────────────────────────────────────────────────────────────────
// This local bridge mirrors the ds-ui-libraries Halo dark palette while keeping
// halo-app GAR-free. Refresh these values from:
// ds-ui-libraries/packages/ui-utilities/src/constants/ds-halo-design-tokens.ts
// and theme wiring from:
// ds-ui-libraries/packages/ui-common-react/src/theme/ds-halo-theme.ts
export const haloThemeDark = createTheme({
  palette: {
    mode: 'dark',
    grey: moondust,
    divider: alpha('#FFFFFF', 0.12),
    primary: {
      main: moondust[100],
      light: moondust[300],
      dark: '#FFFFFF',
      contrastText: '#000000',
    },
    secondary: {
      main: moondust[200],
      light: moondust[400],
      dark: moondust[50],
      contrastText: '#000000',
    },
    error: { light: ruby[600], main: ruby[500], dark: ruby[400], contrastText: '#000000' },
    warning: { light: amber[600], main: amber[500], dark: amber[400], contrastText: '#000000' },
    info: { light: tanzanite[600], main: tanzanite[500], dark: tanzanite[400], contrastText: '#000000' },
    success: { light: jade[600], main: jade[500], dark: jade[400], contrastText: '#000000' },
    text: {
      primary: moondust[50],
      secondary: moondust[200],
      disabled: alpha(moondust[100], 0.38),
      alertError: ruby[400],
      alertWarning: amber[400],
      alertInfo: tanzanite[400],
      alertSuccess: jade[400],
    },
    background: {
      default: moondust[900],
      paper: moondust[800],
      defaultAlt: moondust[900],
      paperAlt: moondust[800],
      snackbar: moondust[50],
      alertError: alertBgDark.error,
      alertWarning: alertBgDark.warning,
      alertInfo: alertBgDark.info,
      alertSuccess: alertBgDark.success,
      // Halo: background/sandbox parity with light (alpha-on-amber works on dark paper)
      sandbox: alpha(amber[500], 0.1),
    },
    action: {
      active: alpha(moondust[100], 0.70),
      hover: alpha(moondust[100], 0.08),
      selected: alpha(moondust[100], 0.16),
      focus: alpha(moondust[100], 0.12),
      disabled: alpha(moondust[100], 0.38),
      disabledBackground: alpha(moondust[100], 0.12),
    },
  },
  shape: { borderRadius: 8 },
  typography: haloTheme.typography,
  components: {
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Figtree', system-ui, sans-serif; }
      `,
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    // === BUTTON (dark) ===
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      variants: [
        {
          props: { ai: true },
          style: ({ theme }) => ({
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: amber[600],
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: amber[600],
              backgroundColor: alpha(amber[600], 0.08),
            },
            '&.Mui-focusVisible': {
              outline: `2px solid ${alpha(amber[600], 0.5)}`,
              outlineOffset: 1,
            },
            '&.Mui-disabled': {
              borderColor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
              backgroundColor: theme.palette.action.disabledBackground,
            },
          }),
        },
      ],
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          fontFamily: theme.typography.fontFamily,
          fontWeight: 500,
          textTransform: 'capitalize',
          '&.Mui-focusVisible': {
            outline: `2px solid ${alpha(moondust[100], 0.5)}`,
            outlineOffset: '0px',
          },
          '&.MuiButton-loading, &.Mui-loading': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
          },
          '&.MuiButton-text.MuiButton-loadingPositionStart .MuiButton-loadingIndicator': { left: 14 },
          '&.MuiButton-text.MuiButton-loadingPositionEnd .MuiButton-loadingIndicator': { right: 14 },
        }),
        sizeLarge: {
          height: 42,
          padding: '4px 20px',
          fontSize: '0.9375rem',
          lineHeight: '26px',
          letterSpacing: '0.46px',
          '& .MuiButton-startIcon svg.svg-inline--fa, & .MuiButton-endIcon svg.svg-inline--fa': { fontSize: '16px' },
        },
        sizeMedium: {
          height: 36,
          padding: '4px 16px',
          fontSize: '0.875rem',
          lineHeight: '24px',
          letterSpacing: '0.4px',
          '& .MuiButton-startIcon svg.svg-inline--fa, & .MuiButton-endIcon svg.svg-inline--fa': { fontSize: '16px' },
        },
        sizeSmall: {
          height: 30,
          padding: '4px 10px',
          fontSize: '0.8125rem',
          lineHeight: '22px',
          letterSpacing: '0.46px',
          '& .MuiButton-startIcon svg.svg-inline--fa, & .MuiButton-endIcon svg.svg-inline--fa': { fontSize: '14px' },
        },
        contained: ({ theme }) => ({
          '&:hover': { backgroundColor: theme.palette.primary.dark },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
          },
        }),
        containedError: ({ theme }) => ({
          backgroundColor: theme.palette.error.main,
          '&:hover': { backgroundColor: theme.palette.error.dark },
        }),
        outlined: () => ({
          borderWidth: 1,
          borderStyle: 'solid',
          '&:hover': { borderWidth: 1 },
        }),
        outlinedError: ({ theme }) => ({
          borderColor: theme.palette.error.main,
          color: theme.palette.error.main,
          '&:hover': {
            borderColor: theme.palette.error.dark,
            backgroundColor: alpha(theme.palette.error.main, 0.08),
          },
        }),
        text: {},
        textSizeLarge: { padding: '4px 20px' },
        textSizeMedium: { padding: '4px 16px' },
        textSizeSmall: { padding: '4px 10px' },
        textError: ({ theme }) => ({
          color: theme.palette.error.main,
          '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.08) },
        }),
      },
    },
    // === BUTTON GROUP (dark) ===
    MuiButtonGroup: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: {
        root: { borderRadius: 8, gap: 1 },
        grouped: { '&:not(:last-of-type)': { borderRight: 'none' } },
      },
    },
    // === ICON BUTTON (dark) ===
    MuiIconButton: {
      defaultProps: { disableRipple: true },
      variants: [
        {
          props: { color: 'error' },
          style: ({ theme }) => ({
            color: theme.palette.error.main,
            '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.08) },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(theme.palette.error.main, 0.12),
              outline: `2px solid ${alpha(moondust[100], 0.5)}`,
              outlineOffset: '0px',
            },
            '&.Mui-disabled': { color: theme.palette.action.disabled },
          }),
        },
        {
          props: { color: 'primary' },
          style: ({ theme }) => ({
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
            '&.Mui-focusVisible': {
              backgroundColor: theme.palette.primary.main,
              outline: `2px solid ${alpha(moondust[100], 0.5)}`,
              outlineOffset: '0px',
            },
            '&.Mui-disabled': {
              backgroundColor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
          }),
        },
        {
          props: { color: 'secondary' },
          style: ({ theme }) => ({
            color: theme.palette.text.primary,
            border: `1px solid ${alpha(moondust[100], 0.3)}`,
            '&:hover': { backgroundColor: alpha(moondust[100], 0.04) },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(moondust[100], 0.08),
              outline: `2px solid ${alpha(moondust[100], 0.5)}`,
              outlineOffset: '0px',
            },
            '&.Mui-disabled': {
              color: theme.palette.action.disabled,
              borderColor: theme.palette.action.disabledBackground,
            },
          }),
        },
        {
          props: { color: 'white' },
          style: () => ({
            color: '#FFFFFF',
            '&:hover': { backgroundColor: alpha('#FFFFFF', 0.08) },
            '&.Mui-focusVisible': {
              backgroundColor: alpha('#FFFFFF', 0.12),
              outline: `2px solid ${alpha('#FFFFFF', 0.5)}`,
              outlineOffset: '0px',
            },
            '&.Mui-disabled': { color: alpha('#FFFFFF', 0.38) },
          }),
        },
      ],
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          '&:hover': { backgroundColor: alpha(moondust[100], 0.08) },
          '&.Mui-focusVisible': {
            backgroundColor: alpha(moondust[100], 0.12),
            outline: `2px solid ${alpha(moondust[100], 0.5)}`,
            outlineOffset: '0px',
          },
          '&.Mui-disabled': { color: theme.palette.action.disabled },
        }),
        sizeSmall:  { borderRadius: 4, width: 20, height: 20, padding: '3px', '& svg.svg-inline--fa': { fontSize: 14, width: 14 } },
        sizeMedium: { borderRadius: 4, width: 24, height: 24, padding: '4px', '& svg.svg-inline--fa': { fontSize: 16, width: 16 } },
        sizeLarge:  { borderRadius: 8, width: 32, height: 32, padding: '6px', '& svg.svg-inline--fa': { fontSize: 20, width: 20 } },
      },
    },
    MuiDialog: {
      defaultProps: { fullWidth: true, maxWidth: 'sm' },
      styleOverrides: {
        root: {
          '& .MuiDialog-paper': {
            border: `0.5px solid ${alpha('#FFFFFF', 0.12)}`,
            backgroundImage: 'none',
            borderRadius: 8,
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          letterSpacing: '0.009375rem',
          fontWeight: 600,
          padding: '20px 24px 12px',
        },
      },
    },
    MuiDialogContent: { styleOverrides: { root: { padding: '8px 24px 16px' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '12px 24px 20px', gap: 8 } } },
    // === BADGE (dark) ===
    MuiBadge: {
      styleOverrides: {
        badge: ({ theme, ownerState }) => ({
          fontFamily: theme.typography.fontFamily,
          fontWeight: 500,
          fontSize: '0.75rem',
          lineHeight: '20px',
          letterSpacing: '0.14px',
          minWidth: 20,
          height: 20,
          padding: '0 4px',
          borderRadius: 100,
          border: `1px solid ${theme.palette.background.default}`,
          boxSizing: 'border-box',
          ...(ownerState.color === 'default' && {
            backgroundColor: moondust[700],
            color: theme.palette.text.primary,
          }),
          ...(ownerState.variant === 'dot' && {
            minWidth: 8,
            width: 8,
            height: 8,
            padding: 0,
          }),
          ...(ownerState.disabled && {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.text.disabled,
          }),
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: () => ({
          borderRadius: 8,
          border: '1px solid',
          variants: [
            {
              props: { severity: 'error', variant: 'standard' },
              style: {
                backgroundColor: alertBgDark.error,
                borderColor: alertBorder.error,
                color: alertIcon.error,
                '& .MuiAlert-icon': { color: alertIcon.error },
              },
            },
            {
              props: { severity: 'warning', variant: 'standard' },
              style: {
                backgroundColor: alertBgDark.warning,
                borderColor: alertBorder.warning,
                color: alertIcon.warning,
                '& .MuiAlert-icon': { color: alertIcon.warning },
              },
            },
            {
              props: { severity: 'info', variant: 'standard' },
              style: {
                backgroundColor: alertBgDark.info,
                borderColor: alertBorder.info,
                color: alertIcon.info,
                '& .MuiAlert-icon': { color: alertIcon.info },
              },
            },
            {
              props: { severity: 'success', variant: 'standard' },
              style: {
                backgroundColor: alertBgDark.success,
                borderColor: alertBorder.success,
                color: alertIcon.success,
                '& .MuiAlert-icon': { color: alertIcon.success },
              },
            },
          ],
        }),
      },
    },
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
        autoHideDuration: 6000,
      },
    },
    // === TOGGLE BUTTON GROUP (dark) ===
    // Mirrors light spec via moondust[100] alpha tokens.
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${alpha(moondust[100], 0.23)}`,
          borderRadius: 8,
          padding: 4,
          gap: 4,
          '& .MuiToggleButtonGroup-grouped': {
            border: 'none',
            borderRadius: '4px !important',
            '&.Mui-selected': {
              backgroundColor: alpha(moondust[100], 0.08),
              color: theme.palette.text.primary,
              '&:hover':  { backgroundColor: alpha(moondust[100], 0.12) },
              '&:active': { backgroundColor: alpha(moondust[100], 0.12) },
            },
            '&:not(.Mui-selected)': {
              color: theme.palette.text.primary,
              '&:hover':  { backgroundColor: alpha(moondust[100], 0.04) },
              '&:active': { backgroundColor: alpha(moondust[100], 0.04) },
            },
          },
        }),
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '2px 8px',
          minHeight: 28,
          fontSize: '0.875rem',
          letterSpacing: '0.4px',
          lineHeight: '24px',
        },
      },
    },
    // === CHIP (dark) ===
    // Same Halo spec as light. Default-color uses moondust grey scale; palette-colored
    // chips inherit MUI defaults (palette.<color>.main + contrastText + .dark hover).
    MuiChip: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          borderRadius: 100,
          height: 24,
          '&.MuiChip-sizeSmall, &.MuiChip-sizeMedium': { height: 24 },
          ...(ownerState.variant === 'filled' &&
            ownerState.color === 'default' && {
              backgroundColor: alpha(moondust[100], 0.16),
              color: moondust[100],
              '&:hover': { backgroundColor: alpha(moondust[100], 0.24) },
              '&.Mui-focusVisible': {
                backgroundColor: alpha(moondust[100], 0.24),
                boxShadow: `0 0 0 2px ${alpha(moondust[100], 0.5)}`,
              },
            }),
          ...(ownerState.variant === 'outlined' &&
            ownerState.color === 'default' && {
              color: moondust[100],
              // dark parity: matches light-mode 70% on _components/chip/defaultEnabledBorder
              borderColor: alpha(moondust[100], 0.7),
            }),
          // Halo "data" color (turquoise/teal — accessible) — dark mode boost
          ...(ownerState.variant === 'filled' &&
            (ownerState.color as string) === 'data' && {
              backgroundColor: turquoise[700],
              color: turquoise[100],
              '&:hover': { backgroundColor: turquoise[600] },
              '&.Mui-focusVisible': {
                backgroundColor: turquoise[600],
                boxShadow: `0 0 0 2px ${alpha(moondust[100], 0.5)}`,
              },
            }),
          ...(ownerState.variant === 'outlined' &&
            (ownerState.color as string) === 'data' && {
              color: turquoise[200],
              borderColor: turquoise[400],
            }),
        }),
        label: {
          fontWeight: 400,
          fontSize: '0.75rem',
          lineHeight: '18px',
          letterSpacing: '0.16px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: moondust[100], color: moondust[900], fontSize: '0.75rem' },
        arrow: { color: moondust[100] },
      },
    },
    MuiListItem: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiSwitch: haloSwitchOverrides,
  },
});
