import {
  faCircleInfo,
  faClipboardCheck,
  faPenLine,
  faPlay,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { amber, jade, moondust, tanzanite } from '~/theme/halo/theme';
import { COPY } from '../state/copy';
import { BRIEF_COPY } from '../state/briefScenario';
import type { ValidationPlanPhase, WorkspaceFlow } from '../state/types';

interface Props {
  flow?: WorkspaceFlow;
  phases: ValidationPlanPhase[];
  approved?: boolean;
  onViewPlan: () => void;
  onApprovePlan: () => void;
}

export default function ValidationPlanProposalCard({
  flow = 'qa',
  phases,
  approved = false,
  onViewPlan,
  onApprovePlan,
}: Props) {
  const copy = flow === 'brief'
    ? {
        title: BRIEF_COPY.planProposalTitle,
        summary: BRIEF_COPY.planProposalSummary,
        viewCta: BRIEF_COPY.viewPlanCta,
        approveCta: BRIEF_COPY.approvePlanCta,
        approvedMessage: BRIEF_COPY.approvedPlanMessage,
      }
    : {
        title: COPY.planProposalTitle,
        summary: COPY.planProposalSummary,
        viewCta: COPY.viewPlanCta,
        approveCta: COPY.approvePlanCta,
        approvedMessage: COPY.approvedPlanMessage,
      };
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        bgcolor: 'background.paper',
        p: 2.5,
        maxWidth: 580,
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 650, fontSize: 16 }}>
            {copy.title}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.55 }}>
            {copy.summary}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={`${phases.length} phases`}
            sx={{ bgcolor: jade[50], color: jade[800], fontWeight: 600 }}
          />
          <Chip
            size="small"
            icon={<FontAwesomeIcon icon={faPenLine} style={{ fontSize: 11 }} />}
            label="editable plan"
            sx={{ bgcolor: amber[50], color: amber[800], fontWeight: 600 }}
          />
          <Chip
            size="small"
            icon={<FontAwesomeIcon icon={faClipboardCheck} style={{ fontSize: 11 }} />}
            label={approved ? 'approved' : 'approval required'}
            sx={{ bgcolor: tanzanite[50], color: tanzanite[800], fontWeight: 600 }}
          />
        </Stack>

        <Box
          role="list"
          aria-label="Q&A triage plan phases"
          sx={{
            maxHeight: 200,
            overflowY: 'auto',
            pr: 0.75,
            scrollbarWidth: 'thin',
          }}
        >
          <Stack spacing={1.25}>
            {phases.map((phase, index) => (
              <Stack
                key={phase.id}
                role="listitem"
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={{
                  minHeight: 32,
                  py: 0.25,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: index < 4 ? 'background.paper' : 'background.defaultAlt',
                    border: '1px solid',
                    borderColor: index < 4 ? moondust[400] : 'divider',
                    color: index < 4 ? moondust[800] : 'text.disabled',
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: 650 }}>
                    {index + 1}
                  </Typography>
                </Box>
                <Stack spacing={0.1} sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      minWidth: 0,
                      fontSize: 13,
                      color: index < 4 ? 'text.primary' : 'text.disabled',
                      lineHeight: 1.35,
                    }}
                  >
                    Phase {index + 1} — {phase.title}
                  </Typography>
                  <Typography
                    sx={{
                      minWidth: 0,
                      fontSize: 11,
                      color: 'text.disabled',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {phase.description}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <HaloButton
            variant="outlined"
            size="small"
            startIcon={<FontAwesomeIcon icon={faCircleInfo} />}
            onClick={onViewPlan}
          >
            {copy.viewCta}
          </HaloButton>
          <HaloButton
            variant="contained"
            size="small"
            startIcon={<FontAwesomeIcon icon={faPlay} />}
            onClick={onApprovePlan}
            disabled={approved}
          >
            {approved ? copy.approvedMessage : copy.approveCta}
          </HaloButton>
        </Stack>
      </Stack>
    </Box>
  );
}
