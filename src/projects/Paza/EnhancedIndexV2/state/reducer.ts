import type { Action, ChangeProposal, Scenario, ScenarioId, State, TreeNode } from './types';
import { track } from './track';
import { SCENARIOS } from './scenarios';

function cloneNode(n: TreeNode): TreeNode {
  return { ...n, children: n.children ? n.children.map(cloneNode) : undefined };
}

function seed(scenario: Scenario): State {
  let s: State = {
    scenarioId: scenario.id,
    scenario,
    stage: 'closed',
    scope: 'all',
    pendingScope: null,
    proposals: scenario.proposals.map(p => ({ ...p })),
    tree: scenario.nodes.map(cloneNode),
    errorMessage: null,
    retriedOnce: false,
    regenerateCount: 0,
    dirty: false,
    focusedProposalId: null,
  };
  if (scenario.seedActions) {
    for (const a of scenario.seedActions) s = reducer(s, a);
  }
  if (scenario.forcedStage) {
    s = { ...s, stage: scenario.forcedStage };
  }
  return s;
}

export function initialState(id: ScenarioId): State {
  return seed(SCENARIOS[id]);
}

function filterProposalsByScope(all: ChangeProposal[], scope: State['scope']): ChangeProposal[] {
  if (scope === 'all') return all;
  return all.filter(p => p.type === scope);
}

export function reducer(state: State, action: Action): State {
  if (state.scenario.forcedStage && action.type !== 'SELECT_SCENARIO') {
    if (state.stage === state.scenario.forcedStage) {
      return state;
    }
  }
  switch (action.type) {
    case 'SELECT_SCENARIO': {
      track('enhanced_index.scenario.switch', { from: state.scenarioId, to: action.id });
      return seed(SCENARIOS[action.id]);
    }
    case 'OPEN':
      track('enhanced_index.dialog.open', { scenarioId: state.scenarioId });
      return {
        ...state,
        stage: 'review',
        proposals: filterProposalsByScope(state.scenario.proposals, state.scope),
        dirty: state.scenario.proposals.length > 0,
      };
    case 'GENERATE':
      track('enhanced_index.generate', { scope: state.scope });
      return { ...state, stage: 'generating' };
    case 'GENERATION_READY':
      return { ...state, stage: 'review', proposals: filterProposalsByScope(state.scenario.proposals, state.scope), dirty: state.scenario.proposals.length > 0 };
    case 'REQUEST_SCOPE_SWITCH': {
      if (action.scope === state.scope) return state;
      // If we're in review and have generated proposals, require confirmation
      if (state.stage === 'review' && state.proposals.length > 0) {
        track('enhanced_index.scope.switch_requested', { from: state.scope, to: action.scope });
        return { ...state, stage: 'confirm-scope-switch', pendingScope: action.scope };
      }
      // Otherwise (configure stage, or no proposals yet): switch immediately
      return { ...state, scope: action.scope };
    }
    case 'CONFIRM_SCOPE_SWITCH': {
      if (!state.pendingScope) return state;
      track('enhanced_index.scope.switch_confirmed', { from: state.scope, to: state.pendingScope });
      return { ...state, scope: state.pendingScope, pendingScope: null, stage: 'generating', focusedProposalId: null };
    }
    case 'CANCEL_SCOPE_SWITCH':
      track('enhanced_index.scope.switch_cancelled', {});
      return { ...state, pendingScope: null, stage: 'review' };
    case 'REGENERATE':
      track('enhanced_index.regenerate', { scope: state.scope, count: state.regenerateCount + 1 });
      return { ...state, stage: 'generating', regenerateCount: state.regenerateCount + 1, focusedProposalId: null };
    case 'APPLY':
      track('enhanced_index.apply', { scope: state.scope, count: state.proposals.length });
      return { ...state, stage: 'applying' };
    case 'APPLY_DONE':
      return { ...state, stage: 'success' };
    case 'CLEAR_ERROR':
      return { ...state, errorMessage: null };
    case 'CLOSE':
      track('enhanced_index.close', { stage: state.stage, dirty: state.dirty });
      return { ...state, stage: 'closed', pendingScope: null, dirty: false, focusedProposalId: null };
    case 'SET_FOCUSED_PROPOSAL':
      track('enhanced_index.proposal.focus', { proposalId: action.proposalId });
      return { ...state, focusedProposalId: action.proposalId };
    default:
      return state;
  }
}
