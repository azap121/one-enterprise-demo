import { COPY } from './copy';
import { projectScenario } from './fixtures';
import { BRIEF_COPY, BRIEF_PLAN, briefPlanSteps, briefRunSteps } from './briefScenario';
import { FILING_COPY, filingScenario, filingSaveSteps, filingSteps } from './filingScenario';
import { planFormationSteps, recommendationSteps, saveSteps } from './timing';
import { SOURCING_COMPANIES, SOURCING_COPY, SOURCING_QUICK_SUGGESTIONS } from './sourcingScenario';
import { CALDERA_OPENED_COPY, CALDERA_SCRIPTED } from './dealsFixtures';
import {
  CIM_EXEC_STEPS,
  CIM_RUN_COPY,
  CIM_WORK_STEPS,
  GRATA_SIMILAR,
  INITIAL_CIM_RUN,
} from './cimRunScenario';
import { DEFAULT_AUTONOMY_DIAL, DEFAULT_MODEL_ID, isPlanGated } from './merlinFixtures';
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
  flow: 'qa',
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
  sourcingQuery: '',
  sourcingTermsExpanded: false,
  sourcingRemovedTermIds: [],
  sourcingNarrowed: false,
  sourcingSelectedIds: [],
  dealId: null,
  cimRun: INITIAL_CIM_RUN,
  cimAcceptedOnce: false,
  grataSimilarRunning: false,
  merlinMode: false,
  autonomyDial: DEFAULT_AUTONOMY_DIAL,
  normalModelId: DEFAULT_MODEL_ID,
  webSearch: false,
};

// Scripted reply for the 'Stage the client drop' card. Synthetic Aldgate fixture data,
// consistent with the Q&A triage batch (bidder groups Falcon/Kestrel/Harrier/Osprey).
const STAGE_CLIENT_DROP_REPLY = `I read the client drop from 19:42 — 18 files, three suspected duplicates, two unreadable.

PROPOSED STAGING PLAN — nothing goes live until you approve
• 13 files map to the sandbox structure with high confidence: renamed to convention and staged to their folders.
• 3 files are flagged sensitive (cap table, customer contracts): proposed Restricted tier, held from all bidder groups until re-disclosure wave 2.
• 2 files are unreadable (password-protected, low-quality scan): held back, with a note to chase the client.

That is 42 staged actions and zero live changes. Say the word and I queue the batch — you approve or hold every action before anything publishes.`;

function getScriptedReply(prompt: string): string | null {
  const normalized = prompt.toLowerCase();
  if (normalized.includes('staging plan')) return STAGE_CLIENT_DROP_REPLY;
  return null;
}

function restoreAssistantStage(state: WorkspaceState): WorkspaceState['stage'] {
  if (state.stage !== 'documents-view') return state.stage;
  if (state.messages.some((message) => message.kind === 'success')) return 'saved';
  if (state.messages.some((message) => ['proposal', 'filing-proposal', 'brief-readout'].includes(message.kind))) return 'proposal-ready';
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

    case 'SELECT_FILING_PROMPT':
      track('stifel_deal_assistant.prompt.select', { prompt: 'file-latest-upload' });
      return {
        ...state,
        stage: 'chat-processing-recommendation',
        flow: 'filing',
        assistantMode: 'full',
        recommendationStepIndex: 0,
        rationaleExpanded: false,
        proposals: filingScenario.proposals,
        tree: filingScenario.nodes,
        localProposals: [],
        overrides: {},
        collapsedNodeIds: [],
        editingNodeId: null,
        pendingNewFolder: null,
        focusedProposalId: null,
        dirty: false,
        structureApplied: false,
        messages: [
          {
            id: 'user-filing-prompt',
            role: 'user',
            kind: 'text',
            content: FILING_COPY.userPrompt,
          },
          {
            id: 'assistant-filing-thinking',
            role: 'assistant',
            kind: 'thinking',
            content: FILING_COPY.formingMessage,
          },
        ],
      };

    case 'SELECT_BRIEF_PROMPT':
      track('stifel_deal_assistant.prompt.select', { prompt: 'state-of-the-room' });
      return {
        ...state,
        stage: 'chat-planning-plan',
        flow: 'brief',
        assistantMode: 'full',
        planStepIndex: 0,
        recommendationStepIndex: 0,
        validationPlan: BRIEF_PLAN.map((phase) => ({ ...phase })),
        validationPlanApproved: false,
        rationaleExpanded: false,
        messages: [
          {
            id: 'user-brief-prompt',
            role: 'user',
            kind: 'text',
            content: BRIEF_COPY.userPrompt,
          },
          {
            id: 'assistant-brief-plan-thinking',
            role: 'assistant',
            kind: 'plan-thinking',
            content: BRIEF_COPY.formingMessage,
          },
        ],
      };

    case 'PLAN_STEP_DONE': {
      const planCap = state.flow === 'brief' ? briefPlanSteps.length : planFormationSteps.length;
      return {
        ...state,
        planStepIndex: Math.min(state.planStepIndex + 1, planCap),
      };
    }

    case 'PLAN_READY':
      track('william_blair_qa_search.triage_plan.ready', { phases: state.validationPlan.length });
      return {
        ...state,
        stage: 'plan-proposal-ready',
        assistantMode: 'full',
        planStepIndex: state.flow === 'brief' ? briefPlanSteps.length : planFormationSteps.length,
        messages: [
          ...state.messages,
          {
            id: `assistant-plan-proposal-${state.messages.length}`,
            role: 'assistant',
            kind: 'plan-proposal',
            content: state.flow === 'brief' ? BRIEF_COPY.planProposalSummary : COPY.planProposalSummary,
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
            content: state.flow === 'brief' ? BRIEF_COPY.approvedPlanMessage : COPY.approvedPlanMessage,
          },
          {
            id: `assistant-thinking-${state.messages.length}`,
            role: 'assistant',
            kind: 'thinking',
            content: state.flow === 'brief' ? BRIEF_COPY.runningApprovedPlan : COPY.runningApprovedPlan,
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

    case 'PROCESSING_STEP_DONE': {
      const stepCap =
        state.flow === 'filing'
          ? filingSteps.length
          : state.flow === 'brief'
            ? briefRunSteps.length
            : recommendationSteps.length;
      return {
        ...state,
        recommendationStepIndex: Math.min(state.recommendationStepIndex + 1, stepCap),
      };
    }

    case 'RECOMMENDATION_READY': {
      if (state.flow === 'brief') {
        track('stifel_deal_assistant.brief.ready', { sections: 3, citations: 6 });
        return {
          ...state,
          stage: 'proposal-ready',
          assistantMode: 'full',
          recommendationStepIndex: briefRunSteps.length,
          rationaleExpanded: false,
          messages: [
            ...state.messages,
            {
              id: 'assistant-brief-readout',
              role: 'assistant',
              kind: 'brief-readout',
              content: BRIEF_COPY.readoutSummary,
            },
          ],
        };
      }
      if (state.flow === 'filing') {
        track('stifel_deal_assistant.filing_plan.ready', { moves: 14, newFolders: 2, renames: 2, held: 4 });
        return {
          ...state,
          stage: 'proposal-ready',
          assistantMode: 'full',
          recommendationStepIndex: filingSteps.length,
          rationaleExpanded: false,
          messages: [
            ...state.messages,
            {
              id: 'assistant-filing-proposal',
              role: 'assistant',
              kind: 'filing-proposal',
              content: FILING_COPY.proposalSummary,
            },
          ],
        };
      }
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
    }

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
            content:
              state.flow === 'filing'
                ? 'Applying the approved filing plan and keeping held-back files in staging.'
                : 'Saving the reviewed Q&A triage decisions and retaining restricted answers in review.',
          },
        ],
      };

    case 'SAVE_STEP_DONE': {
      const saveCap = state.flow === 'filing' ? filingSaveSteps.length : saveSteps.length;
      return {
        ...state,
        saveStepIndex: Math.min(state.saveStepIndex + 1, saveCap),
      };
    }

    case 'INDEX_SAVED':
      track('william_blair_qa_search.qa_table.saved', { path: COPY.pathLabel });
      return {
        ...state,
        stage: 'saved',
        assistantMode: 'full',
        saveStepIndex: state.flow === 'filing' ? filingSaveSteps.length : saveSteps.length,
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
            content: state.flow === 'filing' ? FILING_COPY.savedBody : COPY.savedBody,
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
      // ── Deal workspace (Phase 3): the run engine keys off the queued playbook id ──
      if (state.dealId != null) {
        const runIdle = state.cimRun.phase === 'idle' || state.cimRun.phase === 'accepted';
        if (state.merlinMode && state.cimRun.queuedPlaybookId === 'pe-cim-screen' && runIdle) {
          return reducer(state, { type: 'RUN_CIM_SCREEN', prompt });
        }
        if (/@grata/i.test(prompt) && !state.grataSimilarRunning) {
          return reducer(state, { type: 'RUN_GRATA_SIMILAR', prompt });
        }
        const dealReply = !state.merlinMode
          ? CALDERA_SCRIPTED.genericNormalReply
          : state.cimRun.queuedPlaybookId != null
            ? CALDERA_SCRIPTED.otherAgentReply
            : CALDERA_SCRIPTED.genericDealReply;
        return {
          ...state,
          composerValue: '',
          cimRun: { ...state.cimRun, queuedPlaybookId: null },
          messages: [
            ...state.messages.filter((message) => message.kind !== 'deal-empty'),
            { id: `deal-user-${state.messages.length}`, role: 'user', kind: 'text', content: prompt },
            { id: `deal-assistant-${state.messages.length}`, role: 'assistant', kind: 'text', content: dealReply },
          ],
        };
      }
      const scriptedReply = getScriptedReply(prompt);
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
              scriptedReply ??
              (state.attachedFolderIds.length > 0 || state.attachedFileIds.length > 0
                ? 'Working from the selected folder and cited documents, I would focus you on answer support, duplicate handling, permission exposure, and anything that needs SME or legal routing.'
                : 'I can work from the room’s own signals — documents, permissions, Q&A, and engagement — and keep anything I draft in review until you approve it.'),
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
              ? 'Regenerating may replace your current triage edits. For this prototype, I will keep the reviewed Q&A batch unchanged.'
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

    case 'START_SOURCING': {
      const query = action.query.trim();
      if (!query) return state;
      track('one_enterprise.sourcing.start');
      return {
        ...initialState,
        stage: 'sourcing-interpreting',
        flow: 'sourcing',
        assistantMode: 'full',
        sourcingQuery: query,
        messages: [
          { id: 'sourcing-user', role: 'user', kind: 'text', content: query },
          { id: 'sourcing-interpreting', role: 'assistant', kind: 'sourcing-interpreting', content: SOURCING_COPY.interpreting },
        ],
      };
    }

    case 'SOURCING_PARSED':
      if (state.stage !== 'sourcing-interpreting') return state;
      track('one_enterprise.sourcing.parsed', { count: SOURCING_COMPANIES.length });
      return {
        ...state,
        stage: 'sourcing-parsed',
        messages: [
          ...state.messages.filter((message) => message.kind !== 'sourcing-interpreting'),
          { id: 'sourcing-parse', role: 'assistant', kind: 'sourcing-parse', content: SOURCING_COPY.interpretation },
        ],
      };

    case 'TOGGLE_SOURCING_TERMS':
      return { ...state, sourcingTermsExpanded: !state.sourcingTermsExpanded };

    case 'REMOVE_SOURCING_TERM':
      return {
        ...state,
        sourcingRemovedTermIds: state.sourcingRemovedTermIds.includes(action.termId)
          ? state.sourcingRemovedTermIds
          : [...state.sourcingRemovedTermIds, action.termId],
      };

    case 'NARROW_SOURCING':
      if (state.sourcingNarrowed) return state;
      track('one_enterprise.sourcing.narrow', { suggestion: 'commercial-mechanical' });
      return {
        ...state,
        sourcingNarrowed: true,
        // Drop any selection that no longer survives the narrowing.
        sourcingSelectedIds: state.sourcingSelectedIds.filter((id) => {
          const company = SOURCING_COMPANIES.find((candidate) => candidate.id === id);
          return company?.commercial ?? false;
        }),
        messages: [
          ...state.messages,
          {
            id: `sourcing-narrow-${state.messages.length}`,
            role: 'user',
            kind: 'text',
            content: SOURCING_QUICK_SUGGESTIONS[0].label,
          },
        ],
      };

    case 'TOGGLE_SOURCING_ROW':
      return {
        ...state,
        sourcingSelectedIds: state.sourcingSelectedIds.includes(action.companyId)
          ? state.sourcingSelectedIds.filter((id) => id !== action.companyId)
          : [...state.sourcingSelectedIds, action.companyId],
      };

    case 'OPEN_DEAL':
      track('one_enterprise.deal.open', { deal: 'caldera' });
      return {
        ...initialState,
        stage: 'deal-opened',
        flow: 'sourcing',
        dealId: 'deal-caldera',
        // The deal chat opens on a scripted empty-state (headline + context strip + chips).
        messages: [{ id: 'deal-empty', role: 'assistant', kind: 'deal-empty', content: CALDERA_OPENED_COPY.headline }],
      };

    case 'DEAL_SCREEN_TARGET':
      track('one_enterprise.deal.screen_target', { target: action.targetId });
      return {
        ...state,
        composerValue: '',
        messages: [
          ...state.messages.filter((message) => message.kind !== 'deal-empty'),
          { id: `deal-user-${state.messages.length}`, role: 'user', kind: 'text', content: `Screen ${action.targetName}’s profile` },
          {
            id: `deal-assistant-${state.messages.length}`,
            role: 'assistant',
            kind: 'text',
            content: `Opening the Grata profile for ${action.targetName} in the Intelligence canvas — sizing, seller intent, keywords, executives, evidence, and comps, all scoped to Project Caldera.`,
          },
        ],
      };

    case 'DEAL_QUEUE_CIM':
      track('one_enterprise.deal.queue_cim');
      return {
        ...state,
        composerValue: '',
        messages: [
          ...state.messages.filter((message) => message.kind !== 'deal-empty'),
          { id: `deal-user-${state.messages.length}`, role: 'user', kind: 'text', content: 'Run CIM screen when the CIM arrives' },
          { id: `deal-assistant-${state.messages.length}`, role: 'assistant', kind: 'text', content: CALDERA_SCRIPTED.queueCim },
        ],
      };

    case 'DEAL_WHATS_CHANGED':
      track('one_enterprise.deal.whats_changed');
      return {
        ...state,
        composerValue: '',
        messages: [
          ...state.messages.filter((message) => message.kind !== 'deal-empty'),
          { id: `deal-user-${state.messages.length}`, role: 'user', kind: 'text', content: 'What changed this week?' },
          { id: `deal-assistant-${state.messages.length}`, role: 'assistant', kind: 'text', content: CALDERA_SCRIPTED.whatsChanged },
        ],
      };

    case 'SET_COMPOSER':
      return { ...state, composerValue: action.value };

    // ── CIM run (Phase 3) ──

    case 'QUEUE_PLAYBOOK':
      track('one_enterprise.agent.queue', { playbook: action.playbookId });
      // Clicking an Agent card is delegating work → auto-switch into Merlin mode.
      return {
        ...state,
        merlinMode: true,
        composerValue: action.prompt,
        cimRun: { ...state.cimRun, queuedPlaybookId: action.playbookId },
      };

    case 'RUN_CIM_SCREEN': {
      const planGated = isPlanGated(state.autonomyDial);
      track('one_enterprise.cim_run.start', { dial: state.autonomyDial });
      return {
        ...state,
        composerValue: '',
        cimRun: { phase: 'working', workStepIndex: 0, execStepIndex: 0, queuedPlaybookId: null },
        messages: [
          // Freeze the previous run's cards — a rerun must not resurrect old gates.
          ...state.messages
            .filter((message) => message.kind !== 'deal-empty')
            .map((message) =>
              message.kind === 'cim-plan'
                ? { ...message, runMeta: { ...message.runMeta, done: true } }
                : message
            ),
          { id: `cim-user-${state.messages.length}`, role: 'user', kind: 'text', content: action.prompt },
          {
            id: `cim-worklog-${state.messages.length}`,
            role: 'assistant',
            kind: 'cim-worklog',
            content: planGated ? CIM_RUN_COPY.workingIntro : CIM_RUN_COPY.workingIntroAutonomous,
          },
        ],
      };
    }

    case 'CIM_WORK_STEP_DONE':
      if (state.cimRun.phase !== 'working') return state;
      return {
        ...state,
        cimRun: {
          ...state.cimRun,
          workStepIndex: Math.min(state.cimRun.workStepIndex + 1, CIM_WORK_STEPS.length),
        },
      };

    case 'CIM_PLAN_READY': {
      if (state.cimRun.phase !== 'working') return state;
      // Plan-gated dials (Guide me / Plan first) stop at the plan card; autonomous
      // dials (Draft ahead / Run it / Sandbox) skip the plan gate and run through —
      // the commit gate still fires at the canvas.
      if (isPlanGated(state.autonomyDial)) {
        track('one_enterprise.cim_run.plan_ready');
        return {
          ...state,
          cimRun: { ...state.cimRun, phase: 'plan-ready', workStepIndex: CIM_WORK_STEPS.length },
          messages: [
            ...state.messages,
            {
              id: `cim-plan-${state.messages.length}`,
              role: 'assistant',
              kind: 'cim-plan',
              content: CIM_RUN_COPY.planSummary,
            },
          ],
        };
      }
      track('one_enterprise.cim_run.plan_skipped', { dial: state.autonomyDial });
      return {
        ...state,
        cimRun: { ...state.cimRun, phase: 'executing', workStepIndex: CIM_WORK_STEPS.length, execStepIndex: 0 },
        messages: [
          ...state.messages,
          {
            id: `cim-exec-${state.messages.length}`,
            role: 'assistant',
            kind: 'cim-exec',
            content: CIM_RUN_COPY.executingIntroAutonomous,
          },
        ],
      };
    }

    case 'APPROVE_CIM_PLAN':
      if (state.cimRun.phase !== 'plan-ready') return state;
      track('one_enterprise.cim_run.plan_approved');
      return {
        ...state,
        cimRun: { ...state.cimRun, phase: 'executing', execStepIndex: 0 },
        messages: [
          ...state.messages,
          {
            id: `cim-exec-${state.messages.length}`,
            role: 'assistant',
            kind: 'cim-exec',
            content: CIM_RUN_COPY.executingIntro,
          },
        ],
      };

    case 'CIM_EXEC_STEP_DONE':
      if (state.cimRun.phase !== 'executing') return state;
      return {
        ...state,
        cimRun: {
          ...state.cimRun,
          execStepIndex: Math.min(state.cimRun.execStepIndex + 1, CIM_EXEC_STEPS.length),
        },
      };

    case 'CIM_OUTPUT_READY': {
      if (state.cimRun.phase !== 'executing') return state;
      track('one_enterprise.cim_run.output_ready', { dial: state.autonomyDial });
      const outputSummary = state.autonomyDial === 'sandbox'
        ? CIM_RUN_COPY.outputSummarySandbox
        : isPlanGated(state.autonomyDial)
          ? CIM_RUN_COPY.outputSummary
          : CIM_RUN_COPY.outputSummaryAutonomous;
      const auditLine = state.autonomyDial === 'sandbox'
        ? CIM_RUN_COPY.auditSandbox
        : state.autonomyDial === 'guide-me'
          ? CIM_RUN_COPY.auditGuideMe
          : state.autonomyDial === 'plan-first'
            ? CIM_RUN_COPY.auditPlanFirst
            : state.autonomyDial === 'run-it'
              ? CIM_RUN_COPY.auditRunIt
              : CIM_RUN_COPY.auditDraftAhead;
      return {
        ...state,
        cimRun: { ...state.cimRun, phase: 'output-ready', execStepIndex: CIM_EXEC_STEPS.length },
        messages: [
          ...state.messages,
          {
            id: `cim-output-${state.messages.length}`,
            role: 'assistant',
            kind: 'cim-output',
            content: outputSummary,
            // Stamped at run time — the audit trail can't be rewritten by later dial changes.
            runMeta: { auditLine, sandbox: state.autonomyDial === 'sandbox' },
          },
        ],
      };
    }

    case 'ACCEPT_CIM_OUTPUT': {
      if (state.cimRun.phase !== 'output-ready') return state;
      if (state.autonomyDial === 'sandbox') return state; // Sandbox can't touch the deal record.
      track('one_enterprise.cim_run.accepted', { dial: state.autonomyDial });
      const lastOutputId = [...state.messages].reverse().find((message) => message.kind === 'cim-output')?.id;
      return {
        ...state,
        cimRun: { ...state.cimRun, phase: 'accepted' },
        cimAcceptedOnce: true,
        messages: [
          ...state.messages.map((message) =>
            message.id === lastOutputId
              ? { ...message, runMeta: { ...message.runMeta, accepted: true } }
              : message
          ),
          {
            id: `cim-accepted-${state.messages.length}`,
            role: 'assistant',
            kind: 'text',
            content: isPlanGated(state.autonomyDial)
              ? CIM_RUN_COPY.acceptedReply
              : CIM_RUN_COPY.acceptedReplyAutonomous,
          },
        ],
      };
    }

    case 'RUN_GRATA_SIMILAR':
      track('one_enterprise.grata_similar.start');
      return {
        ...state,
        composerValue: '',
        grataSimilarRunning: true,
        cimRun: { ...state.cimRun, queuedPlaybookId: null },
        messages: [
          ...state.messages.filter((message) => message.kind !== 'deal-empty'),
          { id: `grata-user-${state.messages.length}`, role: 'user', kind: 'text', content: action.prompt },
          {
            id: `grata-thinking-${state.messages.length}`,
            role: 'assistant',
            kind: 'grata-similar-thinking',
            content: GRATA_SIMILAR.thinkingLabel,
          },
        ],
      };

    case 'GRATA_SIMILAR_READY':
      if (!state.grataSimilarRunning) return state;
      track('one_enterprise.grata_similar.ready', { count: GRATA_SIMILAR.companies.length });
      return {
        ...state,
        grataSimilarRunning: false,
        messages: [
          ...state.messages.filter((message) => message.kind !== 'grata-similar-thinking'),
          {
            id: `grata-similar-${state.messages.length}`,
            role: 'assistant',
            kind: 'grata-similar',
            content: GRATA_SIMILAR.intro,
          },
        ],
      };

    // ── Merlin mode (Phase 3) ──

    case 'TOGGLE_MERLIN_MODE':
      track('one_enterprise.merlin.toggle', { to: state.merlinMode ? 'normal' : 'merlin' });
      return { ...state, merlinMode: !state.merlinMode };

    case 'SET_AUTONOMY_DIAL':
      track('one_enterprise.merlin.dial', { dial: action.dial });
      return { ...state, autonomyDial: action.dial };

    case 'SET_NORMAL_MODEL':
      return { ...state, normalModelId: action.modelId };

    case 'TOGGLE_WEB_SEARCH':
      return { ...state, webSearch: !state.webSearch };

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
