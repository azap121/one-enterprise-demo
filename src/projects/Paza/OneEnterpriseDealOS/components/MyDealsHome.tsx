import { faArrowUp } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Box, InputBase, Paper, Stack, Tooltip, Typography, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HaloButton } from '~/theme/halo/components';
import { amber, moondust } from '~/theme/halo/theme';
import {
  HOME_COMPOSER_PLACEHOLDER,
  HOME_HEADLINE,
  HOME_SUGGESTIONS,
  type DealCard,
} from '../state/dealsFixtures';

interface Props {
  deals: DealCard[];
  // Id of a freshly created deal to animate in (scale + amber highlight).
  freshDealId: string | null;
  onOpenDeal: (deal: DealCard) => void;
  onStartSourcing: (query: string) => void;
  onAsk: (prompt: string) => void;
}

export default function MyDealsHome({ deals, freshDealId, onOpenDeal, onStartSourcing, onAsk }: Props) {
  const [value, setValue] = useState('');

  const submit = () => {
    const query = value.trim();
    if (!query) return;
    setValue('');
    onStartSourcing(query);
  };

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflowY: 'auto', bgcolor: 'background.paper' }}>
      <Box sx={{ maxWidth: 1080, mx: 'auto', px: { xs: 3, md: 6 }, py: { xs: 4, md: 6 } }}>
        <Typography component="h1" sx={{ fontSize: 28, fontWeight: 400, color: 'text.primary', mb: 4 }}>
          {HOME_HEADLINE}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 4,
          }}
        >
          {deals.map((deal) => (
            <DealCardTile key={deal.id} deal={deal} fresh={deal.id === freshDealId} onOpen={() => onOpenDeal(deal)} />
          ))}
        </Box>

        <Stack spacing={1.5} sx={{ maxWidth: 760, mx: 'auto' }}>
          <Paper
            component="form"
            elevation={0}
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              border: '1px solid',
              borderColor: alpha(moondust[900], 0.16),
              borderRadius: 3,
              bgcolor: 'background.paper',
              boxShadow: `0 8px 24px ${alpha(moondust[900], 0.1)}`,
            }}
          >
            <InputBase
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={HOME_COMPOSER_PLACEHOLDER}
              fullWidth
              inputProps={{ 'aria-label': HOME_COMPOSER_PLACEHOLDER }}
              sx={{ fontSize: 14 }}
            />
            <Tooltip title="Send prompt">
              <span>
                <IconButton
                  type="submit"
                  size="small"
                  aria-label="Send prompt"
                  disabled={!value.trim()}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '4px',
                    bgcolor: value.trim() ? 'text.primary' : 'action.disabledBackground',
                    color: value.trim() ? 'background.paper' : 'text.disabled',
                    '&:hover': { bgcolor: value.trim() ? 'text.secondary' : 'action.disabledBackground' },
                  }}
                >
                  <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: 11 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Paper>

          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
            {HOME_SUGGESTIONS.map((suggestion) => (
              <HaloButton
                key={suggestion.id}
                size="small"
                variant="outlined"
                onClick={() =>
                  suggestion.action === 'sourcing' ? onStartSourcing(suggestion.label) : onAsk(suggestion.label)
                }
                sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
              >
                {suggestion.label}
              </HaloButton>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function DealCardTile({ deal, fresh, onOpen }: { deal: DealCard; fresh: boolean; onOpen: () => void }) {
  const inert = deal.opens === 'none';

  return (
    <Box
      component="button"
      type="button"
      onClick={onOpen}
      sx={{
        textAlign: 'left',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        p: 2.25,
        cursor: 'pointer',
        font: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        transition: 'border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          borderColor: moondust[400],
          transform: 'translateY(-1px)',
          boxShadow: `0 6px 18px ${alpha(moondust[900], 0.08)}`,
        },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
        // Fresh-deal entrance: scale .98→1 + fade, then a brief amber highlight flash.
        ...(fresh
          ? {
              animation:
                'freshDealIn 320ms cubic-bezier(0.2, 0, 0, 1) forwards, freshDealFlash 600ms cubic-bezier(0.2, 0, 0, 1) 320ms forwards',
              '@keyframes freshDealIn': {
                from: { opacity: 0, transform: 'scale(0.98)' },
                to: { opacity: 1, transform: 'scale(1)' },
              },
              '@keyframes freshDealFlash': {
                '0%': { boxShadow: `0 0 0 2px ${alpha(amber[500], 0.6)}`, borderColor: amber[400] },
                '100%': { boxShadow: '0 0 0 0 rgba(0,0,0,0)', borderColor: moondust[200] },
              },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }
          : null),
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Typography sx={{ fontSize: 16, fontWeight: 650, color: 'text.primary' }}>{deal.name}</Typography>
        <Typography sx={{ fontSize: 11.5, color: 'text.disabled', whiteSpace: 'nowrap', pt: 0.25 }}>
          {deal.updatedAgo}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
        <DirectionBadge direction={deal.direction} desk={deal.desk} />
        <StageChip label={deal.stage} />
      </Stack>

      <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>{deal.status}</Typography>

      {inert ? null : (
        <Typography sx={{ fontSize: 12, color: amber[700], fontWeight: 600, mt: 0.25 }}>Open deal →</Typography>
      )}
    </Box>
  );
}

function DirectionBadge({ direction, desk }: { direction: string; desk?: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 22,
        px: 0.9,
        borderRadius: '999px',
        bgcolor: 'background.defaultAlt',
        border: '1px solid',
        borderColor: 'divider',
        fontSize: 11.5,
        fontWeight: 500,
        color: 'text.secondary',
      }}
    >
      {desk ? `${direction} · ${desk}` : direction}
    </Box>
  );
}

function StageChip({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 22,
        px: 0.9,
        borderRadius: '999px',
        bgcolor: alpha(moondust[700], 0.08),
        fontSize: 11.5,
        fontWeight: 600,
        color: 'text.primary',
      }}
    >
      {label}
    </Box>
  );
}
