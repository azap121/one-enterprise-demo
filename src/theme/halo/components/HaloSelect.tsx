/**
 * HaloSelect
 *
 * Halo-spec outlined select matching Figma <HALO_Select>.
 * Built on MUI FormControl + Select.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Select> (node 6570:41424)
 * Tokens from get_design_context, node 6570:41424, May 2026:
 *   label text:        12px (0.75rem), weight 400, text/secondary (#6a6a69), lh 1.66, ls 0.15px
 *   value text:        14px (0.875rem), weight 400, text/primary (#323232), lh 24px, ls 0.15px
 *   helper text:       12px (0.75rem), weight 400, text/secondary, lh 1.66, ls 0.4px
 *   all text:          fontFamily from theme.typography
 *   enabled border:    rgba(25,25,25,0.23)  (_components/input/outlined/enabledBorder)
 *   hover border:      #191919              (_components/input/outlined/hoverBorder)
 *   focused border:    rgba(25,25,25,0.5), 2px  (primary/_states/outlinedBorder)
 *   error border:      error/main #c02641
 *   disabled border:   action/disabledBackground rgba(78,78,77,0.12)
 *   disabled text:     text/disabled rgba(78,78,77,0.38)
 *   border-radius:     8px  (theme.shape.borderRadius — var --borderradiusm)
 *   input min-height:  36px (container); content: py 6px + 24px line-height
 *   input padding:     pl 8px, pr 32px (8px container + 4px gap + 20px icon)
 *   chevron icon:      faAngleDown — FA Pro Light, right 8px, rotates 180° when open
 *   menu border:       elevation/outlined rgba(25,25,25,0.12)
 *   menu border-radius: 8px (--borderradiusm)
 *   menu padding:      pt 4px pb 8px
 *   menu item:         px 16px, py 8px, 14px, ls 0.17px
 *
 * Usage:
 *   <HaloSelect
 *     label="Category"
 *     helperText="Select one option"
 *     value={val}
 *     onChange={setVal}
 *     options={[
 *       { value: 'opt1', label: 'Option 1' },
 *       { value: 'opt2', label: 'Option 2' },
 *     ]}
 *   />
 *
 *   // Uncontrolled (no value/onChange needed):
 *   <HaloSelect label="Status" options={[...]} />
 *
 *   // Error state:
 *   <HaloSelect label="Status" error helperText="This field is required" options={[...]} />
 *
 *   // Alt background (for use on background.defaultAlt surfaces):
 *   <HaloSelect label="Type" background="alt" options={[...]} />
 *
 *   // Full width:
 *   <HaloSelect label="Type" fullWidth options={[...]} />
 */
import { faAngleDown } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography,
  type SxProps,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import React from 'react';

export interface HaloSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface HaloSelectProps {
  label?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  /** 'default' = background.paper (white), 'alt' = background.defaultAlt (#fafaf7) */
  background?: 'default' | 'alt';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  options?: HaloSelectOption[];
  fullWidth?: boolean;
  sx?: SxProps;
}

const SelectChevron = React.forwardRef<HTMLSpanElement, { className?: string }>(
  function SelectChevron({ className }, ref) {
    return (
      <Box
        component="span"
        ref={ref}
        className={className}
        sx={{ color: 'action.active', display: 'flex', alignItems: 'center', fontSize: 14 }}
      >
        <FontAwesomeIcon icon={faAngleDown} />
      </Box>
    );
  }
);

export function HaloSelect({
  label,
  helperText,
  error = false,
  disabled = false,
  background = 'default',
  placeholder,
  value,
  onChange,
  options = [],
  fullWidth = false,
  sx,
}: HaloSelectProps) {
  // background/default (#fff) → background.paper; background/alt (#fafaf7) → background.defaultAlt
  const bgcolor = background === 'alt' ? 'background.defaultAlt' : 'background.paper';

  const handleChange = (e: SelectChangeEvent<string | number>) => {
    onChange?.(e.target.value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: fullWidth ? '100%' : 220, ...sx }}>
      {label && (
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.66,
            letterSpacing: '0.15px',
            color: error ? 'error.main' : 'text.secondary',
            mb: '4px',
          }}
        >
          {label}
        </Typography>
      )}

      <FormControl size="small" variant="outlined" error={error} disabled={disabled} fullWidth>
        <Select
          value={value ?? ''}
          onChange={handleChange}
          displayEmpty={!!placeholder}
          IconComponent={SelectChevron}
          notched={false}
          renderValue={(selected) => {
            if (!selected && placeholder) {
              return (
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    lineHeight: '24px',
                    letterSpacing: '0.15px',
                    color: 'text.disabled',
                  }}
                >
                  {placeholder}
                </Typography>
              );
            }
            const opt = options.find((o) => o.value === selected);
            return opt?.label ?? String(selected);
          }}
          sx={(theme) => ({
            bgcolor,
            minHeight: '36px',
            borderRadius: `${theme.shape.borderRadius}px`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? 'error.main' : 'rgba(25,25,25,0.23)',
              borderRadius: `${theme.shape.borderRadius}px`,
            },
            '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? 'error.main' : 'text.primary',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? 'error.main' : 'rgba(25,25,25,0.5)',
              borderWidth: '2px',
            },
            '&.Mui-disabled': {
              bgcolor,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(78,78,77,0.12)',
              },
            },
            '& .MuiSelect-select': {
              fontFamily: theme.typography.fontFamily,
              fontSize: '0.875rem',
              fontWeight: 400,
              lineHeight: '24px',
              letterSpacing: '0.15px',
              color: 'text.primary',
              py: '6px',
              pl: '8px',
              // 32px = 8px container-right + 4px gap + ~20px icon width
              pr: '32px !important',
            },
            '& .MuiSelect-icon': {
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              transition: 'transform 200ms ease',
            },
            '& .MuiSelect-iconOpen': {
              transform: 'translateY(-50%) rotate(180deg)',
            },
          })}
          MenuProps={{
            PaperProps: {
              elevation: 0,
              sx: (theme) => ({
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'rgba(25,25,25,0.12)',
                borderRadius: `${theme.shape.borderRadius}px`,
                mt: '2px',
                '& .MuiList-root': {
                  pt: '4px',
                  pb: '8px',
                },
                '& .MuiMenuItem-root': {
                  fontFamily: theme.typography.fontFamily,
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  lineHeight: '24px',
                  letterSpacing: '0.17px',
                  color: 'text.primary',
                  px: '16px',
                  py: '8px',
                  '&:hover': { bgcolor: 'rgba(25,25,25,0.04)' },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(25,25,25,0.08)',
                    '&:hover': { bgcolor: 'rgba(25,25,25,0.12)' },
                  },
                },
              }),
            },
          }}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {helperText && (
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.66,
            letterSpacing: '0.4px',
            color: error ? 'error.main' : disabled ? 'text.disabled' : 'text.secondary',
            mt: '4px',
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
