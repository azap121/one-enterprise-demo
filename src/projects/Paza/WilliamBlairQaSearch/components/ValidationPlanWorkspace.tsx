import {
  faChevronDown,
  faChevronUp,
  faClipboardCheck,
  faGripDotsVertical,
  faPlay,
  faPlus,
  faTrash,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HaloButton, HaloCheckbox, HaloTextField } from '~/theme/halo/components';
import { amber, jade, moondust, ruby } from '~/theme/halo/theme';
import { COPY } from '../state/copy';
import type { ValidationPlanPhase, WorkspaceAction, WorkspaceState } from '../state/types';

interface Props {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  bottomInset?: number;
}

export default function ValidationPlanWorkspace({
  state,
  dispatch,
  bottomInset = 0,
}: Props) {
  const approved = state.validationPlanApproved;

  return (
    <Stack sx={{ height: '100%', minHeight: 0, bgcolor: 'background.paper' }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
        sx={{
          px: 3,
          py: 2.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(amber[500], 0.12),
            color: amber[700],
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faClipboardCheck} style={{ fontSize: 15 }} />
        </Box>
        <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontSize: 18, fontWeight: 650, color: 'text.primary' }}>
              Q&A triage plan
            </Typography>
            <Chip
              size="small"
              label={approved ? 'Approved' : 'Approval required'}
              sx={{
                bgcolor: approved ? jade[50] : amber[50],
                color: approved ? jade[800] : amber[800],
                fontWeight: 600,
              }}
            />
          </Stack>
          <Typography sx={{ maxWidth: 680, fontSize: 13, lineHeight: 1.55, color: 'text.secondary' }}>
            Review and tune the sequence before Datasite AI categorizes buyer questions, runs saved searches, and builds the triage batch.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`${state.validationPlan.length} phases`} sx={{ bgcolor: 'background.defaultAlt' }} />
            <Chip size="small" label="order editable" sx={{ bgcolor: 'background.defaultAlt' }} />
            <Chip size="small" label="new checks supported" sx={{ bgcolor: 'background.defaultAlt' }} />
          </Stack>
        </Stack>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 3, py: 2.5, pb: `calc(${bottomInset}px + 104px)` }}>
        <Stack spacing={1.25}>
          {state.validationPlan.map((phase, index) => (
            <ValidationPlanPhaseRow
              key={phase.id}
              phase={phase}
              index={index}
              count={state.validationPlan.length}
              approved={approved}
              dispatch={dispatch}
            />
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(moondust[50], 0.86),
          backdropFilter: 'blur(16px)',
          px: 3,
          py: 2,
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
            The Q&A run starts only after Robbin approves this plan.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <HaloButton
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => dispatch({ type: 'ADD_VALIDATION_PLAN_PHASE' })}
              disabled={approved}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Add phase
            </HaloButton>
            <HaloButton
              size="small"
              variant="contained"
              startIcon={<FontAwesomeIcon icon={faPlay} />}
              onClick={() => dispatch({ type: 'APPROVE_VALIDATION_PLAN' })}
              disabled={approved}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {approved ? COPY.approvedPlanMessage : 'Approve and triage'}
            </HaloButton>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}

function ValidationPlanPhaseRow({
  phase,
  index,
  count,
  approved,
  dispatch,
}: {
  phase: ValidationPlanPhase;
  index: number;
  count: number;
  approved: boolean;
  dispatch: (action: WorkspaceAction) => void;
}) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="stretch" sx={{ p: 1.5 }}>
        <Stack alignItems="center" spacing={0.75} sx={{ width: 34, flexShrink: 0 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: 'background.defaultAlt',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 650,
            }}
          >
            {index + 1}
          </Box>
          <FontAwesomeIcon icon={faGripDotsVertical} style={{ color: moondust[500], fontSize: 12 }} />
        </Stack>

        <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
            <HaloTextField
              label="Phase"
              value={phase.title}
              onChange={(title) => dispatch({
                type: 'UPDATE_VALIDATION_PLAN_PHASE',
                phaseId: phase.id,
                updates: { title },
              })}
              disabled={approved}
              fullWidth
            />
            <Box sx={{ display: 'flex', alignItems: 'flex-end', pb: 0.15, flexShrink: 0 }}>
              <HaloCheckbox
                label="Required"
                checked={phase.required}
                disabled={approved}
                onChange={(required) => dispatch({
                  type: 'UPDATE_VALIDATION_PLAN_PHASE',
                  phaseId: phase.id,
                  updates: { required },
                })}
              />
            </Box>
          </Stack>

          <HaloTextField
            label="Instruction"
            value={phase.description}
            onChange={(description) => dispatch({
              type: 'UPDATE_VALIDATION_PLAN_PHASE',
              phaseId: phase.id,
              updates: { description },
            })}
            disabled={approved}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>

        <Stack spacing={0.5} sx={{ flexShrink: 0, pt: 2.9 }}>
          <Tooltip title="Move phase up">
            <span>
              <IconButton
                size="small"
                aria-label="Move phase up"
                disabled={approved || index === 0}
                onClick={() => dispatch({ type: 'MOVE_VALIDATION_PLAN_PHASE', phaseId: phase.id, direction: 'up' })}
                sx={{ width: 28, height: 28 }}
              >
                <FontAwesomeIcon icon={faChevronUp} style={{ fontSize: 12 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move phase down">
            <span>
              <IconButton
                size="small"
                aria-label="Move phase down"
                disabled={approved || index === count - 1}
                onClick={() => dispatch({ type: 'MOVE_VALIDATION_PLAN_PHASE', phaseId: phase.id, direction: 'down' })}
                sx={{ width: 28, height: 28 }}
              >
                <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 12 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Divider flexItem />
          <Tooltip title="Add phase after">
            <span>
              <IconButton
                size="small"
                aria-label="Add phase after"
                disabled={approved}
                onClick={() => dispatch({ type: 'ADD_VALIDATION_PLAN_PHASE', afterPhaseId: phase.id })}
                sx={{ width: 28, height: 28 }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: 12 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove phase">
            <span>
              <IconButton
                size="small"
                aria-label="Remove phase"
                disabled={approved || count <= 1}
                onClick={() => dispatch({ type: 'REMOVE_VALIDATION_PLAN_PHASE', phaseId: phase.id })}
                sx={{ width: 28, height: 28, color: ruby[700] }}
              >
                <FontAwesomeIcon icon={faTrash} style={{ fontSize: 12 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}
