/**
 * HaloDatePicker / HaloTimePicker / HaloDateRangePicker
 *
 * Halo-spec wrappers around MUI X Date Pickers.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_DatePicker>      (node 24257:8199)
 *                                   <HALO_TimePicker>      (node 24257:8220)
 *                                   <HALO_DateRangePicker> (node 24257:8236)
 * Tokens (get_variable_defs, node 24257:8199):
 *   input border:        _components/input/outlined/enabledBorder rgba(25,25,25,0.23)
 *   input border-radius: borderRadiusS (4px)
 *   input font:          fontWeightRegular=400, 14px, lh 24px, ls 0.15px (input/value)
 *   input label font:    fontWeightRegular=400, 12px, lh 1.66, ls 0.15px (input/label)
 *   hover border:        primary/dark (#191919)
 *   focused border:      rgba(25,25,25,0.5), 2px
 *   popup border-radius: borderRadiusS (4px) — NOT borderRadiusM
 *   popup border:        elevation/outlined rgba(25,25,25,0.12)
 *   popup pt: 8px (--1), pb: 16px (--2), inner gap: 4px (--new)
 *   calendar header:     subtitle2 — fontWeightMedium=500, 14px, lh 1.57, ls 0.1px
 *   day cell size:       30×30px, border-radius borderRadiusM (8px) — NOT 4px
 *   day cell font:       body2 — fontWeightRegular=400, 14px, lh 1.43, ls 0.17px
 *   week day labels:     body2 — fontWeightRegular=400, 14px, lh 1.43, ls 0.17px, text/secondary
 *   today border:        action/active (#4e4e4d), 1px solid
 *   selected day bg:     primary/main (#4e4e4d)
 *   day hover bg:        rgba(25,25,25,0.04)
 *
 * Uses @mui/x-date-pickers v7 — same version as tasks-mfe / activities-mfe.
 * Locked to @mui/material v6 to match existing Halo theme snapshot.
 * Wrap your prototype root once with HaloLocalizationProvider:
 *
 *   import { HaloLocalizationProvider, AdapterDayjs } from '~/theme/halo/components';
 *   <HaloLocalizationProvider dateAdapter={AdapterDayjs}>
 *     <YourPrototype />
 *   </HaloLocalizationProvider>
 *
 * Note: HaloDateRangePicker renders two side-by-side pickers (start + end).
 * The MUI X Pro DateRangePicker requires a paid license; this avoids that dep.
 */
import { faAngleDown, faAngleLeft, faAngleRight, faCalendarDay, faClock } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Typography, alpha } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker, type TimePickerProps } from '@mui/x-date-pickers/TimePicker';
import type { Dayjs } from 'dayjs';

// ── Convenience re-export ─────────────────────────────────────────────────────
export { LocalizationProvider as HaloLocalizationProvider, AdapterDayjs };

// MUI X Date Pickers don't inherit MUI theme overrides the way standard components
// do — slotProps.sx is the only reliable injection point. These functions resolve
// theme tokens at render time so token updates in theme.ts propagate here.

const getInputSx = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',                             // borderRadiusS
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: '0.875rem',
    letterSpacing: '0.15px',                         // input/value ls
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(theme.palette.primary.dark, 0.23), // _components/input/outlined/enabledBorder
      borderRadius: '4px',
    },
    '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.dark,       // primary/dark
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(theme.palette.primary.dark, 0.5),
      borderWidth: '2px',
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: 'error.main',
    },
  },
  '& .MuiInputBase-input': {
    py: '6px',
    px: '8px',
    fontSize: '0.875rem',
    fontWeight: theme.typography.fontWeightRegular,  // fontWeightRegular
    fontFamily: theme.typography.fontFamily,
    letterSpacing: '0.15px',                         // input/value ls
  },
  '& .MuiInputLabel-root': {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightRegular,
    letterSpacing: '0.15px',                         // input/label ls
  },
});

const getPopperSx = (theme: Theme) => ({
  // ── Popup container ─────────────────────────────
  '& .MuiPaper-root': {
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,   // elevation/outlined
    borderRadius: '4px',                             // borderRadiusS
    boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
    fontFamily: theme.typography.fontFamily,
  },
  // ── Calendar: width + padding ────────────────────
  '& .MuiDateCalendar-root': {
    width: 290,                                      // Figma: 290px
    height: 'auto',                                  // override MUI's fixed 336px height
    maxHeight: 'none',
    pt: '8px',                                       // --1
    pb: '16px',                                      // --2
  },
  // ── Header row ───────────────────────────────────
  '& .MuiPickersCalendarHeader-root': {
    px: '16px',                                      // --2
    py: '4px',                                       // --new
    mt: 0,
    mb: 0,
    minHeight: 'auto',
  },
  '& .MuiPickersCalendarHeader-label': {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 500,                                 // subtitle2
    fontSize: '0.875rem',
    lineHeight: 1.57,
    letterSpacing: '0.1px',
    color: 'text.primary',
  },
  // ── Nav arrow buttons ────────────────────────────
  '& .MuiPickersArrowSwitcher-previousIconButton, & .MuiPickersArrowSwitcher-nextIconButton': {
    width: 24,
    height: 24,
    padding: '2px',
    borderRadius: '4px',                             // borderRadiusS
  },
  // ── Switch-view (dropdown) button ────────────────
  '& .MuiPickersCalendarHeader-switchViewButton': {
    width: 24,
    height: 24,
    padding: '2px',
    borderRadius: '4px',
  },
  // ── Week day label row ────────────────────────────
  '& .MuiDayCalendar-header': {
    px: '16px',                                      // --2
    py: '4px',                                       // --new
    gap: '8px',                                      // --1 between cells
    justifyContent: 'flex-start',
  },
  '& .MuiDayCalendar-weekDayLabel': {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightRegular,  // body2
    fontSize: '0.875rem',                            // 14px
    lineHeight: 1.43,
    letterSpacing: '0.17px',
    color: 'text.secondary',
    width: 30,
    height: 30,
    margin: 0,
  },
  // ── Day rows ──────────────────────────────────────
  '& .MuiDayCalendar-slideTransition': {
    minHeight: 200,                                  // 6 rows × 30px + 5 gaps × 4px
  },
  '& .MuiDayCalendar-monthContainer': {
    px: '16px',                                      // --2
  },
  '& .MuiDayCalendar-weekContainer': {
    gap: '8px',                                      // --1 between cells
    mb: '4px',                                       // --new between rows
    justifyContent: 'flex-start',
    '&:last-child': { mb: 0 },                       // no extra margin after last row
  },
  // ── Day cells ─────────────────────────────────────
  '& .MuiPickersDay-root': {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightRegular,  // body2
    fontSize: '0.875rem',
    lineHeight: 1.43,
    letterSpacing: '0.17px',
    borderRadius: '8px',                             // borderRadiusM
    width: 30,
    height: 30,
    margin: 0,
    '&.MuiPickersDay-today': {
      border: `1px solid ${theme.palette.primary.main}`, // action/active
      borderRadius: '8px',
    },
    '&.Mui-selected': {
      bgcolor: 'primary.main',
      color: theme.palette.primary.contrastText,
      fontWeight: 500,
      '&:hover': { bgcolor: 'primary.dark' },
      '&:focus': { bgcolor: 'primary.main' },
    },
    '&:hover:not(.Mui-selected)': {
      bgcolor: theme.palette.action.hover,
    },
  },
  // ── Year view ─────────────────────────────────────
  // MUI X defaults MuiYearCalendar-root to 320px wide — wider than our 290px
  // picker — causing the rightmost column to be clipped. Figma spec shows 3
  // columns at 290px (node 24257:8386), so we constrain the grid here.
  '& .MuiYearCalendar-root': {
    width: 290,                                      // match picker width
    maxWidth: 290,
    boxSizing: 'border-box',
    padding: '4px 8px',
  },
  '& .MuiPickersYear-root': {
    flexBasis: 'calc(33.33% - 2px)',                 // 3 columns — matches Figma
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .MuiPickersYear-yearButton': {
    width: '100%',
    height: 30,
    margin: 0,
    borderRadius: '8px',                             // borderRadiusM
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightRegular,  // body2
    fontSize: '0.875rem',
    lineHeight: 1.43,
    letterSpacing: '0.17px',
    '&.Mui-selected': {
      bgcolor: 'primary.main',
      color: theme.palette.primary.contrastText,
      '&:hover': { bgcolor: 'primary.dark' },
      '&:focus': { bgcolor: 'primary.main' },
    },
    '&:hover:not(.Mui-selected)': {
      bgcolor: theme.palette.action.hover,
    },
  },
});

// ── Label above input ─────────────────────────────────────────────────────────

const labelSx = (theme: Theme) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: '0.75rem',           // 12px — input/label
  lineHeight: 1.66,
  letterSpacing: '0.15px',
  color: 'text.secondary',
  mb: '4px',                     // --new gap between label and input
});

// ── HaloDatePicker ────────────────────────────────────────────────────────────

export type HaloDatePickerProps = DatePickerProps<Dayjs>;

export function HaloDatePicker({ slotProps, slots, label, ...props }: HaloDatePickerProps) {
  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column' }}>
      {label && <Typography sx={labelSx}>{label}</Typography>}
      <DatePicker
        slots={{
          openPickerIcon: () => (
            <FontAwesomeIcon icon={faCalendarDay} style={{ fontSize: 14 }} />
          ),
          leftArrowIcon: () => (
            <FontAwesomeIcon icon={faAngleLeft} style={{ fontSize: 14 }} />
          ),
          rightArrowIcon: () => (
            <FontAwesomeIcon icon={faAngleRight} style={{ fontSize: 14 }} />
          ),
          switchViewIcon: () => (
            <FontAwesomeIcon icon={faAngleDown} style={{ fontSize: 14 }} />
          ),
          ...slots,
        }}
        slotProps={{
          textField: {
            size: 'small',
            sx: getInputSx,
            ...((slotProps?.textField as object) ?? {}),
          },
          popper: {
            sx: getPopperSx,
            ...slotProps?.popper,
          },
          ...slotProps,
        }}
        {...props}
      />
    </Box>
  );
}

// ── HaloTimePicker ────────────────────────────────────────────────────────────

export type HaloTimePickerProps = TimePickerProps<Dayjs>;

export function HaloTimePicker({ slotProps, slots, label, ...props }: HaloTimePickerProps) {
  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column' }}>
      {label && <Typography sx={labelSx}>{label}</Typography>}
      <TimePicker
        slots={{
          openPickerIcon: () => (
            <FontAwesomeIcon icon={faClock} style={{ fontSize: 14 }} />
          ),
          ...slots,
        }}
        slotProps={{
          textField: {
            size: 'small',
            sx: getInputSx,
            ...((slotProps?.textField as object) ?? {}),
          },
          popper: {
            sx: getPopperSx,
            ...slotProps?.popper,
          },
          ...slotProps,
        }}
        {...props}
      />
    </Box>
  );
}

// ── HaloDateRangePicker ───────────────────────────────────────────────────────
// Two side-by-side pickers. MUI X Pro DateRangePicker requires a paid license.

export interface HaloDateRangePickerProps {
  startLabel?: string;
  endLabel?: string;
  startValue?: Dayjs | null;
  endValue?: Dayjs | null;
  onStartChange?: (value: Dayjs | null) => void;
  onEndChange?: (value: Dayjs | null) => void;
  disabled?: boolean;
}

export function HaloDateRangePicker({
  startLabel = 'Start date',
  endLabel = 'End date',
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  disabled,
}: HaloDateRangePickerProps) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'flex-end', gap: 1 }}>
      <HaloDatePicker
        label={startLabel}
        value={startValue ?? null}
        onChange={onStartChange}
        disabled={disabled}
        maxDate={endValue ?? undefined}
      />
      {/* pb centers the dash within the 32px small input */}
      <Box sx={{ pb: '9px', color: 'text.secondary', fontSize: 14, flexShrink: 0 }}>–</Box>
      <HaloDatePicker
        label={endLabel}
        value={endValue ?? null}
        onChange={onEndChange}
        disabled={disabled}
        minDate={startValue ?? undefined}
      />
    </Box>
  );
}
