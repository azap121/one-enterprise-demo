import { faCircleCheck, faSpinnerThird } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { amber, jade, moondust } from '~/theme/halo/theme';

interface Step {
  id: string;
  label: string;
  service: string;
}

interface Props {
  steps: readonly Step[];
  completedCount: number;
}

export default function ThinkingTimeline({ steps, completedCount }: Props) {
  return (
    <Stack spacing={1.25} aria-live="polite">
      {steps.map((step, index) => {
        const complete = index < completedCount;
        const active = index === completedCount && completedCount < steps.length;
        return (
          <Stack key={step.id} direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 0.1,
                bgcolor: complete ? jade[50] : active ? amber[50] : 'background.defaultAlt',
                color: complete ? jade[700] : active ? amber[700] : moondust[500],
              }}
            >
              <FontAwesomeIcon
                icon={complete ? faCircleCheck : faSpinnerThird}
                spin={active}
                style={{ fontSize: 12 }}
              />
            </Box>
            <Stack spacing={0.1} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active || complete ? 'text.primary' : 'text.secondary' }}>
                {step.label}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {step.service}
              </Typography>
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}

