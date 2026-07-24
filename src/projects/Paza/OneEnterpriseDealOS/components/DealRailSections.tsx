import { useState } from 'react';
import { faChevronDown } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, ButtonBase, Collapse, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { jade, moondust } from '~/theme/halo/theme';
import {
  CALDERA_AGENTS,
  CALDERA_AGENT_GROUPS,
  CALDERA_PLAYBOOKS,
  CALDERA_RAIL_COPY,
  type DealAgent,
  type DealPlaybook,
} from '../state/dealsFixtures';
import { PERSONAS, type DealLayout } from '../state/persona';

interface Props {
  // Run an Agent: stage its prompt in the composer + arm the run engine off the id.
  onRunPlaybook: (playbook: DealPlaybook) => void;
  onAllAgents: () => void;
  // The Deal Research Agent flips active while the CIM run executes.
  researchAgentActive: boolean;
  // Phase 3 seat toggle: Alex (chat-first) vs Morgan (structure-first).
  seatLayout: DealLayout;
  onSeatLayout: (layout: DealLayout) => void;
}

// Deal-scoped rail (Phase 3, two-tier vocabulary from doc 09): ONE "Agents" library —
// blueprints, push-button skills, and governed runners folded together, outcome-named,
// grouped by deal-lifecycle stage (Source → Evaluate → Diligence → Report → Monitor).
// No skill-vs-blueprint badge; provenance (Firm/Personal) + status chips only.
// The assistant itself is "Blueflame AI" — never "an agent".
export default function DealRailSections({
  onRunPlaybook,
  onAllAgents,
  researchAgentActive,
  seatLayout,
  onSeatLayout,
}: Props) {
  return (
    <>
      <SeatToggle layout={seatLayout} onSelect={onSeatLayout} />

      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>
            {CALDERA_RAIL_COPY.agentsHeader}
          </Typography>
          <ButtonBase onClick={onAllAgents} sx={{ borderRadius: 1, px: 0.5 }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
              {CALDERA_RAIL_COPY.allAgents}
            </Typography>
          </ButtonBase>
        </Stack>

        {CALDERA_AGENT_GROUPS.map((group) => {
          const agents = group.agentIds
            .map((id) => CALDERA_AGENTS.find((agent) => agent.id === id))
            .filter((agent): agent is DealAgent => Boolean(agent));
          const playbooks = group.playbookIds
            .map((id) => CALDERA_PLAYBOOKS.find((playbook) => playbook.id === id))
            .filter((playbook): playbook is DealPlaybook => Boolean(playbook));
          if (agents.length === 0 && playbooks.length === 0) return null;
          return (
            <Stack key={group.stage} spacing={0.75}>
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 650,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {group.stage}
              </Typography>
              <Stack spacing={0.75}>
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    activeOverride={agent.id === 'research-agent' ? researchAgentActive : undefined}
                  />
                ))}
                {playbooks.map((playbook) => (
                  <PlaybookCard key={playbook.id} playbook={playbook} onClick={() => onRunPlaybook(playbook)} />
                ))}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </>
  );
}

// Seat toggle — same deal, two layout defaults. Alex (SME): chat-first. Morgan
// (operator): structure-first, content canvas primary with the chat docked.
function SeatToggle({ layout, onSelect }: { layout: DealLayout; onSelect: (layout: DealLayout) => void }) {
  return (
    <Stack spacing={0.75}>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>
        {CALDERA_RAIL_COPY.seatToggleLabel}
      </Typography>
      <Stack
        role="group"
        aria-label="Seat layout"
        spacing={0.5}
        sx={{
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.defaultAlt',
          p: 0.5,
        }}
      >
        <SeatOption
          selected={layout === 'chat-first'}
          name={PERSONAS.alex.firstName}
          detail="Chat-first · Corp Dev"
          onClick={() => onSelect('chat-first')}
        />
        <SeatOption
          selected={layout === 'structure-first'}
          name={PERSONAS.morgan.firstName}
          detail="Structure-first · Operations"
          onClick={() => onSelect('structure-first')}
        />
      </Stack>
    </Stack>
  );
}

function SeatOption({
  selected,
  name,
  detail,
  onClick,
}: {
  selected: boolean;
  name: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        width: '100%',
        display: 'block',
        textAlign: 'left',
        borderRadius: 1,
        px: 1,
        py: 0.6,
        bgcolor: selected ? 'background.paper' : 'transparent',
        boxShadow: selected ? `0 1px 3px ${alpha(moondust[900], 0.14)}` : 'none',
        transition: 'background-color 150ms cubic-bezier(0.2, 0, 0, 1)',
        '&:hover': { bgcolor: selected ? 'background.paper' : 'action.hover' },
      }}
    >
      <Typography sx={{ fontSize: 12.5, fontWeight: selected ? 650 : 500, color: selected ? 'text.primary' : 'text.secondary' }}>
        {name}
      </Typography>
      <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>{detail}</Typography>
    </ButtonBase>
  );
}

function AgentCard({ agent, activeOverride }: { agent: DealAgent; activeOverride?: boolean }) {
  const [open, setOpen] = useState(false);
  const active = activeOverride ?? agent.status === 'active';
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
          <Typography sx={{ fontSize: 10.5, color: active ? jade[700] : 'text.disabled', textTransform: 'capitalize', fontWeight: active ? 600 : 400 }}>
            {active ? 'active' : 'idle'}
          </Typography>
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
