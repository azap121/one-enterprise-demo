import { useState } from 'react';
import { faArrowRight, faCheck, faPenLine } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Dialog, DialogContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HaloButton } from '~/theme/halo/components';
import { jade, moondust, tanzanite } from '~/theme/halo/theme';
import { CALDERA_CONTEXT_MARKDOWN, CALDERA_OVERVIEW } from '../state/dealsFixtures';

interface Props {
  bottomInset?: number;
  // Open the Intelligence view for a wired target; toast for the rest.
  onOpenTarget: (targetId: string, targetName: string, wired: boolean) => void;
  // Phase 3: the accepted CIM screen echoes here — visible cause→effect.
  cimAccepted?: boolean;
}

// Deal Overview canvas view — the "where was I" answer for Project Caldera.
export default function DealOverviewCanvasView({ bottomInset = 0, onOpenTarget, cimAccepted = false }: Props) {
  const [contextOpen, setContextOpen] = useState(false);
  const nextSteps = cimAccepted
    ? [
        ...CALDERA_OVERVIEW.nextSteps.map((step) =>
          step.label === 'Screen target profiles' ? { ...step, done: true } : { ...step }
        ),
        { label: 'CIM screen tracked to Review', done: true },
      ]
    : [...CALDERA_OVERVIEW.nextSteps];
  const activity = cimAccepted
    ? [
        {
          id: 'act-cim',
          actor: 'Blueflame AI',
          initials: 'BA',
          action: 'CIM screen',
          object: 'GulfAir Mechanical CIM (v2)',
          verb: 'tracked to Review',
          time: 'just now',
        },
        ...CALDERA_OVERVIEW.activity,
      ]
    : [...CALDERA_OVERVIEW.activity];

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, pt: 3, pb: 1.5, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: 'text.primary' }}>Project Caldera</Typography>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Deal overview</Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 3, pb: `calc(${bottomInset}px + 24px)` }}>
        <Stack spacing={2.5}>
          {/* State block */}
          <SectionCard>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
              <StateItem label="Stage" value={CALDERA_OVERVIEW.state.stage} />
              <StateItem label="Direction" value={CALDERA_OVERVIEW.state.direction} />
              <StateItem label="Created" value={CALDERA_OVERVIEW.state.created} />
              <StateItem label="Owner" value={CALDERA_OVERVIEW.state.owner} />
            </Box>
          </SectionCard>

          {/* Carried from sourcing */}
          <Stack spacing={1}>
            <SectionLabel>Carried from sourcing</SectionLabel>
            <SectionCard>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {CALDERA_OVERVIEW.searchChips.map((chip) => (
                    <Pill key={chip} label={chip} />
                  ))}
                </Stack>
                <Stack spacing={0.5}>
                  {CALDERA_OVERVIEW.targets.map((target) => (
                    <Box
                      key={target.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1.4fr) 64px minmax(0, 1fr) 120px',
                        gap: 1,
                        alignItems: 'center',
                        px: 1,
                        py: 1,
                        borderRadius: 1.5,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {target.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: 'text.primary' }}>{target.revenue}</Typography>
                      <SellerIntentPill label={target.sellerIntent} />
                      <HaloButton
                        size="small"
                        variant="text"
                        endIcon={<FontAwesomeIcon icon={faArrowRight} />}
                        onClick={() => onOpenTarget(target.id, target.name, target.wired)}
                        sx={{ textTransform: 'none', justifySelf: 'end', whiteSpace: 'nowrap' }}
                      >
                        Open profile
                      </HaloButton>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </SectionCard>
          </Stack>

          {/* Next steps */}
          <Stack spacing={1}>
            <SectionLabel>Next steps</SectionLabel>
            <SectionCard>
              <Stack spacing={1}>
                {nextSteps.map((step) => (
                  <Stack key={step.label} direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: '4px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid',
                        borderColor: step.done ? jade[600] : alpha(moondust[900], 0.28),
                        bgcolor: step.done ? jade[600] : 'transparent',
                        color: '#FFFFFF',
                      }}
                    >
                      {step.done ? <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} /> : null}
                    </Box>
                    <Typography
                      sx={{ fontSize: 13, color: step.done ? 'text.secondary' : 'text.primary', textDecoration: step.done ? 'line-through' : 'none' }}
                    >
                      {step.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </SectionCard>
          </Stack>

          {/* Activity feed */}
          <Stack spacing={1}>
            <SectionLabel>Activity</SectionLabel>
            <SectionCard>
              <Stack spacing={1.5}>
                {activity.map((row) => (
                  <Stack key={row.id} direction="row" spacing={1.25} alignItems="flex-start">
                    <Monogram initials={row.initials} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12.5, color: 'text.primary', lineHeight: 1.5 }}>
                        <Box component="span" sx={{ fontWeight: 600 }}>{row.actor}</Box>
                        {row.object
                          ? <> — {row.action} <Box component="span" sx={{ color: 'text.secondary' }}>“{row.object}”</Box> {row.verb}</>
                          : <> — {row.action}</>}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 11.5, color: 'text.disabled', whiteSpace: 'nowrap' }}>{row.time}</Typography>
                  </Stack>
                ))}
              </Stack>
            </SectionCard>
          </Stack>

          {/* Deal Context card — collapsed preview of the A3 markdown template */}
          <Stack spacing={1}>
            <SectionLabel>Deal context</SectionLabel>
            <SectionCard>
              <Stack spacing={1.25}>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {CALDERA_CONTEXT_MARKDOWN.replace(/[#*]/g, '')}
                </Typography>
                <Box>
                  <HaloButton
                    size="small"
                    variant="outlined"
                    startIcon={<FontAwesomeIcon icon={faPenLine} />}
                    onClick={() => setContextOpen(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Edit context
                  </HaloButton>
                </Box>
              </Stack>
            </SectionCard>
          </Stack>
        </Stack>
      </Box>

      {/* Read-only expanded context (editing out of scope) */}
      <Dialog open={contextOpen} onClose={() => setContextOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>Deal context</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              Context helps the AI understand this deal. Markdown is supported.
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                bgcolor: 'background.defaultAlt',
                maxHeight: 320,
                overflowY: 'auto',
              }}
            >
              <Typography component="pre" sx={{ fontSize: 12.5, color: 'text.primary', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit', m: 0 }}>
                {CALDERA_CONTEXT_MARKDOWN}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <HaloButton size="small" variant="contained" onClick={() => setContextOpen(false)} sx={{ textTransform: 'none' }}>
                Close
              </HaloButton>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ fontSize: 13, fontWeight: 650, color: 'text.primary' }}>{children}</Typography>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'background.paper' }}>{children}</Box>
  );
}

function StateItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>{value}</Typography>
    </Stack>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 22,
        px: 1,
        borderRadius: '999px',
        bgcolor: 'background.defaultAlt',
        border: '1px solid',
        borderColor: 'divider',
        color: 'text.secondary',
        fontSize: 11.5,
      }}
    >
      {label}
    </Box>
  );
}

function SellerIntentPill({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 22,
        px: 0.9,
        borderRadius: '999px',
        bgcolor: tanzanite[50],
        color: tanzanite[700],
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        justifySelf: 'start',
      }}
    >
      {label}
    </Box>
  );
}

function Monogram({ initials }: { initials: string }) {
  return (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        flexShrink: 0,
        bgcolor: alpha(moondust[700], 0.1),
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10.5,
        fontWeight: 650,
      }}
    >
      {initials}
    </Box>
  );
}
