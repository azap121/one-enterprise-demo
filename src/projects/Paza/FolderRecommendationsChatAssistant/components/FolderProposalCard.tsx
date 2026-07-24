import {
  faCircleInfo,
  faFolderTree,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Collapse, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { amber, jade, moondust, tanzanite } from '~/theme/halo/theme';
import AiSparkleBadge from './AiSparkleBadge';
import { COPY, PROPOSAL_HIGHLIGHTS, RATIONALE_COPY } from '../state/copy';

interface Props {
  onReview: () => void;
  onShowRationale: () => void;
  inReview?: boolean;
  applied?: boolean;
  rationaleExpanded?: boolean;
  compact?: boolean;
}

export default function FolderProposalCard({
  onReview,
  onShowRationale,
  inReview = false,
  applied = false,
  rationaleExpanded = false,
  compact = false,
}: Props) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        bgcolor: 'background.paper',
        p: compact ? 2 : 2.5,
        maxWidth: compact ? 'none' : 560,
      }}
    >
      <Stack spacing={compact ? 1.75 : 2}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          {!compact && <AiSparkleBadge size={34} iconSize={24} />}
          {compact && (
            <Box sx={{ color: 'text.secondary', lineHeight: 1, pt: 0.75 }}>
              <FontAwesomeIcon icon={faFolderTree} style={{ fontSize: 12 }} />
            </Box>
          )}
          <Stack spacing={0.5}>
            <Typography sx={{ fontWeight: 650, fontSize: 16 }}>
              {COPY.proposalTitle}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.55 }}>
              {COPY.proposalSummary}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" label="3 additions" sx={{ bgcolor: jade[50], color: jade[800], fontWeight: 600 }} />
          <Chip size="small" label="2 renames" sx={{ bgcolor: amber[50], color: amber[800], fontWeight: 600 }} />
          <Chip size="small" label="3 moves" sx={{ bgcolor: tanzanite[50], color: tanzanite[800], fontWeight: 600 }} />
        </Stack>

        <Stack spacing={0.75}>
          {PROPOSAL_HIGHLIGHTS.map((highlight) => (
            <Stack key={highlight} direction="row" spacing={1} alignItems="center">
              <FontAwesomeIcon icon={faFolderTree} style={{ color: moondust[500], fontSize: 12 }} />
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {highlight}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent={compact ? 'flex-end' : 'flex-start'} flexWrap="wrap" useFlexGap>
          <HaloButton
            variant="text"
            size="small"
            startIcon={<FontAwesomeIcon icon={faCircleInfo} />}
            onClick={onShowRationale}
            aria-expanded={rationaleExpanded}
            sx={{ textTransform: 'none' }}
          >
            {rationaleExpanded ? 'Hide rationale' : 'Show rationale'}
          </HaloButton>
          <HaloButton
            variant="contained"
            size="small"
            onClick={onReview}
            disabled={applied || inReview}
            sx={{ textTransform: 'none' }}
          >
            {applied ? COPY.reviewAppliedCta : inReview ? COPY.reviewInProgressCta : COPY.reviewCta}
          </HaloButton>
        </Stack>

        <Collapse in={rationaleExpanded} timeout={200} unmountOnExit>
          <Box
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              pt: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.secondary' }}>
              {RATIONALE_COPY}
            </Typography>
          </Box>
        </Collapse>
      </Stack>
    </Box>
  );
}
