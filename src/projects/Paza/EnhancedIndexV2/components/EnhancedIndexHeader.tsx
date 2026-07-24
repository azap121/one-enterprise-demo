import { Box, Button, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faFolder, faPenToSquare, faXmark } from '@fortawesome/pro-light-svg-icons';
import { faAiSparkle } from '~/shared/icons/faAiSparkle';
import type { Action, State } from '../state/types';
import { amber, moondust } from '~/theme/halo/theme';

interface Props {
  state: State;
  dispatch: (a: Action) => void;
  onCancel: () => void;
}

export default function EnhancedIndexHeader({ state, dispatch, onCancel }: Props) {
  const ctaLabel = state.stage === 'configure' ? 'Generate Enhanced Index' : 'Apply Changes';
  const ctaAction: Action = state.stage === 'configure' ? { type: 'GENERATE' } : { type: 'APPLY' };
  const ctaDisabled =
    (state.stage === 'review' && state.proposals.length === 0) ||
    (state.stage !== 'configure' && state.stage !== 'review');

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 3, py: 2 }}>
        <Box
          sx={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}
          aria-hidden
        >
          <Box sx={{ color: 'primary.main', display: 'flex' }}>
            <FontAwesomeIcon icon={faFolder} style={{ fontSize: 22 }} />
          </Box>
          {/* Rounded white mask cuts the folder behind the sparkle. */}
          <Box
            sx={{
              position: 'absolute',
              top: -3,
              right: -5,
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon
              icon={faAiSparkle as unknown as IconProp}
              style={{ width: 12, height: 12, color: amber[600] }}
            />
          </Box>
        </Box>
        <Typography variant="h6">Enhanced Index</Typography>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', px: 3 }}>
          <TextField
            value={state.scenario.prompt}
            size="small"
            variant="outlined"
            placeholder="Describe how you want the file room reorganized…"
            sx={{ width: 600 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 14, color: moondust[500] }} />
                </InputAdornment>
              ),
            }}
            onChange={() => { /* demo only */ }}
          />
        </Box>
        <Button
          variant="contained"
          disabled={ctaDisabled}
          onClick={() => dispatch(ctaAction)}
        >
          {ctaLabel}
        </Button>
        <Tooltip title="Close Enhanced Index">
          <IconButton onClick={onCancel} size="small" aria-label="Close Enhanced Index">
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
