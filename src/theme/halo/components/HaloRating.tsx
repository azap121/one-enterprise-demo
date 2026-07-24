/**
 * HaloRating
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Rating> / <HALO_RatingStar> (node 11017:144103)
 *
 * Tokens:
 *   filled color:  _components/rating/activeFill   → #ef601a (orange)
 *   empty color:   _components/rating/enabledBorder → rgba(25,25,25,0.30)
 *   hover color:   same as filled (#ef601a)
 *   disabled:      MUI default opacity (0.38)
 *
 * Sizing (per Figma):
 *   medium — container 24×24px, icon vector 16px tall (natural width ~18px)
 *   small  — container 18×18px, icon vector 12px tall (natural width ~13.5px)
 *   The star is intentionally smaller than its container; Figma pads it.
 *
 *   label:       caption / text.secondary / 4px gap
 *   helper text: caption / text.secondary / inline 8px gap
 *   icons:       FA Pro Light faStar (empty) / FA Pro Solid faStar (filled)
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/pro-light-svg-icons';
import { faStar as faStarSolid } from '@fortawesome/pro-solid-svg-icons';
import { Box, Rating, type RatingProps, Typography } from '@mui/material';

// Figma tokens
const ACTIVE_FILL = '#ef601a';                    // _components/rating/activeFill
const ENABLED_BORDER = 'rgba(25, 25, 25, 0.30)'; // _components/rating/enabledBorder (#1919194d)

// Figma-spec sizes: container is the outer cell, iconHeight is the FA vector height
const SIZES: Record<NonNullable<RatingProps['size']>, { container: string; iconHeight: string }> = {
  small:  { container: '18px', iconHeight: '12px' },
  medium: { container: '24px', iconHeight: '16px' },
  large:  { container: '35px', iconHeight: '24px' },
};

export interface HaloRatingProps extends Omit<RatingProps, 'onChange'> {
  label?: string;
  helperText?: string;
  onChange?: (value: number | null) => void;
}

export function HaloRating({
  label,
  helperText,
  onChange,
  size = 'medium',
  sx,
  ...props
}: HaloRatingProps) {
  const { container, iconHeight } = SIZES[size ?? 'medium'];

  const starIcon = (icon: typeof faStarSolid) => (
    <FontAwesomeIcon icon={icon} style={{ height: iconHeight, width: 'auto' }} />
  );

  return (
    <Box>
      {label && (
        <Typography
          variant="caption"
          sx={{ display: 'block', color: 'text.secondary', mb: '4px' }}
        >
          {label}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Rating
          size={size}
          icon={starIcon(faStarSolid)}
          emptyIcon={starIcon(faStar)}
          onChange={onChange ? (_, value) => onChange(value) : undefined}
          sx={{
            // Each star cell: fixed square container with centered icon (matches Figma)
            '& .MuiRating-icon': {
              padding: 0,
              width: container,
              height: container,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            '& .MuiRating-iconFilled': { color: ACTIVE_FILL },
            '& .MuiRating-iconEmpty': { color: ENABLED_BORDER },
            '& .MuiRating-iconHover': { color: ACTIVE_FILL },
            ...sx,
          }}
          {...props}
        />

        {helperText && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary' }}
          >
            {helperText}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
