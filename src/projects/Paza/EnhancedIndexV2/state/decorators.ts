import type { Scenario, DialogStage, Action, ChangeProposal } from './types';

export function frozenAtStage(stage: DialogStage) {
  return (s: Scenario): Scenario => ({ ...s, forcedStage: stage });
}

export function replaying(seedActions: Action[]) {
  return (s: Scenario): Scenario => ({ ...s, seedActions });
}

export function withRetryLoop(s: Scenario): Scenario {
  return { ...s, simulateRetry: true };
}

export function withNoChanges(s: Scenario): Scenario {
  return { ...s, proposals: [] satisfies ChangeProposal[], attachmentChip: '0 changes' };
}

export function minimalRoot(s: Scenario): Scenario {
  return {
    ...s,
    nodes: s.nodes.length ? [s.nodes[0]] : [],
    proposals: s.proposals.slice(0, 2),
    attachmentChip: '2 changes',
  };
}
