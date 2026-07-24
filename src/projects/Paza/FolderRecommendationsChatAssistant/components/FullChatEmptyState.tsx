import { faFolder, faListCheck, faMagnifyingGlass } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import ChatComposer from './ChatComposer';
import { COPY } from '../state/copy';

const fadeUpEntranceSx = (delayMs: number, durationMs = 380) => ({
  opacity: 0,
  transform: 'translateY(10px)',
  animation: `emptyChatFadeUp ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1) ${delayMs}ms forwards`,
  '@keyframes emptyChatFadeUp': {
    from: {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    opacity: 1,
    transform: 'none',
    animation: 'none',
  },
});

interface Props {
  composerValue: string;
  attachedFileIds: string[];
  composerLoading?: boolean;
  onComposerChange: (value: string) => void;
  onComposerSubmit: (value: string) => void;
  onAttachmentsChange: (fileIds: string[]) => void;
  onSelectFolderPrompt: () => void;
}

export default function FullChatEmptyState({
  composerValue,
  attachedFileIds,
  composerLoading = false,
  onComposerChange,
  onComposerSubmit,
  onAttachmentsChange,
  onSelectFolderPrompt,
}: Props) {
  return (
    <Box
      sx={{
        height: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      <Stack spacing={2.5} alignItems="center" sx={{ width: 'min(780px, 100%)' }}>
        <Typography
          component="h1"
          sx={{
            fontSize: 24,
            fontWeight: 400,
            color: 'text.primary',
            textAlign: 'center',
            ...fadeUpEntranceSx(80),
          }}
        >
          What should we do in Project Atlas?
        </Typography>
        <Box sx={{ width: 'min(600px, 100%)', ...fadeUpEntranceSx(180, 420) }}>
          <ChatComposer
            large
            showPoweredLine={false}
            loading={composerLoading}
            value={composerValue}
            attachedFileIds={attachedFileIds}
            onChange={onComposerChange}
            onSubmit={onComposerSubmit}
            onAttachmentsChange={onAttachmentsChange}
          />
        </Box>
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Box sx={fadeUpEntranceSx(340, 340)}>
            <HaloButton
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faFolder} />}
              onClick={onSelectFolderPrompt}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {COPY.folderPromptTitle}
            </HaloButton>
          </Box>
          <Box sx={fadeUpEntranceSx(430, 340)}>
            <HaloButton
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faListCheck} />}
              onClick={() => onComposerSubmit('Identify missing diligence materials')}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Identify missing diligence materials
            </HaloButton>
          </Box>
          <Box sx={fadeUpEntranceSx(520, 340)}>
            <HaloButton
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
              onClick={() => onComposerSubmit('Find sensitive data and disclosures')}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Find sensitive data and disclosures
            </HaloButton>
          </Box>
        </Stack>
        <Typography
          variant="caption"
          sx={{ display: 'block', color: 'text.disabled', textAlign: 'center', ...fadeUpEntranceSx(650, 340) }}
        >
          Powered by Blueflame AI. Always review for accuracy.
        </Typography>
      </Stack>
    </Box>
  );
}
