import { faCircleInfo, faFolderTree, faTriangleExclamation } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Collapse, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { amber, jade, moondust, tanzanite } from '~/theme/halo/theme';
import { FILING_COPY, FILING_HIGHLIGHTS, FILING_RATIONALE } from '../state/filingScenario';

interface Props {
  onReview: () => void;
  onShowRationale: () => void;
  inReview?: boolean;
  applied?: boolean;
  rationaleExpanded?: boolean;
}

export default function FilingProposalCard({
  onReview,
  onShowRationale,
  inReview = false,
  applied = false,
  rationaleExpanded = false,
}: Props) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        bgcolor: 'background.paper',
        p: 2.5,
        maxWidth: 620,
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography sx={{ fontWeight: 650, fontSize: 16 }}>
            {FILING_COPY.proposalTitle}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.55 }}>
            {FILING_COPY.proposalSummary}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" label="14 files filed" sx={{ bgcolor: tanzanite[50], color: tanzanite[800], fontWeight: 600 }} />
          <Chip size="small" label="2 new folders" sx={{ bgcolor: jade[50], color: jade[800], fontWeight: 600 }} />
          <Chip size="small" label="2 renames" sx={{ bgcolor: amber[50], color: amber[800], fontWeight: 600 }} />
          <Chip size="small" label="4 held for your call" sx={{ bgcolor: moondust[100], color: moondust[800], fontWeight: 600 }} />
        </Stack>

        <Stack spacing={0.75}>
          {FILING_HIGHLIGHTS.map((highlight) => (
            <Stack key={highlight} direction="row" spacing={1} alignItems="flex-start">
              <Box sx={{ pt: 0.35 }}>
                <FontAwesomeIcon
                  icon={highlight.includes('held') || highlight.includes('unreadable') ? faTriangleExclamation : faFolderTree}
                  style={{ color: moondust[500], fontSize: 12 }}
                />
              </Box>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {highlight}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
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
            {applied ? FILING_COPY.reviewAppliedCta : inReview ? FILING_COPY.reviewInProgressCta : FILING_COPY.reviewCta}
          </HaloButton>
        </Stack>

        <Collapse in={rationaleExpanded} timeout={200} unmountOnExit>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
            <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.secondary' }}>
              {FILING_RATIONALE}
            </Typography>
          </Box>
        </Collapse>
      </Stack>
    </Box>
  );
}
