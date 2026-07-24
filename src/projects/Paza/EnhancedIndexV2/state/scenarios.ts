import type { Scenario, ScenarioId, Action } from './types';
import { happy } from './bases/happy';
import { mixedPublish } from './bases/mixedPublish';
import { allPublished } from './bases/allPublished';
import * as d from './decorators';

const APPLY_SUCCESS_SEED: Action[] = [
  { type: 'OPEN' },
  { type: 'GENERATE' },
  { type: 'GENERATION_READY' },
  { type: 'APPLY' },
  { type: 'APPLY_DONE' },
];

const SCOPE_SWITCH_CONFIRM_SEED: Action[] = [
  { type: 'OPEN' },
  { type: 'GENERATE' },
  { type: 'GENERATION_READY' },
  { type: 'REQUEST_SCOPE_SWITCH', scope: 'rename' },
];

const REGENERATE_SEED: Action[] = [
  { type: 'OPEN' },
  { type: 'GENERATE' },
  { type: 'GENERATION_READY' },
  { type: 'REGENERATE' },
];

const DISCARD_FLOW_SEED: Action[] = [
  { type: 'OPEN' },
  { type: 'GENERATE' },
  { type: 'GENERATION_READY' },
];

const LABELS: Record<ScenarioId, string> = {
  'happy': 'Sandbox happy path',
  'mixed-publish': 'Mixed publish (mirrors Datasite)',
  'all-published': 'All published (locked)',
  'minimal-unpublished': 'Minimal unpublished file room',
  'no-changes': 'AI returned no changes',
  'retry-loop': 'LLM mismatch + retry',
  'scope-switch-confirm': 'Scope switch confirmation',
  'regenerate': 'Regenerate keeps scope',
  'loading-quality-model': 'Loading quality model (frozen)',
  'apply-success': 'Apply success snapshot',
  'discard-flow': 'Discard-changes flow',
};

function withId(s: Scenario, id: ScenarioId): Scenario {
  return { ...s, id, label: LABELS[id] };
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  'happy':                 withId(happy, 'happy'),
  'mixed-publish':         withId(mixedPublish, 'mixed-publish'),
  'all-published':         withId(allPublished, 'all-published'),
  'minimal-unpublished':   withId(d.minimalRoot(happy), 'minimal-unpublished'),
  'no-changes':            withId(d.withNoChanges(happy), 'no-changes'),
  'retry-loop':            withId(d.withRetryLoop(happy), 'retry-loop'),
  'scope-switch-confirm':  withId(d.replaying(SCOPE_SWITCH_CONFIRM_SEED)(happy), 'scope-switch-confirm'),
  'regenerate':            withId(d.replaying(REGENERATE_SEED)(happy), 'regenerate'),
  'loading-quality-model': withId(d.frozenAtStage('generating')(happy), 'loading-quality-model'),
  'apply-success':         withId(d.frozenAtStage('success')(d.replaying(APPLY_SUCCESS_SEED)(mixedPublish)), 'apply-success'),
  'discard-flow':          withId(d.replaying(DISCARD_FLOW_SEED)(happy), 'discard-flow'),
};

export const SCENARIO_GROUPS = [
  { label: 'Core',       ids: ['happy', 'mixed-publish', 'all-published'] as const },
  { label: 'Edge cases', ids: ['minimal-unpublished', 'no-changes', 'retry-loop'] as const },
  { label: 'Demo aids',  ids: ['scope-switch-confirm', 'regenerate', 'loading-quality-model', 'apply-success', 'discard-flow'] as const },
] as const;
