import {
  faArrowUpRightFromSquare,
  faCopy,
  faDownload,
  faEnvelope,
  faFolderArrowDown,
  faThumbsDown,
  faThumbsUp,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { CIM_RUN_COPY, GRATA_SIMILAR } from '../state/cimRunScenario';

interface Props {
  summary: string;
  // Audit-trail stamp: which autonomy mode this run used ("Ran in Plan first · …").
  auditLine: string;
  accepted: boolean;
  sandbox?: boolean;
  onOpenReview: () => void;
  onAskGrataSimilar: () => void;
}

// Run output card (Phase 3). Deliverable-named (memo, not "artifact"), Blueflame-style
// per-response action bar (copy / email / download / save-to / thumbs), and the
// mode-of-autonomy audit stamp — the compliance artifact nobody else shows.
export default function CimOutputCard({
  summary,
  auditLine,
  accepted,
  sandbox = false,
  onOpenReview,
  onAskGrataSimilar,
}: Props) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 650, color: 'text.primary' }}>
            {CIM_RUN_COPY.outputDeliverable}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{CIM_RUN_COPY.outputMetaLine}</Typography>
        </Stack>
        {accepted ? <Chip size="small" label="Tracked" color="success" variant="filled" /> : null}
      </Stack>

      <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.primary' }}>{summary}</Typography>

      <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{auditLine}</Typography>

      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
        <HaloButton
          variant="contained"
          size="small"
          startIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}
          onClick={onOpenReview}
          sx={{ textTransform: 'none' }}
        >
          Open review table
        </HaloButton>
        {!sandbox ? (
          <HaloButton
            variant="text"
            size="small"
            onClick={onAskGrataSimilar}
            sx={{ textTransform: 'none' }}
          >
            Ask @Grata for similar companies
          </HaloButton>
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={0.25}>
          {[
            { icon: faCopy, label: 'Copy' },
            { icon: faEnvelope, label: 'Email' },
            { icon: faDownload, label: 'Download' },
            { icon: faFolderArrowDown, label: 'Save to…' },
            { icon: faThumbsUp, label: 'Good response' },
            { icon: faThumbsDown, label: 'Bad response' },
          ].map((action) => (
            <Tooltip key={action.label} title={action.label}>
              <IconButton size="small" aria-label={action.label} sx={{ width: 26, height: 26, color: 'text.secondary' }}>
                <FontAwesomeIcon icon={action.icon} style={{ fontSize: 12 }} />
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

// Re-export for callers that stage the follow-up prompt.
export const GRATA_SIMILAR_PROMPT = GRATA_SIMILAR.prompt;
