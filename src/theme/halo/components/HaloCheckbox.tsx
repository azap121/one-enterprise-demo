/**
 * HaloCheckbox
 *
 * Full Halo-spec wrapper around MUI Checkbox with FormControlLabel.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Checkbox> (node 11012:143645)
 * Tokens:
 *   icon size:       16px (FA Pro Light faSquare / faSquareCheck / faSquareMinus)
 *   icon padding:    px 2px, py 10px (MUI touch target)
 *   icon color:      text.secondary unchecked, primary.main checked/indeterminate
 *   error icon:      error.main for all states — pass color="error" to MUI Checkbox
 *   hover bg:        rgba(78,78,77,0.04)
 *   focus ring:      2px solid rgba(25,25,19,0.5)
 *   label text:      fontFamily from theme, fontWeightRegular (400), 14px,
 *                    lh 24px, ls 0.17px, text.secondary
 *   label disabled:  text.disabled
 *   gap (icon→label): 8px
 *
 * Usage:
 *   <HaloCheckbox label="Send notifications" />
 *   <HaloCheckbox label="Agree to terms" checked={val} onChange={setVal} />
 *   <HaloCheckbox label="Some items selected" indeterminate />
 *   <HaloCheckbox label="Disabled option" disabled />
 *   <HaloCheckbox color="error" label="Required field" />
 *
 *   // Without label:
 *   <HaloCheckbox checked={val} onChange={setVal} />
 */
import { faSquare, faSquareCheck, faSquareMinus } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Checkbox,
  type CheckboxProps,
  FormControlLabel,
  type FormControlLabelProps,
} from '@mui/material';
import React from 'react';

export interface HaloCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
  label?: React.ReactNode;
  onChange?: (checked: boolean) => void;
  /** Props forwarded to FormControlLabel (only used when label is provided) */
  labelProps?: Omit<FormControlLabelProps, 'control' | 'label'>;
}

export function HaloCheckbox({ label, onChange, labelProps, sx, ...props }: HaloCheckboxProps) {
  const checkbox = (
    <Checkbox
      size="small"
      icon={<FontAwesomeIcon icon={faSquare} style={{ fontSize: 16 }} />}
      checkedIcon={<FontAwesomeIcon icon={faSquareCheck} style={{ fontSize: 16 }} />}
      indeterminateIcon={<FontAwesomeIcon icon={faSquareMinus} style={{ fontSize: 16 }} />}
      onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
      sx={[
        {
          px: '2px',
          py: '10px',
          borderRadius: '4px',
          color: 'text.secondary',
          '&.Mui-checked:not(.MuiCheckbox-colorError)': { color: 'primary.main' },
          '&.MuiCheckbox-indeterminate:not(.MuiCheckbox-colorError)': { color: 'primary.main' },
          '&.MuiCheckbox-colorError': { color: 'error.main' },
          '&.Mui-disabled': { color: 'action.disabled' },
          '&:hover': { bgcolor: 'rgba(78,78,77,0.04)' },
          '&.Mui-focusVisible': {
            outline: '2px solid rgba(25,25,25,0.5)',
            outlineOffset: 0,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );

  if (!label) return checkbox;

  return (
    <FormControlLabel
      control={checkbox}
      label={label}
      sx={(theme) => ({
        ml: 0,
        gap: '8px',
        '& .MuiFormControlLabel-label': {
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightRegular ?? 400,
          fontSize: '0.875rem',
          lineHeight: '24px',
          letterSpacing: '0.17px',
          color: 'text.secondary',
        },
        '& .MuiFormControlLabel-label.Mui-disabled': {
          color: 'text.disabled',
        },
      })}
      {...labelProps}
    />
  );
}
