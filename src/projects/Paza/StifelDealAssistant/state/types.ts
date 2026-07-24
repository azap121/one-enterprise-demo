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
  insertAfterNodeId?: string;
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

export type WorkspaceStage =
  | 'chat-empty'
  | 'chat-planning-plan'
  | 'plan-proposal-ready'
  | 'chat-processing-recommendation'
  | 'proposal-ready'
  | 'split-review'
  | 'confirm-update'
  | 'save-processing'
  | 'saved'
  | 'documents-view';

export type AssistantMode = 'full' | 'docked' | 'hidden';

export type ChatMessageKind =
  | 'text'
  | 'plan-thinking'
  | 'plan-proposal'
  | 'proposal'
  | 'filing-proposal'
  | 'brief-readout'
  | 'thinking'
  | 'saving'
  | 'success'
  | 'rationale'
  | 'folder-overview';

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  kind: ChatMessageKind;
  content: string;
  citationFileIds?: string[];
}

export interface NodeOverride {
  name?: string;
  removed?: boolean;
}

export type OverrideMap = Record<string, NodeOverride>;

export interface PendingNewFolder {
  anchorNodeId: string;
  insertMode: 'sibling' | 'child';
}

export interface ValidationPlanPhase {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export type WorkspaceFlow = 'qa' | 'filing' | 'brief';

// Which flavour of the filing machine is running (P0.1): new uploads, retro-sweep of
// existing files, or the client-drop approval queue. Only meaningful when flow === 'filing'.
export type FilingVariantId = 'uploads' | 'retro' | 'client-drop';

export interface WorkspaceState {
  stage: WorkspaceStage;
  flow: WorkspaceFlow;
  filingVariant: FilingVariantId;
  assistantMode: AssistantMode;
  messages: ChatMessage[];
  validationPlan: ValidationPlanPhase[];
  validationPlanApproved: boolean;
  planStepIndex: number;
  recommendationStepIndex: number;
  saveStepIndex: number;
  scope: ReviewScope;
  proposals: ChangeProposal[];
  tree: TreeNode[];
  localProposals: ChangeProposal[];
  overrides: OverrideMap;
  collapsedNodeIds: string[];
  editingNodeId: string | null;
  pendingNewFolder: PendingNewFolder | null;
  focusedProposalId: string | null;
  dirty: boolean;
  structureApplied: boolean;
  composerValue: string;
  rationaleExpanded: boolean;
  attachedFileIds: string[];
  attachedFolderIds: string[];
}

export type WorkspaceAction =
  | { type: 'SELECT_FOLDER_PROMPT' }
  | { type: 'SELECT_FILING_PROMPT' }
  | { type: 'SELECT_RETRO_FILING_PROMPT' }
  | { type: 'SELECT_CLIENT_DROP_PROMPT' }
  | { type: 'SELECT_BRIEF_PROMPT' }
  | { type: 'NEW_CHAT' }
  | { type: 'OPEN_ASSISTANT_FULL' }
  | { type: 'DOCK_ASSISTANT' }
  | { type: 'HIDE_ASSISTANT' }
  | { type: 'APPROVE_VALIDATION_PLAN' }
  | { type: 'PLAN_STEP_DONE' }
  | { type: 'PLAN_READY' }
  | { type: 'UPDATE_VALIDATION_PLAN_PHASE'; phaseId: string; updates: Partial<Pick<ValidationPlanPhase, 'title' | 'description' | 'required'>> }
  | { type: 'MOVE_VALIDATION_PLAN_PHASE'; phaseId: string; direction: 'up' | 'down' }
  | { type: 'ADD_VALIDATION_PLAN_PHASE'; afterPhaseId?: string }
  | { type: 'REMOVE_VALIDATION_PLAN_PHASE'; phaseId: string }
  | { type: 'PROCESSING_STEP_DONE' }
  | { type: 'RECOMMENDATION_READY' }
  | { type: 'OPEN_REVIEW' }
  | { type: 'FOCUS_PROPOSAL'; proposalId: string | null }
  | { type: 'BEGIN_RENAME'; nodeId: string }
  | { type: 'CANCEL_RENAME' }
  | { type: 'COMMIT_RENAME'; nodeId: string; name: string }
  | { type: 'BEGIN_ADD_FOLDER'; anchorNodeId: string; mode: 'sibling' | 'child' }
  | { type: 'CANCEL_ADD_FOLDER' }
  | { type: 'COMMIT_ADD_FOLDER'; anchorNodeId: string; name: string }
  | { type: 'SOFT_DELETE'; nodeId: string }
  | { type: 'RESTORE_NODE'; nodeId: string }
  | { type: 'TOGGLE_EXPAND'; nodeId: string }
  | { type: 'BEGIN_UPDATE' }
  | { type: 'CANCEL_UPDATE' }
  | { type: 'CONFIRM_UPDATE' }
  | { type: 'SAVE_STEP_DONE' }
  | { type: 'INDEX_SAVED' }
  | { type: 'OPEN_SAVED_PATH' }
  | { type: 'CHAT_PROMPT_CHANGED'; value: string }
  | { type: 'CHAT_PROMPT_SUBMITTED'; prompt: string }
  | { type: 'SHOW_RATIONALE' }
  | { type: 'REGENERATE_REQUESTED' }
  | { type: 'SET_CONTEXT_REFERENCES'; fileIds: string[]; folderIds: string[] }
  | { type: 'SET_ATTACHMENTS'; fileIds: string[] }
  | { type: 'TOGGLE_ATTACHMENT'; fileId: string }
  | { type: 'REMOVE_ATTACHMENT'; fileId: string }
  | { type: 'REMOVE_FOLDER_ATTACHMENT'; folderId: string }
  | { type: 'DISCARD_CHANGES' };
