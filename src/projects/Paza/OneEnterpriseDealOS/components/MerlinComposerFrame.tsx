import { useEffect, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import {
  faCheck,
  faChevronDown,
  faDial,
  faGlobe,
  faLock,
  faMicrochipAi,
  faWandMagicSparkles,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, ButtonBase, Menu, MenuItem, Stack, Switch, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { amber, jade, moondust, tanzanite } from '~/theme/halo/theme';
import {
  AUTONOMY_DIAL,
  MERLIN_COPY,
  MODEL_ROSTER,
  getDialEntry,
  getModel,
  type AutonomyDialId,
} from '../state/merlinFixtures';
import { MERLIN_COPY as COPY_ALIAS } from '../state/merlinFixtures';
import type { WorkspaceAction, WorkspaceState } from '../state/types';

interface Props {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  // Render the frame only in the deal workspace; elsewhere pass children through.
  active: boolean;
  children: ReactNode;
}

// Merlin mode — the two-mode composer frame (enterprise/11-merlin-mode-plan.md).
// Normal = chat + frontier-model picker chip + web toggle; conversation only.
// Merlin = agentic; the model chip swaps for the autonomy dial chip (same slot) and
// the animated gradient border lights up — the "am I about to commit/spend?" glance
// test. ⌘M toggles; number keys 1–5 work inside the dial menu.
export default function MerlinComposerFrame({ state, dispatch, active, children }: Props) {
  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        dispatch({ type: 'TOGGLE_MERLIN_MODE' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, dispatch]);

  if (!active) return <>{children}</>;

  const merlin = state.merlinMode;
  const dial = getDialEntry(state.autonomyDial);
  const sandbox = merlin && state.autonomyDial === 'sandbox';
  const queuedCimRun = merlin && state.cimRun.queuedPlaybookId === 'pe-cim-screen';

  return (
    <Stack spacing={0.75}>
      {sandbox ? (
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{
            px: 1.25,
            py: 0.6,
            borderRadius: 2,
            bgcolor: jade[50],
            color: jade[800],
          }}
        >
          <FontAwesomeIcon icon={faLock} style={{ fontSize: 11 }} />
          <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>{MERLIN_COPY.sandboxBanner}</Typography>
        </Stack>
      ) : null}

      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ px: 0.25, rowGap: 0.5 }}>
        <ModeToggle merlin={merlin} onToggle={() => dispatch({ type: 'TOGGLE_MERLIN_MODE' })} />
        {merlin ? (
          <AutonomyDialChip
            dialId={state.autonomyDial}
            label={dial.label}
            onSelect={(next) => dispatch({ type: 'SET_AUTONOMY_DIAL', dial: next })}
          />
        ) : (
          <ModelChip
            modelId={state.normalModelId}
            webSearch={state.webSearch}
            onSelectModel={(modelId) => dispatch({ type: 'SET_NORMAL_MODEL', modelId })}
            onToggleWeb={() => dispatch({ type: 'TOGGLE_WEB_SEARCH' })}
          />
        )}
        <Box sx={{ flex: 1 }} />
        {queuedCimRun ? (
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
            {MERLIN_COPY.queuedRunEstimate}
          </Typography>
        ) : !merlin ? (
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{MERLIN_COPY.normalModeNote}</Typography>
        ) : null}
      </Stack>

      {/* Gradient border = the Merlin-mode visual signature (Blueflame's animated
          gradient border, repurposed as the commit/spend glance test). */}
      <Box
        sx={{
          borderRadius: '26px',
          p: merlin ? '1.5px' : 0,
          background: merlin
            ? `linear-gradient(120deg, ${amber[500]}, ${tanzanite[500]}, ${amber[600]})`
            : 'transparent',
          backgroundSize: '200% 200%',
          transition: 'padding 180ms cubic-bezier(0.2, 0, 0, 1)',
          animation: merlin ? 'merlinGradientShift 4s ease infinite' : 'none',
          '@keyframes merlinGradientShift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}

function ModeToggle({ merlin, onToggle }: { merlin: boolean; onToggle: () => void }) {
  return (
    <Tooltip title={MERLIN_COPY.modeTooltip}>
      <Stack
        direction="row"
        role="group"
        aria-label="Assistant mode"
        sx={{
          borderRadius: '999px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.defaultAlt',
          p: '2px',
          flexShrink: 0,
        }}
      >
        <ModeToggleSegment label={MERLIN_COPY.normalLabel} selected={!merlin} onClick={() => merlin && onToggle()} />
        <ModeToggleSegment
          label={MERLIN_COPY.merlinLabel}
          icon={faWandMagicSparkles}
          selected={merlin}
          onClick={() => !merlin && onToggle()}
        />
      </Stack>
    </Tooltip>
  );
}

function ModeToggleSegment({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon?: typeof faWandMagicSparkles;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        minHeight: 24,
        px: 1.1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        borderRadius: '999px',
        fontSize: 11.5,
        fontWeight: 600,
        color: selected ? 'text.primary' : 'text.disabled',
        bgcolor: selected ? 'background.paper' : 'transparent',
        boxShadow: selected ? `0 1px 3px ${alpha(moondust[900], 0.14)}` : 'none',
        transition: 'background-color 150ms cubic-bezier(0.2, 0, 0, 1), color 150ms cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      {icon ? <FontAwesomeIcon icon={icon} style={{ fontSize: 10, color: selected ? amber[700] : undefined }} /> : null}
      {label}
    </ButtonBase>
  );
}

// Normal mode: frontier-model picker chip + web toggle (Blueflame roster fixture).
function ModelChip({
  modelId,
  webSearch,
  onSelectModel,
  onToggleWeb,
}: {
  modelId: string;
  webSearch: boolean;
  onSelectModel: (modelId: string) => void;
  onToggleWeb: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const model = getModel(modelId);

  return (
    <>
      <ComposerChip
        icon={faMicrochipAi}
        label={model.label}
        open={open}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        ariaLabel={`Model: ${model.label}`}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: -0.75, minWidth: 248, borderRadius: 2, border: '1px solid', borderColor: 'divider' } } }}
      >
        <Typography sx={{ px: 1.5, pt: 1, pb: 0.5, fontSize: 11, fontWeight: 650, color: 'text.disabled', textTransform: 'uppercase' }}>
          {MERLIN_COPY.modelMenuTitle}
        </Typography>
        {MODEL_ROSTER.map((entry) => (
          <MenuItem
            key={entry.id}
            selected={entry.id === modelId}
            onClick={() => {
              onSelectModel(entry.id);
              setAnchorEl(null);
            }}
            sx={{ fontSize: 13, gap: 1 }}
          >
            <Box sx={{ width: 16, display: 'inline-flex', justifyContent: 'center' }}>
              {entry.id === modelId ? <FontAwesomeIcon icon={faCheck} style={{ fontSize: 11 }} /> : null}
            </Box>
            <Stack spacing={0} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13 }}>{entry.label}</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{entry.vendor}</Typography>
            </Stack>
          </MenuItem>
        ))}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1.5, py: 0.75, mt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center">
            <FontAwesomeIcon icon={faGlobe} style={{ fontSize: 12, color: moondust[500] }} />
            <Typography sx={{ fontSize: 12.5 }}>{MERLIN_COPY.webToggleLabel}</Typography>
          </Stack>
          <Switch size="small" checked={webSearch} onChange={onToggleWeb} inputProps={{ 'aria-label': MERLIN_COPY.webToggleLabel }} />
        </Stack>
      </Menu>
    </>
  );
}

// Merlin mode: the autonomy dial chip — Claude Code's mode picker translated for
// dealmakers. Number keys 1–5 select while the menu is open.
function AutonomyDialChip({
  dialId,
  label,
  onSelect,
}: {
  dialId: AutonomyDialId;
  label: string;
  onSelect: (dial: AutonomyDialId) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const entry = AUTONOMY_DIAL.find((candidate) => candidate.shortcut === event.key);
    if (!entry) return;
    event.preventDefault();
    onSelect(entry.id);
    setAnchorEl(null);
  };

  return (
    <>
      <ComposerChip
        icon={faDial}
        label={label}
        open={open}
        emphasized
        onClick={(event) => setAnchorEl(event.currentTarget)}
        ariaLabel={COPY_ALIAS.dialAriaLabel}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onKeyDown={handleMenuKeyDown}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: -0.75, minWidth: 328, borderRadius: 2, border: '1px solid', borderColor: 'divider' } } }}
      >
        <Typography sx={{ px: 1.5, pt: 1, pb: 0.5, fontSize: 11, fontWeight: 650, color: 'text.disabled', textTransform: 'uppercase' }}>
          {MERLIN_COPY.dialMenuTitle}
        </Typography>
        {AUTONOMY_DIAL.map((entry) => (
          <MenuItem
            key={entry.id}
            selected={entry.id === dialId}
            onClick={() => {
              onSelect(entry.id);
              setAnchorEl(null);
            }}
            sx={{ alignItems: 'flex-start', gap: 1, py: 0.9, whiteSpace: 'normal' }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                mt: 0.2,
                borderRadius: '4px',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.defaultAlt',
                fontSize: 10,
                fontWeight: 650,
                color: 'text.secondary',
              }}
            >
              {entry.shortcut}
            </Box>
            <Stack spacing={0.1} sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{entry.label}</Typography>
                {entry.id === dialId ? <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} /> : null}
              </Stack>
              <Typography sx={{ fontSize: 11.5, lineHeight: 1.45, color: 'text.secondary' }}>{entry.microcopy}</Typography>
            </Stack>
          </MenuItem>
        ))}
        <Typography sx={{ px: 1.5, py: 0.75, mt: 0.5, borderTop: '1px solid', borderColor: 'divider', fontSize: 11, color: 'text.disabled' }}>
          {MERLIN_COPY.merlinRoutesLine}
        </Typography>
      </Menu>
    </>
  );
}

function ComposerChip({
  icon,
  label,
  open,
  emphasized = false,
  onClick,
  ariaLabel,
}: {
  icon: typeof faDial;
  label: string;
  open: boolean;
  emphasized?: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  ariaLabel: string;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={ariaLabel}
      aria-haspopup="menu"
      aria-expanded={open ? 'true' : undefined}
      sx={{
        minHeight: 26,
        px: 1.1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        borderRadius: '999px',
        border: '1px solid',
        borderColor: open ? 'text.primary' : emphasized ? alpha(amber[600], 0.5) : 'divider',
        bgcolor: emphasized ? amber[50] : 'background.paper',
        fontSize: 12,
        fontWeight: 600,
        color: emphasized ? amber[800] : 'text.secondary',
        flexShrink: 0,
        '&:hover': { bgcolor: emphasized ? amber[50] : 'action.hover', color: emphasized ? amber[800] : 'text.primary' },
      }}
    >
      <FontAwesomeIcon icon={icon} style={{ fontSize: 11 }} />
      {label}
      <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 9, opacity: 0.7 }} />
    </ButtonBase>
  );
}
