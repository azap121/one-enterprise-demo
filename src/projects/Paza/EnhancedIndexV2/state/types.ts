// apps/docs/app/prototypes/enhanced-index-v2/state/types.ts
export type PublishState = 'published' | 'partial' | 'not-published';
export type NodeKind = 'folder' | 'file';
export type DialogStage =
  | 'closed'
  | 'configure'
  | 'generating'
  | 'review'
  | 'confirm-scope-switch'
  | 'applying'
  | 'success';

export type ScenarioId =
  | 'happy'
  | 'mixed-publish'
  | 'all-published'
  | 'minimal-unpublished'
  | 'no-changes'
  | 'retry-loop'
  | 'scope-switch-confirm'
  | 'regenerate'
  | 'loading-quality-model'
  | 'apply-success'
  | 'discard-flow';

export type ChangeType = 'add-folder' | 'move' | 'rename';

export type ReviewScope = 'all' | 'add-folder' | 'rename' | 'move';

export interface TreeNode {
  id: string;
  name: string;
  kind: NodeKind;
  publishState: PublishState;
  removed?: boolean;
  children?: TreeNode[];
  fileExt?: 'pdf' | 'docx' | 'xlsx' | 'pptx';
}

export interface AddFolderProposal {
  id: string;
  type: 'add-folder';
  name: string;
  parentId: string;
  parentPath: string[];
  description: string;
  dependsOn?: string[];
}

export interface MoveProposal {
  id: string;
  type: 'move';
  nodeId: string;
  nodeName: string;
  nodeKind: NodeKind;
  fromParentId: string;
  fromPath: string[];
  toParentId: string;
  toPath: string[];
  reason: string;
  dependsOn?: string[];
}

export interface RenameProposal {
  id: string;
  type: 'rename';
  nodeId: string;
  oldName: string;
  newName: string;
  nodeKind: NodeKind;
  parentPath: string[];
  reason: string;
  dependsOn?: string[];
}

export type ChangeProposal =
  | AddFolderProposal
  | MoveProposal
  | RenameProposal;

export interface Scenario {
  id: ScenarioId;
  label: string;
  rootName: string;
  nodes: TreeNode[];
  proposals: ChangeProposal[];
  prompt: string;
  attachmentChip: string;
  forcedStage?: DialogStage;
  seedActions?: Action[];
  simulateRetry?: boolean;
}

export interface State {
  scenarioId: ScenarioId;
  scenario: Scenario;
  stage: DialogStage;
  scope: ReviewScope;
  pendingScope: ReviewScope | null; // set when user clicks a chip while in review stage
  proposals: ChangeProposal[];
  tree: TreeNode[];
  errorMessage: string | null;
  retriedOnce: boolean;
  regenerateCount: number;
  dirty: boolean;
  focusedProposalId: string | null;
}

export type Action =
  | { type: 'SELECT_SCENARIO'; id: ScenarioId }
  | { type: 'OPEN' }
  | { type: 'GENERATE' }
  | { type: 'GENERATION_READY' }
  | { type: 'REQUEST_SCOPE_SWITCH'; scope: ReviewScope }
  | { type: 'CONFIRM_SCOPE_SWITCH' }
  | { type: 'CANCEL_SCOPE_SWITCH' }
  | { type: 'REGENERATE' }
  | { type: 'APPLY' }
  | { type: 'APPLY_DONE' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLOSE' }
  | { type: 'SET_FOCUSED_PROPOSAL'; proposalId: string | null };
