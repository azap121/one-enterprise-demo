import { useState } from 'react';
import { faChevronDown } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, ButtonBase, Collapse, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { jade, moondust } from '~/theme/halo/theme';
import {
  CALDERA_AGENTS,
  CALDERA_PLAYBOOKS,
  CALDERA_RAIL_COPY,
  type DealAgent,
  type DealPlaybook,
} from '../state/dealsFixtures';

interface Props {
  // Insert a prepared playbook prompt into the composer (don't auto-send).
  onInsertPrompt: (prompt: string) => void;
  onAllPlaybooks: () => void;
}

// Deal-scoped rail sections: Agents + Playbooks. Shown only in the Caldera deal;
// Recents stays below (rendered by AssistantRail). Aldgate's rail is untouched.
export default function DealRailSections({ onInsertPrompt, onAllPlaybooks }: Props) {
  return (
    <>
      <Stack spacing={1}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>{CALDERA_RAIL_COPY.agentsHeader}</Typography>
        <Stack spacing={0.75}>
          {CALDERA_AGENTS.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>{CALDERA_RAIL_COPY.playbooksHeader}</Typography>
          <ButtonBase onClick={onAllPlaybooks} sx={{ borderRadius: 1, px: 0.5 }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
              {CALDERA_RAIL_COPY.allPlaybooks}
            </Typography>
          </ButtonBase>
        </Stack>
        <Stack spacing={0.75}>
          {CALDERA_PLAYBOOKS.map((playbook) => (
            <PlaybookCard key={playbook.id} playbook={playbook} onClick={() => onInsertPrompt(playbook.prompt)} />
          ))}
        </Stack>
      </Stack>
    </>
  );
}

function AgentCard({ agent }: { agent: DealAgent }) {
  const [open, setOpen] = useState(false);
  const active = agent.status === 'active';
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'background.paper', overflow: 'hidden' }}>
      <ButtonBase
        onClick={() => setOpen((current) => !current)}
        sx={{ width: '100%', display: 'block', textAlign: 'left', px: 1.25, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              flexShrink: 0,
              bgcolor: active ? jade[600] : alpha(moondust[700], 0.35),
            }}
          />
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.name}
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: 'text.disabled', textTransform: 'capitalize' }}>{agent.status}</Typography>
          <FontAwesomeIcon
            icon={faChevronDown}
            style={{ fontSize: 10, color: moondust[500], transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 220ms cubic-bezier(0.2,0,0,1)' }}
          />
        </Stack>
      </ButtonBase>
      <Collapse in={open}>
        <Stack spacing={1} sx={{ px: 1.25, pb: 1.25, pt: 0.25 }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {agent.capabilities.map((capability) => (
              <CapabilityChip key={capability} label={capability} />
            ))}
          </Stack>
          {agent.scope ? <RailMeta label="Scope" value={agent.scope} /> : null}
          {agent.budget ? <RailMeta label="Budget" value={agent.budget} /> : null}
        </Stack>
      </Collapse>
    </Box>
  );
}

function PlaybookCard({ playbook, onClick }: { playbook: DealPlaybook; onClick: () => void }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'block',
        textAlign: 'left',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        px: 1.25,
        py: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Stack spacing={0.75}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {playbook.name}
          </Typography>
          <ScopeBadge scope={playbook.scope} />
        </Stack>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.4 }}>{playbook.oneLiner}</Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <IoChip label={`IN: ${playbook.input}`} />
          <IoChip label={`→ ${playbook.sentTo}`} />
          {playbook.scheduleChip ? <IoChip label={playbook.scheduleChip} /> : null}
        </Stack>
      </Stack>
    </ButtonBase>
  );
}

function RailMeta({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="baseline">
      <Typography sx={{ fontSize: 10.5, color: 'text.disabled', flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.4 }}>{value}</Typography>
    </Stack>
  );
}

function CapabilityChip({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 0.6,
        py: 0.15,
        borderRadius: '4px',
        bgcolor: 'background.defaultAlt',
        border: '1px solid',
        borderColor: 'divider',
        color: 'text.secondary',
        fontSize: 10,
        fontFamily: 'monospace',
      }}
    >
      {label}
    </Box>
  );
}

function IoChip({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 0.6,
        py: 0.15,
        borderRadius: '999px',
        bgcolor: 'background.defaultAlt',
        color: 'text.disabled',
        fontSize: 10,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}

function ScopeBadge({ scope }: { scope: 'Firm' | 'Personal' }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 0.6,
        borderRadius: '999px',
        bgcolor: scope === 'Firm' ? alpha(moondust[700], 0.1) : 'transparent',
        border: scope === 'Firm' ? 'none' : '1px solid',
        borderColor: 'divider',
        color: 'text.disabled',
        fontSize: 10,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {scope}
    </Box>
  );
}
