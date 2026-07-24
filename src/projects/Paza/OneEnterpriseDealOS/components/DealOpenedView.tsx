import { Box, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import ChatComposer from './ChatComposer';
import { CALDERA_OPENED_COPY } from '../state/dealsFixtures';

interface Props {
  composerValue: string;
  onComposerChange: (value: string) => void;
  onComposerSubmit: (value: string) => void;
}

// Phase-1 deal-opened state for a promoted deal (Project Caldera). Concept only —
// Phase 2 builds the workspace. Mirrors the chat empty-state composition.
export default function DealOpenedView({ composerValue, onComposerChange, onComposerSubmit }: Props) {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, md: 4 },
        py: 4,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={2.5} alignItems="center" sx={{ width: 'min(780px, 100%)' }}>
        <Typography component="h1" sx={{ fontSize: 24, fontWeight: 400, color: 'text.primary', textAlign: 'center' }}>
          {CALDERA_OPENED_COPY.headline}
        </Typography>
        <Box sx={{ width: 'min(600px, 100%)' }}>
          <ChatComposer
            large
            showPoweredLine={false}
            value={composerValue}
            onChange={onComposerChange}
            onSubmit={onComposerSubmit}
          />
        </Box>
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
          {CALDERA_OPENED_COPY.suggestions.map((suggestion) => (
            <HaloButton
              key={suggestion}
              size="small"
              variant="outlined"
              onClick={() => onComposerSubmit(suggestion)}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {suggestion}
            </HaloButton>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
