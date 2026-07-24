import { Box, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { jade, tanzanite } from '~/theme/halo/theme';
import { CALDERA_OPENED_COPY, CALDERA_SUGGESTIONS } from '../state/dealsFixtures';

interface Props {
  onSuggestion: (action: (typeof CALDERA_SUGGESTIONS)[number]['action']) => void;
}

// The Caldera deal chat empty-state: headline + deal context strip + suggestion chips.
// Rendered inside the chat column via the 'deal-empty' message kind.
export default function DealChatIntro({ onSuggestion }: Props) {
  return (
    <Stack spacing={2}>
      <Typography component="h1" sx={{ fontSize: 22, fontWeight: 400, color: 'text.primary' }}>
        {CALDERA_OPENED_COPY.headline}
      </Typography>

      {/* Deal context strip: direction badge + stage chip + carried-context chips */}
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
        <ContextBadge label={CALDERA_OPENED_COPY.directionBadge} tone="indigo" />
        <ContextBadge label={CALDERA_OPENED_COPY.stageChip} tone="green" />
        <Box sx={{ width: '1px', height: 16, bgcolor: 'divider', mx: 0.25 }} />
        {CALDERA_OPENED_COPY.contextChips.map((chip) => (
          <ContextBadge key={chip} label={chip} tone="neutral" />
        ))}
      </Stack>

      {/* Suggestion chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
        {CALDERA_SUGGESTIONS.map((suggestion) => (
          <HaloButton
            key={suggestion.id}
            size="small"
            variant="outlined"
            onClick={() => onSuggestion(suggestion.action)}
            sx={{ textTransform: 'none' }}
          >
            {suggestion.label}
          </HaloButton>
        ))}
      </Stack>
    </Stack>
  );
}

function ContextBadge({ label, tone }: { label: string; tone: 'indigo' | 'green' | 'neutral' }) {
  const palette =
    tone === 'indigo'
      ? { bg: tanzanite[50], fg: tanzanite[700] }
      : tone === 'green'
        ? { bg: jade[50], fg: jade[700] }
        : { bg: 'background.defaultAlt', fg: 'text.secondary' };
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 24,
        px: 1,
        borderRadius: '999px',
        bgcolor: palette.bg,
        color: palette.fg,
        fontSize: 11.5,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}
