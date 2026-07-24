import { faChevronRight, faLocationDot, faMoneyBill1, faTag, faXmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { moondust } from '~/theme/halo/theme';
import {
  SOURCING_COPY,
  SOURCING_CRITERIA,
  SOURCING_QUICK_SUGGESTIONS,
} from '../state/sourcingScenario';
import type { WorkspaceState } from '../state/types';

interface Props {
  state: WorkspaceState;
  onToggleTerms: () => void;
  onRemoveTerm: (termId: string) => void;
  onNarrow: () => void;
  onNoOpSuggestion: () => void;
}

const cardEnterSx = {
  opacity: 0,
  transform: 'translateY(8px)',
  animation: 'sourcingParseFade 320ms cubic-bezier(0.2, 0, 0, 1) forwards',
  '@keyframes sourcingParseFade': {
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    opacity: 1,
    transform: 'none',
    animation: 'none',
  },
} as const;

// State 3 (parse) + State 4 (quick suggestions) rendered as one assistant card.
export default function SourcingParseCard({ state, onToggleTerms, onRemoveTerm, onNarrow, onNoOpSuggestion }: Props) {
  const remainingTerms = SOURCING_CRITERIA.terms.filter((_, index) => !state.sourcingRemovedTermIds.includes(String(index)));
  const overflowCount = Math.max(remainingTerms.length - 1, 0);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        bgcolor: 'background.paper',
        p: 2.5,
        maxWidth: 680,
        ...cardEnterSx,
      }}
    >
      <Stack spacing={2}>
        <Typography sx={{ fontSize: 14, color: 'text.primary', lineHeight: 1.6 }}>
          {SOURCING_COPY.interpretation}
        </Typography>

        <Stack spacing={1.25}>
          <CriteriaRow icon={faLocationDot} label="Headquarters">
            <ValueChip label={SOURCING_CRITERIA.headquarters} />
          </CriteriaRow>

          <CriteriaRow icon={faTag} label="Terms Included">
            {state.sourcingTermsExpanded ? (
              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                {remainingTerms.map((term, index) => (
                  <Stack key={term} direction="row" spacing={0.5} alignItems="center">
                    <TermChip
                      label={term}
                      onRemove={() => onRemoveTerm(String(SOURCING_CRITERIA.terms.indexOf(term)))}
                    />
                    {index < remainingTerms.length - 1 ? (
                      <Typography component="span" sx={{ fontSize: 11, color: 'text.disabled', px: 0.25 }}>
                        OR
                      </Typography>
                    ) : null}
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ValueChip label={SOURCING_CRITERIA.primaryTerm} />
                {overflowCount > 0 ? (
                  <Box
                    component="button"
                    type="button"
                    onClick={onToggleTerms}
                    aria-label={`Show ${overflowCount} more keyword filters`}
                    sx={countChipSx}
                  >
                    +{overflowCount}
                  </Box>
                ) : null}
              </Stack>
            )}
          </CriteriaRow>

          <CriteriaRow icon={faMoneyBill1} label="Revenue">
            <ValueChip label={SOURCING_CRITERIA.revenue} />
          </CriteriaRow>
        </Stack>

        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {SOURCING_COPY.followOn}
        </Typography>

        {/* State 4 — quick suggestions */}
        <Stack spacing={1}>
          <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {SOURCING_COPY.quickSuggestionsHeader}
          </Typography>
          <Stack spacing={0.75}>
            {SOURCING_QUICK_SUGGESTIONS.map((suggestion) => (
              <Box
                key={suggestion.id}
                component="button"
                type="button"
                disabled={suggestion.wired && state.sourcingNarrowed}
                onClick={() => (suggestion.wired ? onNarrow() : onNoOpSuggestion())}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  px: 1.5,
                  py: 1.1,
                  cursor: suggestion.wired && state.sourcingNarrowed ? 'default' : 'pointer',
                  font: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'border-color 160ms ease, background-color 160ms ease',
                  '&:hover:not(:disabled)': { borderColor: moondust[400], bgcolor: 'background.defaultAlt' },
                  '&:disabled': { opacity: 0.5 },
                  '&:focus-visible': { outline: '2px solid', outlineColor: 'action.focus', outlineOffset: 1 },
                }}
              >
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 13, color: 'text.primary', lineHeight: 1.5 }}>
                  {suggestion.label}
                </Typography>
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11, flexShrink: 0, opacity: 0.5 }} />
              </Box>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

function CriteriaRow({
  icon,
  label,
  children,
}: {
  icon: typeof faTag;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ width: 148, flexShrink: 0 }}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: 12, opacity: 0.6 }} />
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 9, opacity: 0.4 }} />
      </Stack>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}

function ValueChip({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 26,
        px: 1,
        borderRadius: '999px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.defaultAlt',
        fontSize: 12.5,
        color: 'text.primary',
      }}
    >
      {label}
    </Box>
  );
}

function TermChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        minHeight: 26,
        pl: 1,
        pr: 0.5,
        borderRadius: '999px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.defaultAlt',
        fontSize: 12.5,
        color: 'text.primary',
      }}
    >
      {label}
      <Box
        component="button"
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        sx={{
          border: 0,
          p: 0,
          width: 16,
          height: 16,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          cursor: 'pointer',
          bgcolor: 'transparent',
          color: 'text.secondary',
          '&:hover': { bgcolor: alpha(moondust[900], 0.08), color: 'text.primary' },
        }}
      >
        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 9 }} />
      </Box>
    </Box>
  );
}

const countChipSx = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 26,
  px: 1,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '999px',
  bgcolor: 'background.paper',
  color: 'text.secondary',
  cursor: 'pointer',
  font: 'inherit',
  fontSize: 12.5,
  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'action.focus', outlineOffset: 1 },
} as const;
