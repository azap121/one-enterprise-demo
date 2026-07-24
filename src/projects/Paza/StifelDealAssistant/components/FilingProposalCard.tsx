import { faCircleInfo, faFolderTree, faTriangleExclamation } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Collapse, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { amber, jade, moondust, tanzanite } from '~/theme/halo/theme';
import AiSparkleBadge from './AiSparkleBadge';
import { getFilingSpec, type FilingChipTone } from '../state/filingVariants';
import type { FilingVariantId } from '../state/types';

const CHIP_TONES: Record<FilingChipTone, { bgcolor: string; color: string }> = {
  tanzanite: { bgcolor: tanzanite[50], color: tanzanite[800] },
  jade: { bgcolor: jade[50], color: jade[800] },
  amber: { bgcolor: amber[50], color: amber[800] },
  moondust: { bgcolor: moondust[100], color: moondust[800] },
};

interface Props {
  variant?: FilingVariantId;
  onReview: () => void;
  onShowRationale: () => void;
  inReview?: boolean;
  applied?: boolean;
  rationaleExpanded?: boolean;
}

export default function FilingProposalCard({
  variant = 'uploads',
  onReview,
  onShowRationale,
  inReview = false,
  applied = false,
  rationaleExpanded = false,
}: Props) {
  const spec = getFilingSpec(variant);

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
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <AiSparkleBadge size={34} iconSize={24} />
          <Stack spacing={0.5}>
            <Typography sx={{ fontWeight: 650, fontSize: 16 }}>
              {spec.copy.proposalTitle}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.55 }}>
              {spec.copy.proposalSummary}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {spec.chips.map((chip) => (
            <Chip
              key={chip.label}
              size="small"
              label={chip.label}
              sx={{ ...CHIP_TONES[chip.tone], fontWeight: 600 }}
            />
          ))}
        </Stack>

        <Stack spacing={0.75}>
          {spec.highlights.map((highlight) => (
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
            {applied ? spec.copy.reviewAppliedCta : inReview ? spec.copy.reviewInProgressCta : spec.copy.reviewCta}
          </HaloButton>
        </Stack>

        <Collapse in={rationaleExpanded} timeout={200} unmountOnExit>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
            <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.secondary' }}>
              {spec.rationale}
            </Typography>
          </Box>
        </Collapse>
      </Stack>
    </Box>
  );
}
