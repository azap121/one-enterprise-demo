/**
 * HaloAutocomplete
 *
 * Full Halo-spec wrapper around MUI Autocomplete.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Autocomplete> (node 11011:142571)
 * Tokens: same border/text values as HaloTextField / HaloSelect
 *   label text:        12px (0.75rem), weight 400, text/secondary (#6a6a69), lh 1.66, ls 0.15px
 *   value text:        14px (0.875rem), weight 400, text/primary (#323232), lh 24px, ls 0.15px
 *   helper text:       12px (0.75rem), weight 400, text/secondary, lh 1.66, ls 0.4px
 *   all text:          fontFamily from theme.typography
 *   enabled border:    rgba(25,25,25,0.23)
 *   hover border:      #191919
 *   focused border:    rgba(25,25,25,0.5), 2px
 *   error border:      error/main #c02641
 *   disabled border:   action/disabledBackground rgba(78,78,77,0.12)
 *   border-radius:     8px (theme.shape.borderRadius — var --borderradiusm)
 *   input min-height:  36px; content: py 6px + 24px line-height
 *   input padding:     pl 8px on root, px 0 on input element
 *   chip (multi):      bg #F7F6F2, border-radius 100px
 *   dropdown icon:     faAngleDown
 *   clear icon:        faXmark
 *   check icon:        faCheck (selected option)
 *   menu border:       rgba(25,25,25,0.12)
 *   menu border-radius: 8px (--borderradiusm)
 *   menu item:         px 16px, py 8px, 14px, ls 0.17px
 *
 * Usage:
 *   <HaloAutocomplete
 *     label="Assignee"
 *     options={users}
 *     getOptionLabel={(u) => u.name}
 *     value={selected}
 *     onChange={setSelected}
 *   />
 *
 *   // Multiple with chips:
 *   <HaloAutocomplete
 *     multiple
 *     label="Tags"
 *     options={['Legal', 'Finance', 'Operations']}
 *     value={tags}
 *     onChange={setTags}
 *   />
 *
 *   // Freesolo (create new):
 *   <HaloAutocomplete freeSolo label="Deal name" options={recentDeals} />
 */
import { faAngleDown, faCheck, faXmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Autocomplete,
  type AutocompleteProps,
  Box,
  Chip,
  type SxProps,
  TextField,
  Typography,
} from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HaloAutocompleteProps<T = any> extends Omit<
  AutocompleteProps<T, boolean, boolean, boolean>,
  'renderInput' | 'onChange'
> {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  /** 'default' = background.paper (white), 'alt' = background.defaultAlt (#fafaf7) */
  background?: 'default' | 'alt';
  onChange?: (value: T | T[] | null) => void;
  fullWidth?: boolean;
  sx?: SxProps;
}

export function HaloAutocomplete<T = string>({
  label,
  placeholder,
  helperText,
  error,
  disabled,
  background = 'default',
  onChange,
  fullWidth = false,
  sx,
  ...props
}: HaloAutocompleteProps<T>) {
  const bgcolor = background === 'alt' ? 'background.defaultAlt' : 'background.paper';

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

      <Autocomplete
        size="small"
        disabled={disabled}
        popupIcon={<FontAwesomeIcon icon={faAngleDown} style={{ fontSize: 14 }} />}
        clearIcon={<FontAwesomeIcon icon={faXmark} style={{ fontSize: 12 }} />}
        renderOption={(optProps, option, { selected }) => (
          <Box
            component="li"
            {...optProps}
            sx={{
              fontWeight: 400,
              fontSize: '0.875rem',
              lineHeight: '24px',
              letterSpacing: '0.17px',
              color: 'text.primary',
              px: '16px !important',
              py: '8px !important',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {selected && (
              <FontAwesomeIcon icon={faCheck} style={{ fontSize: 12, flexShrink: 0 }} />
            )}
            <span style={{ flex: 1 }}>{props.getOptionLabel?.(option) ?? String(option)}</span>
          </Box>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const tagProps = getTagProps({ index });
            return (
              <Chip
                label={props.getOptionLabel?.(option) ?? String(option)}
                size="small"
                deleteIcon={<FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />}
                sx={{
                  fontWeight: 400,
                  fontSize: '0.8125rem',
                  backgroundColor: '#F7F6F2',
                  borderRadius: '100px',
                  height: 22,
                  '& .MuiChip-label': { px: '6px' },
                  '& .MuiChip-deleteIcon': { fontSize: 10, mr: '4px' },
                }}
                {...tagProps}
              />
            );
          })
        }
        slotProps={{
          paper: {
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
              '& .MuiAutocomplete-option': {
                fontFamily: theme.typography.fontFamily,
                fontSize: '0.875rem',
                fontWeight: 400,
                lineHeight: '24px',
                letterSpacing: '0.17px',
                color: 'text.primary',
                px: '16px',
                py: '8px',
                '&:hover': { bgcolor: 'rgba(25,25,25,0.04)' },
                '&[aria-selected="true"]': {
                  bgcolor: 'rgba(25,25,25,0.08)',
                  '&:hover': { bgcolor: 'rgba(25,25,25,0.12)' },
                },
              },
            }),
          },
        }}
        onChange={onChange ? (_, value) => onChange(value as T | T[] | null) : undefined}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            error={error}
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              notched: false,
              sx: { bgcolor },
            }}
            sx={(theme) => ({
              '& .MuiOutlinedInput-root': {
                minHeight: '36px',
                borderRadius: `${theme.shape.borderRadius}px`,
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
              '& .MuiInputBase-multiline': {
                paddingTop: 0,
                paddingBottom: 0,
              },
              '& .MuiInputBase-input': {
                fontFamily: theme.typography.fontFamily,
                fontWeight: 400,
                fontSize: '0.875rem',
                lineHeight: '24px',
                letterSpacing: '0.15px',
                py: '6px',
                px: 0,
                '&.Mui-disabled': {
                  WebkitTextFillColor: 'rgba(78,78,77,0.38)',
                },
                '&::placeholder': {
                  color: 'text.disabled',
                  opacity: 1,
                },
              },
            })}
          />
        )}
        {...props}
      />

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
