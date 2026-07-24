import { faBolt, faCircleCheck, faSpinnerThird } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { amber, jade, moondust, tanzanite } from '~/theme/halo/theme';
import type { CimRunStep } from '../state/cimRunScenario';

interface Props {
  steps: readonly CimRunStep[];
  completedCount: number;
  // Live run: steps reveal one-by-one (AX stagger) instead of listing every future
  // step up front. Frozen logs (past runs, session switches) render complete + static.
  live?: boolean;
}

// Glass-box work log for the CIM run (Phase 3). Extends the ThinkingTimeline visual
// language with the manda-aOS AX affordances: frozen elapsed badges on completed steps,
// an indented mono sub-process line under the active step, and a highlighted chip for
// the @Grata tool-call step (the federation beat).
export default function CimWorkLog({ steps, completedCount, live = false }: Props) {
  const visibleSteps = live ? steps.slice(0, Math.min(completedCount + 1, steps.length)) : steps;
  return (
    <Stack spacing={1.25} aria-live="polite">
      {visibleSteps.map((step, index) => {
        const complete = index < completedCount;
        const active = index === completedCount && completedCount < steps.length;
        return (
          <Stack
            key={step.id}
            spacing={0.5}
            sx={live ? {
              animation: 'workLogStepEnter 220ms cubic-bezier(0.2, 0, 0, 1)',
              '@keyframes workLogStepEnter': {
                from: { opacity: 0, transform: 'translateY(6px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            } : undefined}
          >
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 0.1,
                  flexShrink: 0,
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
              <Stack spacing={0.1} sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      color: active || complete ? 'text.primary' : 'text.secondary',
                      minWidth: 0,
                    }}
                  >
                    {step.label}
                  </Typography>
                  {complete ? (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 10.5,
                        color: 'text.disabled',
                        fontVariantNumeric: 'tabular-nums',
                        flexShrink: 0,
                      }}
                    >
                      {step.elapsed}
                    </Typography>
                  ) : null}
                </Stack>
                {step.grata ? (
                  <Box
                    component="span"
                    sx={{
                      alignSelf: 'flex-start',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 0.25,
                      px: 0.75,
                      minHeight: 20,
                      borderRadius: '999px',
                      bgcolor: tanzanite[50],
                      color: tanzanite[700],
                      fontSize: 10.5,
                      fontWeight: 600,
                    }}
                  >
                    <FontAwesomeIcon icon={faBolt} style={{ fontSize: 9 }} />
                    {step.service}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{step.service}</Typography>
                )}
                {active && step.sub ? (
                  <Typography
                    sx={{
                      mt: 0.25,
                      px: 0.75,
                      py: 0.4,
                      borderRadius: 1,
                      bgcolor: alpha(moondust[900], 0.05),
                      color: 'text.secondary',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      alignSelf: 'flex-start',
                    }}
                  >
                    {step.sub}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
