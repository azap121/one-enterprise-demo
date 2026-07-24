/**
 * HaloSwitch
 *
 * Figma: ⭐️ HALO Design System → Input / <HALO_Switch> (node 11022:144509)
 *
 * Visual tokens (_components/switch/) live in theme.ts → haloSwitchOverrides.
 * This file adds the FormControlLabel and FormGroup composition layer only.
 *
 * Exports:
 *   HaloSwitch            — bare Switch with optional FormControlLabel
 *   HaloSwitchFormGroup   — FormControl wrapping a FormGroup of labelled switches
 *
 * Usage:
 *   <HaloSwitch />
 *   <HaloSwitch checked onChange={setVal} />
 *   <HaloSwitch label="Notifications" checked={val} onChange={setVal} />
 *   <HaloSwitch label="Dark mode" labelPlacement="start" checked={val} onChange={setVal} />
 *   <HaloSwitch disabled />
 *
 *   <HaloSwitchFormGroup
 *     label="Label"
 *     helperText="Helper text"
 *     items={[
 *       { label: 'Option A', checked: true, onChange: setA },
 *       { label: 'Option B', checked: false, onChange: setB },
 *     ]}
 *   />
 */
import {
  FormControl,
  FormControlLabel,
  type FormControlLabelProps,
  FormGroup,
  FormHelperText,
  FormLabel,
  Switch,
  type SwitchProps,
  type SxProps,
  type Theme,
} from '@mui/material';
import React from 'react';

// ─── HaloSwitch ───────────────────────────────────────────────────────────────

export interface HaloSwitchProps extends Omit<SwitchProps, 'onChange'> {
  /** Renders a FormControlLabel when provided */
  label?: React.ReactNode;
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
  onChange?: (checked: boolean) => void;
  /** Props forwarded to FormControlLabel (only when label is provided) */
  labelProps?: Omit<FormControlLabelProps, 'control' | 'label' | 'labelPlacement'>;
}

export function HaloSwitch({
  label,
  labelPlacement = 'end',
  onChange,
  labelProps,
  sx,
  ...props
}: HaloSwitchProps) {
  const switchEl = (
    <Switch
      size="medium"
      color="primary"
      onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
      sx={sx}
      {...props}
    />
  );

  if (!label) return switchEl;

  return (
    <FormControlLabel
      control={switchEl}
      label={label}
      labelPlacement={labelPlacement}
      sx={(theme) => ({
        ml: 0,
        gap: theme.spacing(1),
        '& .MuiFormControlLabel-label': {
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightRegular,
          fontSize: theme.typography.body2.fontSize,
          lineHeight: theme.typography.body2.lineHeight,
          letterSpacing: theme.typography.body2.letterSpacing,
          color: theme.palette.text.secondary,
        },
        '& .MuiFormControlLabel-label.Mui-disabled': {
          color: theme.palette.text.disabled,
        },
      })}
      {...labelProps}
    />
  );
}

// ─── HaloSwitchFormGroup ──────────────────────────────────────────────────────

export interface HaloSwitchFormGroupItem {
  label: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export interface HaloSwitchFormGroupProps {
  /** FormLabel displayed above the group */
  label?: React.ReactNode;
  /** FormHelperText displayed below the group */
  helperText?: React.ReactNode;
  items: HaloSwitchFormGroupItem[];
  /** Disables all switches in the group */
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

export function HaloSwitchFormGroup({
  label,
  helperText,
  items,
  disabled = false,
  sx,
}: HaloSwitchFormGroupProps) {
  return (
    <FormControl disabled={disabled} sx={sx}>
      {label && (
        <FormLabel
          sx={(theme) => ({
            fontFamily: theme.typography.fontFamily,
            fontWeight: theme.typography.fontWeightRegular,
            fontSize: theme.typography.caption.fontSize,
            lineHeight: theme.typography.caption.lineHeight,
            letterSpacing: theme.typography.caption.letterSpacing,
            color: theme.palette.text.secondary,
            '&.Mui-disabled': { color: theme.palette.text.disabled },
            '&.Mui-focused': { color: theme.palette.text.secondary },
          })}
        >
          {label}
        </FormLabel>
      )}
      <FormGroup>
        {items.map((item, i) => (
          <HaloSwitch
            key={i}
            label={item.label}
            checked={item.checked}
            onChange={item.onChange}
            disabled={disabled || item.disabled}
          />
        ))}
      </FormGroup>
      {helperText && (
        <FormHelperText
          sx={(theme) => ({
            fontFamily: theme.typography.fontFamily,
            fontWeight: theme.typography.fontWeightRegular,
            fontSize: theme.typography.caption.fontSize,
            lineHeight: theme.typography.caption.lineHeight,
            letterSpacing: theme.typography.caption.letterSpacing,
            color: disabled ? theme.palette.text.disabled : theme.palette.text.secondary,
          })}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}
