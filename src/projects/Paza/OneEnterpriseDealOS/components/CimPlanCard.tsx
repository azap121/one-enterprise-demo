import { faPlay } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { jade } from '~/theme/halo/theme';
import { CIM_PLAN_PHASES, CIM_RUN_COPY } from '../state/cimRunScenario';

interface Props {
  // 'pending' → Approve plan enabled; 'executing' → morphed, disabled; 'done' → Done.
  status: 'pending' | 'executing' | 'done';
  onApprove: () => void;
}

// The Phase 3 approval gate: plan card with numbered phases + the morphing button
// (Approve plan → Executing → Done, no layout shift — minWidth pins the widest label).
export default function CimPlanCard({ status, onApprove }: Props) {
  const buttonLabel = status === 'pending' ? 'Approve plan' : status === 'executing' ? 'Executing' : 'Done';
  return (
    <Stack
      spacing={1.5}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        bgcolor: 'background.paper',
        // AX plan arrival: scale .98→1 + fade at dur-base — the "aha", let it land.
        animation: 'planCardEnter 220ms cubic-bezier(0.2, 0, 0, 1)',
        '@keyframes planCardEnter': {
          from: { opacity: 0, transform: 'scale(0.98)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      <Stack spacing={0.25}>
        <Typography sx={{ fontSize: 14.5, fontWeight: 650, color: 'text.primary' }}>
          CIM Screen — buy-side · plan
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          Nothing executes before your approval · {CIM_RUN_COPY.planEstimateLine}
        </Typography>
      </Stack>

      <Stack spacing={1.25}>
        {CIM_PLAN_PHASES.map((phase, index) => (
          <Stack key={phase.id} direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                flexShrink: 0,
                mt: 0.1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.defaultAlt',
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary',
                fontSize: 10.5,
                fontWeight: 650,
              }}
            >
              {index + 1}
            </Box>
            <Stack spacing={0.1} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{phase.title}</Typography>
              <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: 'text.secondary' }}>{phase.body}</Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      <Box>
        <HaloButton
          variant="contained"
          size="small"
          startIcon={<FontAwesomeIcon icon={faPlay} />}
          onClick={onApprove}
          disabled={status !== 'pending'}
          sx={{
            textTransform: 'none',
            minWidth: 132,
            ...(status === 'done'
              ? {
                  '&.Mui-disabled': {
                    bgcolor: jade[50],
                    color: jade[800],
                  },
                }
              : null),
          }}
        >
          {buttonLabel}
        </HaloButton>
      </Box>
    </Stack>
  );
}
