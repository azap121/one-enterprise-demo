// Merlin mode — two-mode assistant frame (enterprise/11-merlin-mode-plan.md).
// Normal mode = chat, user picks the frontier model (Blueflame roster fixture).
// Merlin mode = agentic — the model chip swaps for an autonomy dial (Claude Code's
// mode picker translated for dealmakers: renamed by what the user is AGREEING to).
// "Merlin" is the internal concept-car label; the mechanic is what we're proving.

export type AutonomyDialId = 'guide-me' | 'plan-first' | 'draft-ahead' | 'run-it' | 'sandbox';

export interface AutonomyDialEntry {
  id: AutonomyDialId;
  label: string;
  microcopy: string;
  shortcut: string; // number key, mirroring the reference UI
}

// Increasing autonomy, 1→5. The key inversion: position 5 is our SAFEST mode —
// safe-by-isolation instead of dangerous-by-permission ("Bypass" becomes "Sandbox").
export const AUTONOMY_DIAL: readonly AutonomyDialEntry[] = [
  { id: 'guide-me', label: 'Guide me', microcopy: 'Merlin asks before every step — approve each action as a card', shortcut: '1' },
  { id: 'plan-first', label: 'Plan first', microcopy: 'See the plan and approve it before Merlin starts', shortcut: '2' },
  { id: 'draft-ahead', label: 'Draft ahead', microcopy: 'Runs freely; asks before anything lands in the deal record or leaves the room', shortcut: '3' },
  { id: 'run-it', label: 'Run it', microcopy: 'End-to-end runs; gates only at hard commits — send, file, share, external', shortcut: '4' },
  { id: 'sandbox', label: 'Sandbox', microcopy: 'Full autonomy in your personal space — outputs cannot touch the deal record', shortcut: '5' },
];

export const DEFAULT_AUTONOMY_DIAL: AutonomyDialId = 'plan-first'; // default for Deal spaces

export function getDialEntry(id: AutonomyDialId): AutonomyDialEntry {
  return AUTONOMY_DIAL.find((entry) => entry.id === id) ?? AUTONOMY_DIAL[1];
}

// Dial positions 1–2 gate on the plan; 3–5 run through and gate only at the commit.
export function isPlanGated(dial: AutonomyDialId): boolean {
  return dial === 'guide-me' || dial === 'plan-first';
}

// ── Normal mode: frontier-model roster (Blueflame recon §3 — they already ship this) ──

export interface FrontierModel {
  id: string;
  label: string;
  vendor: string;
}

export const MODEL_ROSTER: readonly FrontierModel[] = [
  { id: 'gpt-5-5', label: 'GPT-5.5', vendor: 'OpenAI' },
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8', vendor: 'Anthropic' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', vendor: 'Anthropic' },
  { id: 'gemini-3-1-pro', label: 'Gemini 3.1 Pro', vendor: 'Google' },
  { id: 'perplexity-sonar', label: 'Perplexity Sonar', vendor: 'Perplexity' },
];

export const DEFAULT_MODEL_ID = 'gpt-5-5';

export function getModel(id: string): FrontierModel {
  return MODEL_ROSTER.find((model) => model.id === id) ?? MODEL_ROSTER[0];
}

export const MERLIN_COPY = {
  normalLabel: 'Normal',
  merlinLabel: 'Merlin',
  modeTooltip: 'Switch mode (⌘M) — Normal chats; Merlin delegates work into the deal',
  dialAriaLabel: 'Autonomy — how much Merlin does before asking you',
  dialMenuTitle: 'Autonomy',
  modelMenuTitle: 'Model',
  webToggleLabel: 'Web search',
  sandboxBanner: 'Personal workspace — nothing here touches the Caldera deal record',
  // In Merlin mode the model picker is hidden: routing models per step is the
  // orchestrator's job, not the user's.
  merlinRoutesLine: 'Merlin routes the right model per step',
  // Pre-run cost estimate (consumption-pricing visibility; budget-panel pattern).
  queuedRunEstimate: 'CIM Screen — buy-side · est. 14 credits · hard stop at 50',
  normalModeNote: 'Normal mode chats only — nothing is written to the deal.',
} as const;
