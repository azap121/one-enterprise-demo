// apps/docs/app/prototypes/enhanced-index-v2/state/types.ts
import type { CimRunState } from './cimRunScenario';
import type { AutonomyDialId } from './merlinFixtures';

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
  | 'documents-view'
  // Sourcing flow stages (Grata-style AI search).
  | 'sourcing-interpreting'
  | 'sourcing-parsed'
  // Deal-opened state for a promoted deal (Project Caldera).
  | 'deal-opened';

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
  | 'folder-overview'
  // Sourcing flow.
  | 'sourcing-interpreting'
  | 'sourcing-parse'
  // Deal workspace (Phase 2) — chat empty-state with headline + context strip + chips.
  | 'deal-empty'
  // CIM run (Phase 3) — glass-box analysis log, plan + approval gate, execution log,
  // output card pointing at the cited review canvas.
  | 'cim-worklog'
  | 'cim-plan'
  | 'cim-exec'
  | 'cim-output'
  // "@Grata find similar" mid-chat (Phase 3, federation beat).
  | 'grata-similar-thinking'
  | 'grata-similar';

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  kind: ChatMessageKind;
  content: string;
  citationFileIds?: string[];
  // CIM run cards freeze their run-time facts here so a later rerun (possibly on a
  // different autonomy dial) can't rewrite history — the audit stamp is the point.
  runMeta?: {
    auditLine?: string;
    sandbox?: boolean;
    accepted?: boolean;
    done?: boolean;
  };
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

export type WorkspaceFlow = 'qa' | 'filing' | 'brief' | 'sourcing';

export interface WorkspaceState {
  stage: WorkspaceStage;
  flow: WorkspaceFlow;
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
  // ── Sourcing flow (Grata-style AI search) ──
  // The query submitted into the sourcing scenario.
  sourcingQuery: string;
  // Whether the parse row's overflow term chips are expanded (+4).
  sourcingTermsExpanded: boolean;
  // Company ids removed cosmetically from the parse term chips (× affordance).
  sourcingRemovedTermIds: string[];
  // Whether the commercial-mechanical narrowing has been applied (State 4).
  sourcingNarrowed: boolean;
  // Selected company ids in the results canvas (checkboxes → floating action bar).
  sourcingSelectedIds: string[];
  // ── Deal workspace (Phase 2) ──
  // Set when the Caldera deal is open — distinguishes the deal workspace from the
  // Aldgate sourcing scenario (both use flow: 'sourcing'). null → not in a deal.
  dealId: string | null;
  // ── CIM run (Phase 3) ── phase machine for the scripted playbook run.
  cimRun: CimRunState;
  // Sticky: a CIM screen has been accepted at least once this session — keeps the
  // Overview echo (activity row + next step) alive across reruns.
  cimAcceptedOnce: boolean;
  // "@Grata find similar" scripted lookup in flight.
  grataSimilarRunning: boolean;
  // ── Merlin mode (Phase 3) ── two-mode assistant frame, sticky per session/space.
  // false = Normal (chat, user-picked frontier model, never writes to the deal).
  merlinMode: boolean;
  // Autonomy dial — where the human signs. Branches the run engine: 1–2 plan-gated,
  // 3–5 straight through to the commit gate (Sandbox can't commit at all).
  autonomyDial: AutonomyDialId;
  // Normal-mode frontier model choice + web toggle (roster fixture).
  normalModelId: string;
  webSearch: boolean;
}

export type WorkspaceAction =
  | { type: 'SELECT_FOLDER_PROMPT' }
  | { type: 'SELECT_FILING_PROMPT' }
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
  | { type: 'DISCARD_CHANGES' }
  // ── Sourcing flow ──
  | { type: 'START_SOURCING'; query: string }
  | { type: 'SOURCING_PARSED' }
  | { type: 'TOGGLE_SOURCING_TERMS' }
  | { type: 'REMOVE_SOURCING_TERM'; termId: string }
  | { type: 'NARROW_SOURCING' }
  | { type: 'TOGGLE_SOURCING_ROW'; companyId: string }
  | { type: 'OPEN_DEAL' }
  // ── Deal workspace (Phase 2) ──
  // Screen a target's Grata profile — appends a chat exchange; the orchestrator opens
  // the Intelligence canvas view for the target.
  | { type: 'DEAL_SCREEN_TARGET'; targetId: string; targetName: string }
  // "Run CIM screen when the CIM arrives" — governed, approval-gated reply.
  | { type: 'DEAL_QUEUE_CIM' }
  // "What changed this week?" — scripted weekly digest.
  | { type: 'DEAL_WHATS_CHANGED' }
  // Insert a prepared prompt into the composer (Playbook cards; don't auto-send).
  | { type: 'SET_COMPOSER'; value: string }
  // ── CIM run (Phase 3) ──
  // Agent card click: stage the prompt in the composer AND remember the playbook id so
  // the run engine keys off the id at submit time (never composer-string parsing).
  | { type: 'QUEUE_PLAYBOOK'; playbookId: string; prompt: string }
  | { type: 'RUN_CIM_SCREEN'; prompt: string }
  | { type: 'CIM_WORK_STEP_DONE' }
  | { type: 'CIM_PLAN_READY' }
  | { type: 'APPROVE_CIM_PLAN' }
  | { type: 'CIM_EXEC_STEP_DONE' }
  | { type: 'CIM_OUTPUT_READY' }
  | { type: 'ACCEPT_CIM_OUTPUT' }
  | { type: 'RUN_GRATA_SIMILAR'; prompt: string }
  | { type: 'GRATA_SIMILAR_READY' }
  // ── Merlin mode (Phase 3) ──
  | { type: 'TOGGLE_MERLIN_MODE' }
  | { type: 'SET_AUTONOMY_DIAL'; dial: AutonomyDialId }
  | { type: 'SET_NORMAL_MODEL'; modelId: string }
  | { type: 'TOGGLE_WEB_SEARCH' };
