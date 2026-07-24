import { COPY } from './copy';
import { projectScenario } from './fixtures';
import { recommendationSteps, saveSteps } from './timing';
import type { WorkspaceAction, WorkspaceState } from './types';
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
};

function restoreAssistantStage(state: WorkspaceState): WorkspaceState['stage'] {
  if (state.stage !== 'documents-view') return state.stage;
  if (state.messages.some((message) => message.kind === 'success')) return 'saved';
  if (state.messages.some((message) => message.kind === 'proposal')) return 'proposal-ready';
  return 'chat-empty';
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
      track('folder_recommendation.prompt.select', { prompt: 'improve-folder-structure' });
      return {
        ...state,
        stage: 'chat-processing-recommendation',
        assistantMode: 'full',
        recommendationStepIndex: 0,
        rationaleExpanded: false,
        messages: [
          {
            id: 'user-folder-prompt',
            role: 'user',
            kind: 'text',
            content: COPY.userPrompt,
          },
          {
            id: 'assistant-thinking',
            role: 'assistant',
            kind: 'thinking',
            content: 'I will review the current sandbox index and prepare a recommendation before anything changes.',
          },
        ],
      };

    case 'PROCESSING_STEP_DONE':
      return {
        ...state,
        recommendationStepIndex: Math.min(state.recommendationStepIndex + 1, recommendationSteps.length),
      };

    case 'RECOMMENDATION_READY':
      track('folder_recommendation.proposal.ready', { additions: 3, renames: 2, moves: 3 });
      return {
        ...state,
        stage: 'proposal-ready',
        assistantMode: 'full',
        rationaleExpanded: false,
        messages: [
          ...state.messages.filter((message) => message.id !== 'assistant-thinking'),
          {
            id: 'assistant-proposal',
            role: 'assistant',
            kind: 'proposal',
            content: COPY.proposalSummary,
          },
        ],
      };

    case 'OPEN_REVIEW':
      track('folder_recommendation.review.open');
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
      track('folder_recommendation.update.request');
      return { ...state, stage: 'confirm-update' };

    case 'CANCEL_UPDATE':
      return { ...state, stage: 'split-review' };

    case 'CONFIRM_UPDATE':
      track('folder_recommendation.update.confirm');
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
            content: 'Applying the reviewed folder recommendations to the sandbox workspace.',
          },
        ],
      };

    case 'SAVE_STEP_DONE':
      return {
        ...state,
        saveStepIndex: Math.min(state.saveStepIndex + 1, saveSteps.length),
      };

    case 'INDEX_SAVED':
      track('folder_recommendation.update.saved', { path: COPY.pathLabel });
      return {
        ...state,
        stage: 'saved',
        assistantMode: 'full',
        dirty: false,
        structureApplied: true,
        editingNodeId: null,
        pendingNewFolder: null,
        messages: [
          ...state.messages.filter((message) => message.id !== 'assistant-saving'),
          {
            id: 'assistant-success',
            role: 'assistant',
            kind: 'success',
            content: COPY.savedBody,
          },
        ],
      };

    case 'OPEN_SAVED_PATH':
      track('folder_recommendation.path.open');
      return { ...state, stage: restoreAssistantStage(state) };

    case 'CHAT_PROMPT_CHANGED':
      return { ...state, composerValue: action.value };

    case 'CHAT_PROMPT_SUBMITTED': {
      const prompt = action.prompt.trim();
      if (!prompt) return state;
      return {
        ...state,
        composerValue: '',
        messages: [
          ...state.messages,
          { id: `user-${state.messages.length}`, role: 'user', kind: 'text', content: prompt },
          {
            id: `assistant-${state.messages.length}`,
            role: 'assistant',
            kind: 'text',
            content: 'I can explain the current proposal here while keeping edits in the review pane unchanged.',
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
              ? 'Regenerating may replace your current edits. For this prototype, I will keep the reviewed proposal unchanged.'
              : 'I can regenerate recommendations, but this prototype keeps the happy-path proposal fixed for review.',
          },
        ],
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
