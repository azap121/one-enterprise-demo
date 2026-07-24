/**
 * HaloTextField
 *
 * Halo-spec outlined text input matching Figma <HALO_TextField>.
 * Built on MUI TextField — label rendered above input (non-floating).
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_TextField> (node 6570:48313)
 * Tokens from get_variable_defs + get_design_context, node 6570:48313, May 2026:
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
 *   border-radius:     8px  (theme.shape.borderRadius)
 *   input min-height:  36px (container); content: py 6px + 24px line-height
 *   input padding:     container px 8px (on root); input horizontal padding 0
 *   adornment gap:     8px (InputAdornment mr/ml)
 *
 * Usage:
 *   <HaloTextField label="Email" value={val} onChange={setVal} />
 *
 *   // Uncontrolled (browser manages state):
 *   <HaloTextField label="Notes" />
 *
 *   // Alt background (for use on background.default surfaces):
 *   <HaloTextField label="Name" background="alt" />
 *
 *   // Error state:
 *   <HaloTextField label="Required" error helperText="This field is required" />
 *
 *   // Multiline:
 *   <HaloTextField label="Notes" multiline minRows={3} />
 *
 *   // Character count:
 *   <HaloTextField label="Bio" characterCount maxLength={100} value={bio} onChange={setBio} />
 *
 *   // Adornments:
 *   <HaloTextField
 *     label="Search"
 *     startAdornment={<FontAwesomeIcon icon={faMagnifyingGlass} />}
 *   />
 */
import {
  Box,
  InputAdornment,
  TextField,
  Typography,
  type SxProps,
} from '@mui/material';
import React from 'react';

export interface HaloTextFieldProps {
  label?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  /** 'default' = background.paper (white), 'alt' = background.default (#fafaf7) */
  background?: 'default' | 'alt';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  /** Show character count alongside helper text. Requires maxLength. */
  characterCount?: boolean;
  maxLength?: number;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
  type?: string;
  /** Uncontrolled default value — use when you don't need to manage state */
  defaultValue?: string;
  sx?: SxProps;
}

export function HaloTextField({
  label,
  helperText,
  error = false,
  disabled = false,
  background = 'default',
  placeholder,
  value,
  onChange,
  multiline = false,
  rows,
  minRows,
  maxRows,
  characterCount = false,
  maxLength,
  startAdornment,
  endAdornment,
  fullWidth = false,
  type,
  defaultValue,
  sx,
}: HaloTextFieldProps) {
  // background/default (#fff) → background.paper; background/alt (#fafaf7) → background.defaultAlt
  const bgcolor = background === 'alt' ? 'background.defaultAlt' : 'background.paper';

  const showCharCount = characterCount && maxLength !== undefined;
  const showHelperRow = helperText || showCharCount;

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

      <TextField
        variant="outlined"
        size="small"
        disabled={disabled}
        error={error}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        multiline={multiline}
        rows={rows}
        minRows={multiline ? (minRows ?? 3) : undefined}
        maxRows={maxRows}
        type={type}
        fullWidth={fullWidth}
        inputProps={{ maxLength }}
        InputProps={{
          notched: false,
          ...(startAdornment && {
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: '8px', ml: 0, color: 'action.active' }}>
                {startAdornment}
              </InputAdornment>
            ),
          }),
          ...(endAdornment && {
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: '8px', mr: 0, color: 'action.active' }}>
                {endAdornment}
              </InputAdornment>
            ),
          }),
        }}
        sx={(theme) => ({
          '& .MuiOutlinedInput-root': {
            minHeight: '36px',
            bgcolor,
            borderRadius: `${theme.shape.borderRadius}px`,
            // Outer horizontal padding lives on the root container (matches Figma px-[8px] on container)
            paddingLeft: '8px',
            paddingRight: '8px',
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
          },
          // Multiline: MUI puts root-level padding on .MuiInputBase-multiline by default —
          // zero it out so only the textarea's py controls vertical spacing.
          '& .MuiInputBase-multiline': {
            paddingTop: 0,
            paddingBottom: 0,
          },
          '& .MuiInputBase-input': {
            fontFamily: theme.typography.fontFamily,
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: '24px',
            letterSpacing: '0.15px',
            color: 'text.primary',
            py: '6px',
            // Horizontal padding is on the root; input itself gets none so adornment
            // gaps come only from InputAdornment mr/ml (8px each).
            px: 0,
            '&.Mui-disabled': {
              // MUI uses WebkitTextFillColor to override disabled colour
              WebkitTextFillColor: 'rgba(78,78,77,0.38)',
            },
            '&::placeholder': {
              color: 'text.disabled',
              opacity: 1,
            },
          },
        })}
      />

      {showHelperRow && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: '4px' }}>
          {helperText && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 400,
                lineHeight: 1.66,
                letterSpacing: '0.4px',
                color: error ? 'error.main' : disabled ? 'text.disabled' : 'text.secondary',
                flex: 1,
              }}
            >
              {helperText}
            </Typography>
          )}
          {showCharCount && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 400,
                lineHeight: 1.66,
                letterSpacing: '0.4px',
                color: disabled ? 'text.disabled' : 'text.secondary',
                flexShrink: 0,
                textAlign: 'right',
                ml: helperText ? 1 : 'auto',
              }}
            >
              {(value ?? '').length}/{maxLength}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
