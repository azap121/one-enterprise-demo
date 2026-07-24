import { COPY } from './copy';
import { projectScenario } from './fixtures';
import { planFormationSteps, recommendationSteps, saveSteps } from './timing';
import { createDefaultValidationPlan } from './validationPlan';
import type { ValidationPlanPhase, WorkspaceAction, WorkspaceState } from './types';
import {
  applyOverrides,
  buildCompositedTree,
  createUserAddFolderProposal,
  findParentId,
} from './selectors';
import { compositeTree } from '../lib/compositeTree';
import { track } from './track';

export const initialState: WorkspaceState = {
  stage: 'chat-empty',
  assistantMode: 'full',
  messages: [],
  validationPlan: createDefaultValidationPlan(),
  validationPlanApproved: false,
  planStepIndex: 0,
  recommendationStepIndex: 0,
  saveStepIndex: 0,
  scope: 'all',
  proposals: projectScenario.proposals,
  tree: projectScenario.nodes,
  localProposals: [],
  overrides: {},
  collapsedNodeIds: [],
  editingNodeId: null,
  pendingNewFolder: null,
  focusedProposalId: null,
  dirty: false,
  structureApplied: false,
  composerValue: '',
  rationaleExpanded: false,
  attachedFileIds: [],
  attachedFolderIds: [],
};

function restoreAssistantStage(state: WorkspaceState): WorkspaceState['stage'] {
  if (state.stage !== 'documents-view') return state.stage;
  if (state.messages.some((message) => message.kind === 'success')) return 'saved';
  if (state.messages.some((message) => message.kind === 'proposal')) return 'proposal-ready';
  if (state.messages.some((message) => message.kind === 'plan-proposal')) return 'plan-proposal-ready';
  if (state.messages.some((message) => message.kind === 'plan-thinking')) return 'chat-planning-plan';
  return 'chat-empty';
}

function moveValidationPlanPhase(
  phases: ValidationPlanPhase[],
  phaseId: string,
  direction: 'up' | 'down'
) {
  const currentIndex = phases.findIndex((phase) => phase.id === phaseId);
  if (currentIndex < 0) return phases;
  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0 || nextIndex >= phases.length) return phases;
  const nextPhases = [...phases];
  [nextPhases[currentIndex], nextPhases[nextIndex]] = [nextPhases[nextIndex], nextPhases[currentIndex]];
  return nextPhases;
}

export function reducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'NEW_CHAT':
      return initialState;

    case 'OPEN_ASSISTANT_FULL':
      return {
        ...state,
        stage: restoreAssistantStage(state),
        assistantMode: 'full',
      };

    case 'DOCK_ASSISTANT':
      return {
        ...state,
        assistantMode: state.stage === 'split-review' || state.stage === 'confirm-update'
          ? 'docked'
          : 'full',
      };

    case 'HIDE_ASSISTANT':
      return {
        ...state,
        assistantMode: state.stage === 'split-review' || state.stage === 'confirm-update'
          ? 'hidden'
          : 'full',
      };

    case 'SELECT_FOLDER_PROMPT':
      track('william_blair_qa_search.prompt.select', { prompt: 'triage-buyer-qa' });
      return {
        ...state,
        stage: 'chat-planning-plan',
        assistantMode: 'full',
        planStepIndex: 0,
        recommendationStepIndex: 0,
        validationPlanApproved: false,
        rationaleExpanded: false,
        messages: [
          {
            id: 'user-folder-prompt',
            role: 'user',
            kind: 'text',
            content: COPY.userPrompt,
          },
          {
            id: 'assistant-plan-thinking',
            role: 'assistant',
            kind: 'plan-thinking',
            content: COPY.formingPlanMessage,
          },
        ],
      };

    case 'PLAN_STEP_DONE':
      return {
        ...state,
        planStepIndex: Math.min(state.planStepIndex + 1, planFormationSteps.length),
      };

    case 'PLAN_READY':
      track('william_blair_qa_search.triage_plan.ready', { phases: state.validationPlan.length });
      return {
        ...state,
        stage: 'plan-proposal-ready',
        assistantMode: 'full',
        planStepIndex: planFormationSteps.length,
        messages: [
          ...state.messages,
          {
            id: `assistant-plan-proposal-${state.messages.length}`,
            role: 'assistant',
            kind: 'plan-proposal',
            content: COPY.planProposalSummary,
          },
        ],
      };

    case 'APPROVE_VALIDATION_PLAN':
      if (state.validationPlanApproved || state.stage === 'chat-processing-recommendation') {
        return state;
      }
      track('william_blair_qa_search.triage_plan.approve', { phases: state.validationPlan.length });
      return {
        ...state,
        stage: 'chat-processing-recommendation',
        assistantMode: 'full',
        recommendationStepIndex: 0,
        validationPlanApproved: true,
        rationaleExpanded: false,
        messages: [
          ...state.messages,
          {
            id: `user-plan-approved-${state.messages.length}`,
            role: 'user',
            kind: 'text',
            content: COPY.approvedPlanMessage,
          },
          {
            id: `assistant-thinking-${state.messages.length}`,
            role: 'assistant',
            kind: 'thinking',
            content: COPY.runningApprovedPlan,
          },
        ],
      };

    case 'UPDATE_VALIDATION_PLAN_PHASE':
      return {
        ...state,
        dirty: true,
        validationPlan: state.validationPlan.map((phase) =>
          phase.id === action.phaseId ? { ...phase, ...action.updates } : phase
        ),
      };

    case 'MOVE_VALIDATION_PLAN_PHASE':
      return {
        ...state,
        dirty: true,
        validationPlan: moveValidationPlanPhase(state.validationPlan, action.phaseId, action.direction),
      };

    case 'ADD_VALIDATION_PLAN_PHASE': {
      const newPhase: ValidationPlanPhase = {
        id: `custom-phase-${state.validationPlan.length + 1}-${Date.now()}`,
        title: 'New triage phase',
        description: 'Describe what Datasite AI should check before building the Q&A triage batch.',
        required: false,
      };
      const afterIndex = action.afterPhaseId
        ? state.validationPlan.findIndex((phase) => phase.id === action.afterPhaseId)
        : state.validationPlan.length - 1;
      const insertIndex = afterIndex >= 0 ? afterIndex + 1 : state.validationPlan.length;
      return {
        ...state,
        dirty: true,
        validationPlan: [
          ...state.validationPlan.slice(0, insertIndex),
          newPhase,
          ...state.validationPlan.slice(insertIndex),
        ],
      };
    }

    case 'REMOVE_VALIDATION_PLAN_PHASE':
      if (state.validationPlan.length <= 1) return state;
      return {
        ...state,
        dirty: true,
        validationPlan: state.validationPlan.filter((phase) => phase.id !== action.phaseId),
      };

    case 'PROCESSING_STEP_DONE':
      return {
        ...state,
        recommendationStepIndex: Math.min(state.recommendationStepIndex + 1, recommendationSteps.length),
      };

    case 'RECOMMENDATION_READY':
      track('william_blair_qa_search.proposal.ready', { questions: 4, duplicates: 2, sensitiveAnswers: 1 });
      return {
        ...state,
        stage: 'proposal-ready',
        assistantMode: 'full',
        recommendationStepIndex: recommendationSteps.length,
        rationaleExpanded: false,
        messages: [
          ...state.messages,
          {
            id: 'assistant-proposal',
            role: 'assistant',
            kind: 'proposal',
            content: COPY.proposalSummary,
          },
        ],
      };

    case 'OPEN_REVIEW':
      track('william_blair_qa_search.qa_table.open');
      return {
        ...state,
        stage: 'split-review',
        assistantMode: 'docked',
      };

    case 'FOCUS_PROPOSAL':
      return { ...state, focusedProposalId: action.proposalId };

    case 'BEGIN_RENAME':
      return { ...state, editingNodeId: action.nodeId, pendingNewFolder: null };

    case 'CANCEL_RENAME':
      return { ...state, editingNodeId: null, pendingNewFolder: null };

    case 'COMMIT_RENAME': {
      const name = action.name.trim();
      if (!name) return { ...state, editingNodeId: null, pendingNewFolder: null };
      if (action.nodeId === '__pending-new-folder__' && state.pendingNewFolder) {
        return reducer(state, {
          type: 'COMMIT_ADD_FOLDER',
          anchorNodeId: state.pendingNewFolder.anchorNodeId,
          name,
        });
      }
      return {
        ...state,
        dirty: true,
        editingNodeId: null,
        pendingNewFolder: null,
        overrides: {
          ...state.overrides,
          [action.nodeId]: {
            ...state.overrides[action.nodeId],
            name,
          },
        },
      };
    }

    case 'BEGIN_ADD_FOLDER':
      return {
        ...state,
        editingNodeId: '__pending-new-folder__',
        pendingNewFolder: {
          anchorNodeId: action.anchorNodeId,
          insertMode: action.mode,
        },
      };

    case 'CANCEL_ADD_FOLDER':
      return { ...state, editingNodeId: null, pendingNewFolder: null };

    case 'COMMIT_ADD_FOLDER': {
      const name = action.name.trim();
      if (!name) return { ...state, editingNodeId: null, pendingNewFolder: null };
      let parentId = action.anchorNodeId;
      if (state.pendingNewFolder?.insertMode === 'sibling') {
        const baseTree = compositeTree(
          applyOverrides(state.tree, state.overrides),
          [...state.proposals, ...state.localProposals]
        );
        parentId = findParentId(baseTree, state.pendingNewFolder.anchorNodeId) ?? '__root__';
      }
      if (state.pendingNewFolder?.insertMode === 'child') {
        parentId = state.pendingNewFolder.anchorNodeId;
      }
      const insertAfterNodeId = state.pendingNewFolder?.insertMode === 'sibling'
        ? state.pendingNewFolder.anchorNodeId
        : undefined;
      return {
        ...state,
        dirty: true,
        editingNodeId: null,
        pendingNewFolder: null,
        localProposals: [
          ...state.localProposals,
          createUserAddFolderProposal(parentId, name, insertAfterNodeId),
        ],
      };
    }

    case 'SOFT_DELETE':
      return {
        ...state,
        dirty: true,
        overrides: {
          ...state.overrides,
          [action.nodeId]: {
            ...state.overrides[action.nodeId],
            removed: true,
          },
        },
      };

    case 'RESTORE_NODE':
      return {
        ...state,
        dirty: true,
        overrides: {
          ...state.overrides,
          [action.nodeId]: {
            ...state.overrides[action.nodeId],
            removed: false,
          },
        },
      };

    case 'TOGGLE_EXPAND':
      return {
        ...state,
        collapsedNodeIds: state.collapsedNodeIds.includes(action.nodeId)
          ? state.collapsedNodeIds.filter((id) => id !== action.nodeId)
          : [...state.collapsedNodeIds, action.nodeId],
      };

    case 'BEGIN_UPDATE':
      track('william_blair_qa_search.qa_table.request_save');
      return { ...state, stage: 'confirm-update' };

    case 'CANCEL_UPDATE':
      return { ...state, stage: 'split-review' };

    case 'CONFIRM_UPDATE':
      track('william_blair_qa_search.qa_table.confirm_save');
      return {
        ...state,
        stage: 'save-processing',
        assistantMode: 'full',
        saveStepIndex: 0,
        messages: [
          ...state.messages,
          {
            id: 'assistant-saving',
            role: 'assistant',
            kind: 'saving',
            content: 'Saving Robbin’s reviewed Q&A triage decisions and retaining restricted answers in review.',
          },
        ],
      };

    case 'SAVE_STEP_DONE':
      return {
        ...state,
        saveStepIndex: Math.min(state.saveStepIndex + 1, saveSteps.length),
      };

    case 'INDEX_SAVED':
      track('william_blair_qa_search.qa_table.saved', { path: COPY.pathLabel });
      return {
        ...state,
        stage: 'saved',
        assistantMode: 'full',
        saveStepIndex: saveSteps.length,
        dirty: false,
        structureApplied: true,
        editingNodeId: null,
        pendingNewFolder: null,
        messages: [
          ...state.messages,
          {
            id: 'assistant-success',
            role: 'assistant',
            kind: 'success',
            content: COPY.savedBody,
          },
        ],
      };

    case 'OPEN_SAVED_PATH':
      track('william_blair_qa_search.qa_table.open_saved');
      return { ...state, stage: restoreAssistantStage(state) };

    case 'CHAT_PROMPT_CHANGED':
      return { ...state, composerValue: action.value };

    case 'CHAT_PROMPT_SUBMITTED': {
      const prompt = action.prompt.trim();
      if (!prompt) return state;
      return {
        ...state,
        stage: state.stage === 'chat-empty' || state.stage === 'documents-view'
          ? 'proposal-ready'
          : state.stage,
        assistantMode: 'full',
        composerValue: '',
        messages: [
          ...state.messages.filter((message) => message.kind !== 'folder-overview'),
          { id: `user-${state.messages.length}`, role: 'user', kind: 'text', content: prompt },
          {
            id: `assistant-${state.messages.length}`,
            role: 'assistant',
            kind: 'text',
            content:
              state.attachedFolderIds.length > 0 || state.attachedFileIds.length > 0
                ? 'Working from the selected folder and cited documents, I would focus Robbin on answer support, duplicate handling, permission exposure, and anything that needs SME or legal routing.'
                : 'I can answer that from the buyer Q&A and room context, then keep suggested answers in the triage batch for Robbin’s review.',
          },
        ],
      };
    }

    case 'SHOW_RATIONALE':
      return {
        ...state,
        rationaleExpanded: !state.rationaleExpanded,
      };

    case 'REGENERATE_REQUESTED':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: `assistant-regenerate-${state.messages.length}`,
            role: 'assistant',
            kind: 'text',
            content: state.dirty
              ? 'Regenerating may replace Robbin’s current triage edits. For this prototype, I will keep the reviewed Q&A batch unchanged.'
              : 'I can regenerate findings, but this prototype keeps the happy-path Q&A triage batch fixed for review.',
          },
        ],
      };

    case 'SET_CONTEXT_REFERENCES':
      return {
        ...state,
        attachedFileIds: Array.from(new Set(action.fileIds)),
        attachedFolderIds: Array.from(new Set(action.folderIds)),
      };

    case 'SET_ATTACHMENTS':
      return {
        ...state,
        attachedFileIds: Array.from(new Set(action.fileIds)),
      };

    case 'TOGGLE_ATTACHMENT':
      return {
        ...state,
        attachedFileIds: state.attachedFileIds.includes(action.fileId)
          ? state.attachedFileIds.filter((fileId) => fileId !== action.fileId)
          : [...state.attachedFileIds, action.fileId],
      };

    case 'REMOVE_ATTACHMENT':
      return {
        ...state,
        attachedFileIds: state.attachedFileIds.filter((fileId) => fileId !== action.fileId),
      };

    case 'REMOVE_FOLDER_ATTACHMENT':
      return {
        ...state,
        attachedFolderIds: state.attachedFolderIds.filter((folderId) => folderId !== action.folderId),
      };

    case 'DISCARD_CHANGES':
      return {
        ...state,
        dirty: false,
        localProposals: [],
        overrides: {},
        editingNodeId: null,
        pendingNewFolder: null,
      };

    default:
      return state;
  }
}

export function selectCompositedTree(state: WorkspaceState) {
  return buildCompositedTree(
    state.tree,
    state.proposals,
    state.localProposals,
    state.overrides,
    state.pendingNewFolder
  );
}
