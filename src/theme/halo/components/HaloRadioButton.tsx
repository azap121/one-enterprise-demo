/**
 * HaloRadioButton
 *
 * Halo-spec single radio — a FormControlLabel wrapping a Radio.
 * Use inside MUI RadioGroup for grouped selections.
 *
 * Figma: ⭐️ [HALO] Design System → <FormControlLabel> | Radio (node 634:100262)
 * Tokens (get_variable_defs, node 634:100262):
 *   container:         flex, gap 8px, pr 4px (--new), border-radius 4px (--borderradiuss)
 *   focus ring:        2px solid rgba(25,25,25,0.5) (primary/_states/outlinedBorder)
 *                      applied to the container via :has(.Mui-focusVisible)
 *   icon:              16px FA Pro Light — faCircle (unchecked), faCircleDot (checked)
 *   icon touch target: px 2px, py 10px, border-radius 100px
 *   Primary unchecked: text.secondary (#6a6a69)
 *   Primary checked:   primary.main (#4e4e4d)
 *   Error all states:  error.main (#c02641)
 *   Disabled:          action.disabled (rgba(78,78,77,0.38))
 *   hover:             icon darkens to primary/dark (#191919) — no background fill
 *   label:             fontFamily, fontWeightRegular (400), 14px,
 *                      lh 1.43, ls 0.17px  (typography/body2)
 *   label Primary:     text.secondary (#6a6a69)
 *   label Error:       error.main (#c02641)
 *   label Disabled:    text.disabled (rgba(78,78,77,0.38))
 *
 * Usage:
 *   // Inside RadioGroup (most common):
 *   <RadioGroup value={val} onChange={(e) => setVal(e.target.value)}>
 *     <HaloRadioButton value="view" label="View only" />
 *     <HaloRadioButton value="edit" label="Edit" />
 *     <HaloRadioButton value="manage" label="Manage" />
 *   </RadioGroup>
 *
 *   // Error state (full group in error):
 *   <RadioGroup value={val}>
 *     <HaloRadioButton value="a" label="Option A" color="error" />
 *     <HaloRadioButton value="b" label="Option B" color="error" />
 *   </RadioGroup>
 *
 *   // Standalone controlled:
 *   <HaloRadioButton value="yes" label="Yes" checked={val === 'yes'} onChange={setVal} />
 */
import { faCircle } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  FormControlLabel,
  type FormControlLabelProps,
  Radio,
  type SxProps,
} from '@mui/material';
import React from 'react';

// Figma _circle-dot icon custom light HALO (node 23514:22473):
// outer thin ring + solid inner dot — faCircleDot (Pro Light) renders the inner
// dot as a hollow outline, so we use this inline SVG instead.
// className="svg-inline--fa" matches FontAwesomeIcon's CSS sizing exactly
// (height:1em, display:inline-block, vertical-align:-0.125em), preventing
// layout shift when toggling between the unchecked FA icon and this checked icon.
function RadioCheckedSvg({ style }: { style?: React.CSSProperties }) {
  return (
    <svg aria-hidden="true" focusable="false" className="svg-inline--fa" viewBox="0 0 16 16" style={style}>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="8" cy="8" r="3.5" fill="currentColor" />
    </svg>
  );
}

export interface HaloRadioButtonProps {
  value: string;
  label?: React.ReactNode;
  checked?: boolean;
  /** 'primary' (default) or 'error' — controls icon and label color */
  color?: 'primary' | 'error';
  disabled?: boolean;
  onChange?: (value: string) => void;
  sx?: SxProps;
  /** Props forwarded to the underlying FormControlLabel */
  labelProps?: Omit<FormControlLabelProps, 'control' | 'label' | 'value' | 'disabled' | 'checked'>;
}

export function HaloRadioButton({
  value,
  label,
  checked,
  color = 'primary',
  disabled,
  onChange,
  sx,
  labelProps,
}: HaloRadioButtonProps) {
  const isError = color === 'error';

  return (
    <FormControlLabel
      value={value}
      disabled={disabled}
      checked={checked}
      control={
        <Radio
          size="small"
          disableRipple
          icon={<FontAwesomeIcon icon={faCircle} style={{ fontSize: 16 }} />}
          checkedIcon={<RadioCheckedSvg style={{ fontSize: 16 }} />}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          sx={{
            px: '2px',
            py: '10px',
            borderRadius: '100px',
            color: isError ? 'error.main' : 'text.secondary',
            '&.Mui-checked': { color: isError ? 'error.main' : 'primary.main' },
            '&.Mui-disabled': { color: 'action.disabled' },
            // Figma hover: icon darkens to primary/dark (#191919) — no background fill
            '&:hover': { color: isError ? 'error.dark' : 'primary.dark' },
          }}
        />
      }
      label={label}
      sx={[
        (theme) => ({
          ml: 0,
          gap: '8px',
          pr: '4px',
          borderRadius: '4px', // --borderradiuss
          // Focus ring wraps the full label+icon container (matches Figma Focused state)
          '&:has(.Mui-focusVisible)': {
            outline: '2px solid rgba(25,25,25,0.5)',
            outlineOffset: 0,
          },
          '& .MuiFormControlLabel-label': {
            fontFamily: theme.typography.fontFamily,
            fontWeight: theme.typography.fontWeightRegular ?? 400,
            fontSize: '0.875rem',
            lineHeight: 1.43,
            letterSpacing: '0.17px',
            color: isError ? 'error.main' : 'text.secondary',
          },
          '& .MuiFormControlLabel-label.Mui-disabled': {
            color: 'text.disabled',
          },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...labelProps}
    />
  );
}
