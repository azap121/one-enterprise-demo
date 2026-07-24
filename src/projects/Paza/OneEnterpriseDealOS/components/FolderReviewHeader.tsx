import { faCheck, faFolderPlus, faFolderTree } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { RefObject } from 'react';
import { HaloButton } from '~/theme/halo/components';
import { amber, jade, moondust, tanzanite } from '~/theme/halo/theme';
import { FILING_COPY } from '../state/filingScenario';

interface Props {
  headingRef: RefObject<HTMLHeadingElement | null>;
  addFolderDisabled: boolean;
  applied?: boolean;
  onAddFolder: () => void;
  onDiscard: () => void;
  onUpdate: () => void;
}

export default function FolderReviewHeader({
  headingRef,
  addFolderDisabled,
  applied = false,
  onAddFolder,
  onDiscard,
  onUpdate,
}: Props) {
  return (
    <Stack
      spacing={2}
      sx={{
        position: 'relative',
        zIndex: 2,
        p: 2,
        mb: 1,
        borderRadius: '16px',
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            <FontAwesomeIcon icon={faFolderTree} />
          </Box>
          <Typography
            ref={headingRef}
            tabIndex={-1}
            component="h1"
            sx={{
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.2,
              outline: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {applied ? 'Filing plan applied' : 'Filing plan'}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center" justifyContent="flex-end" sx={{ flexShrink: 0 }}>
          <Chip
            size="small"
            label="Sandbox · unpublished"
            sx={{ bgcolor: moondust[100], color: moondust[800], fontWeight: 600 }}
          />
          {applied ? (
            <Chip
              size="small"
              icon={<FontAwesomeIcon icon={faCheck} />}
              label="Applied"
              sx={{ bgcolor: jade[50], color: jade[800], fontWeight: 600 }}
            />
          ) : null}
          <Chip size="small" label="14 files filed" sx={{ bgcolor: tanzanite[50], color: tanzanite[800], fontWeight: 600 }} />
          <Chip size="small" label="2 new folders" sx={{ bgcolor: jade[50], color: jade[800], fontWeight: 600 }} />
          <Chip size="small" label="2 renames" sx={{ bgcolor: amber[50], color: amber[800], fontWeight: 600 }} />
        </Stack>
      </Stack>

      {applied ? null : (
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} rowGap={1} flexWrap="wrap" useFlexGap>
        <HaloButton
          size="small"
          variant="outlined"
          startIcon={<FontAwesomeIcon icon={faFolderPlus} />}
          disabled={addFolderDisabled}
          onClick={onAddFolder}
          sx={{ textTransform: 'none', flexShrink: 0 }}
        >
          Add folder
        </HaloButton>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 'auto', flexShrink: 0 }}>
          <HaloButton size="small" variant="text" onClick={onDiscard} sx={{ textTransform: 'none' }}>
            Discard changes
          </HaloButton>
          <HaloButton size="small" variant="contained" onClick={onUpdate} sx={{ textTransform: 'none' }}>
            {FILING_COPY.updateCta}
          </HaloButton>
        </Stack>
        </Stack>
      )}
    </Stack>
  );
}
