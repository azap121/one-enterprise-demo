// Stifel Deal Assistant — sidecar composition (2026-07-17 pass).
// There is no "Datasite AI" destination: the room (Documents) is the main stage and the
// agent is a persistent right sidecar on EVERY tab — review queue + chat follow the user
// while they stay in their focus area. Collapsed, the sidecar waits as a floating sparkle
// button bottom-right. Structural payloads (filing plans, triage tables, previews) always
// open on the Documents tab as approval-gated pills.
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  faComments,
  faCommentsQuestion,
  faFileLines,
  faFolderTree,
  faPenLine,
  faScaleBalanced,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, GlobalStyles, Stack, Tooltip, Typography } from '@mui/material';
import { DatasitePrototypeShell, DatasiteSearchField, type NavItem } from '~/shared';
import { SearchSpotlightDialog, type RecentChat } from './AssistantPanel';
import LegalReviewWorkspace from './LegalReviewWorkspace';
import { type RightCanvasTab } from './RightContextCanvas';
import RightContextCanvasQaView from './RightContextCanvasQaView';
import { AgentDock, RoomWorkspacePane, type AgentDockMode } from './StructureWorkspace';
import UpdateFolderIndexDialog from './UpdateFolderIndexDialog';
import { registerRuntimeSellerFiles } from './rightCanvasFileData';
import { COPY } from '../state/copy';
import {
  FINAL_STEP_PAUSE_MS,
  PLAN_STEP_MS,
  RECOMMENDATION_STEP_MS,
  SAVE_STEP_MS,
  planFormationSteps,
  recommendationSteps,
  saveSteps,
} from '../state/timing';
import { BRIEF_SOURCE_FILES, briefPlanSteps, briefRunSteps } from '../state/briefScenario';
import { getFilingSpec } from '../state/filingVariants';
import { initialState, reducer } from '../state/reducer';
import { DEFAULT_SEAT, PERSONAS, type SeatId } from '../state/persona';
import type { WorkspaceAction, WorkspaceState } from '../state/types';

type CoreTab = 'documents' | 'qa' | 'review' | 'notes';

interface AiSession {
  id: string;
  title: string;
  relativeTime: string;
  state: WorkspaceState;
  openRightCanvasTabs: RightCanvasTab[];
  activeRightCanvasTab: RightCanvasTab | null;
}

// Citation sources must resolve before the room pane ever mounts (its own effect
// re-registers a fuller set on mount).
registerRuntimeSellerFiles([...BRIEF_SOURCE_FILES]);

const DRAFT_SESSION_ID = 'draft-new-chat';

export default function FolderRecommendationsChatAssistant() {
  // Seat pills were removed from the top bar — the prototype runs as Tom's operator seat.
  const [activeSeat] = useState<SeatId>(DEFAULT_SEAT);
  const [activeCoreTab, setActiveCoreTab] = useState<CoreTab>('documents');
  const [agentDockMode, setAgentDockMode] = useState<AgentDockMode>('docked');
  const [sessions, setSessions] = useState<AiSession[]>(() => createInitialSessions());
  const [draftSession, setDraftSession] = useState<AiSession>(() => createDraftSession());
  const [activeSessionId, setActiveSessionId] = useState(DRAFT_SESSION_ID);
  const [qaNotesByRowId, setQaNotesByRowId] = useState<Record<string, string>>({});
  const [selectedQaItemId, setSelectedQaItemId] = useState<string | null>(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightValue, setSpotlightValue] = useState('');

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? draftSession,
    [activeSessionId, draftSession, sessions]
  );
  const state = activeSession.state;
  const openRightCanvasTabs = activeSession.openRightCanvasTabs;
  const activeRightCanvasTab = activeSession.activeRightCanvasTab;

  const handleQaNoteChange = useCallback((rowId: string, value: string) => {
    setQaNotesByRowId((current) => ({
      ...current,
      [rowId]: value,
    }));
  }, []);

  const updateActiveSession = useCallback((updater: (session: AiSession) => AiSession) => {
    if (activeSessionId === DRAFT_SESSION_ID) {
      setDraftSession((session) => updater(session));
      return;
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) => (session.id === activeSessionId ? updater(session) : session))
    );
  }, [activeSessionId]);

  const startNewChat = useCallback(() => {
    setDraftSession(createDraftSession());
    setActiveSessionId(DRAFT_SESSION_ID);
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setAgentDockMode((current) => (current === 'collapsed' ? 'docked' : current));
  }, []);

  const dispatch = useCallback((action: WorkspaceAction) => {
    if (action.type === 'NEW_CHAT') {
      startNewChat();
      return;
    }

    const createsOrUpdatesThread =
      action.type === 'SELECT_FOLDER_PROMPT' ||
      action.type === 'SELECT_FILING_PROMPT' ||
      action.type === 'SELECT_RETRO_FILING_PROMPT' ||
      action.type === 'SELECT_CLIENT_DROP_PROMPT' ||
      action.type === 'SELECT_BRIEF_PROMPT' ||
      action.type === 'CHAT_PROMPT_SUBMITTED';
    const nextTitle = getSessionTitleForAction(action);

    if (activeSessionId === DRAFT_SESSION_ID) {
      const nextState = reducer(draftSession.state, action);

      if (createsOrUpdatesThread) {
        const nextSessionId = `session-${Date.now()}`;
        const nextSession: AiSession = {
          ...draftSession,
          id: nextSessionId,
          title: nextTitle,
          relativeTime: '1m',
          state: nextState,
        };

        setSessions((currentSessions) => [nextSession, ...currentSessions]);
        setActiveSessionId(nextSessionId);
        setDraftSession(createDraftSession());
        return;
      }

      setDraftSession((session) => ({ ...session, state: nextState }));
      return;
    }

    setSessions((currentSessions) => {
      const currentSession = currentSessions.find((session) => session.id === activeSessionId);
      if (!currentSession) return currentSessions;

      const updatedSession: AiSession = {
        ...currentSession,
        relativeTime: createsOrUpdatesThread ? '1m' : currentSession.relativeTime,
        state: reducer(currentSession.state, action),
      };

      if (!createsOrUpdatesThread) {
        return currentSessions.map((session) => (session.id === activeSessionId ? updatedSession : session));
      }

      return [
        updatedSession,
        ...currentSessions.filter((session) => session.id !== activeSessionId),
      ];
    });
  }, [activeSessionId, draftSession, startNewChat]);

  // Spotlight ("ask anything") — opened from the top-centre bar; prompts land in the
  // sidecar chat wherever the user is.
  const openSpotlight = useCallback(() => {
    setSpotlightValue('');
    setSpotlightOpen(true);
  }, []);

  const submitSpotlightPrompt = useCallback((prompt: string) => {
    setSpotlightOpen(false);
    setAgentDockMode((current) => (current === 'collapsed' ? 'docked' : current));
    dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt });
  }, [dispatch]);

  // Flow step timers — the sidecar is on every tab, so flows animate regardless of tab.
  useEffect(() => {
    if (state.stage !== 'chat-planning-plan') return undefined;
    const planStepCount = state.flow === 'brief' ? briefPlanSteps.length : planFormationSteps.length;
    if (state.planStepIndex < planStepCount) {
      const timer = window.setTimeout(() => dispatch({ type: 'PLAN_STEP_DONE' }), PLAN_STEP_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => dispatch({ type: 'PLAN_READY' }), FINAL_STEP_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [dispatch, state.flow, state.planStepIndex, state.stage]);

  useEffect(() => {
    if (state.stage !== 'chat-processing-recommendation') return undefined;
    const processingStepCount =
      state.flow === 'filing'
        ? getFilingSpec(state.filingVariant).steps.length
        : state.flow === 'brief'
          ? briefRunSteps.length
          : recommendationSteps.length;
    if (state.recommendationStepIndex < processingStepCount) {
      const timer = window.setTimeout(() => dispatch({ type: 'PROCESSING_STEP_DONE' }), RECOMMENDATION_STEP_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => dispatch({ type: 'RECOMMENDATION_READY' }), FINAL_STEP_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [dispatch, state.flow, state.filingVariant, state.recommendationStepIndex, state.stage]);

  useEffect(() => {
    if (state.stage !== 'save-processing') return undefined;
    const saveStepCount = state.flow === 'filing' ? getFilingSpec(state.filingVariant).saveSteps.length : saveSteps.length;
    if (state.saveStepIndex < saveStepCount) {
      const timer = window.setTimeout(() => dispatch({ type: 'SAVE_STEP_DONE' }), SAVE_STEP_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => dispatch({ type: 'INDEX_SAVED' }), FINAL_STEP_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [dispatch, state.flow, state.filingVariant, state.saveStepIndex, state.stage]);

  // Structural payloads open on the Documents tab (the room) and bring the structure
  // forward if the chat was full-screen.
  const openPayloadTab = useCallback((tab: RightCanvasTab) => {
    updateActiveSession((session) => ({
      ...session,
      openRightCanvasTabs: session.openRightCanvasTabs.includes(tab)
        ? session.openRightCanvasTabs
        : [...session.openRightCanvasTabs, tab],
      activeRightCanvasTab: tab,
    }));
    setActiveCoreTab('documents');
    setAgentDockMode((current) => (current === 'expanded' ? 'docked' : current));
  }, [updateActiveSession]);

  const handleViewValidationPlan = useCallback(() => {
    openPayloadTab('validation-plan');
  }, [openPayloadTab]);

  const handleApproveValidationPlan = useCallback(() => {
    dispatch({ type: 'APPROVE_VALIDATION_PLAN' });
  }, [dispatch]);

  const handleOpenFilingReview = useCallback(() => {
    dispatch({ type: 'OPEN_REVIEW' });
    openPayloadTab('filing-review');
  }, [dispatch, openPayloadTab]);

  const handleOpenCitation = useCallback((fileId: string) => {
    openPayloadTab(`file:${fileId}` as RightCanvasTab);
  }, [openPayloadTab]);

  const handleOpenSavedFiles = useCallback(() => {
    dispatch({ type: 'OPEN_SAVED_PATH' });
    openPayloadTab('files');
  }, [dispatch, openPayloadTab]);

  const handleOpenQaItem = useCallback((itemId: string) => {
    setSelectedQaItemId(itemId);
    openPayloadTab('qa');
  }, [openPayloadTab]);

  const openSkillsPage = useCallback(() => {
    openPayloadTab('skills');
  }, [openPayloadTab]);

  const handleShowStructureIndex = useCallback(() => {
    updateActiveSession((session) => ({ ...session, activeRightCanvasTab: null }));
  }, [updateActiveSession]);

  const handleSelectRightCanvasTab = useCallback((tab: RightCanvasTab) => {
    updateActiveSession((session) => ({ ...session, activeRightCanvasTab: tab }));
  }, [updateActiveSession]);

  const handleCloseRightCanvasTab = useCallback((tab: RightCanvasTab) => {
    updateActiveSession((session) => {
      const closedTabIndex = session.openRightCanvasTabs.indexOf(tab);
      const nextTabs = session.openRightCanvasTabs.filter((item) => item !== tab);
      const nextActiveTab = session.activeRightCanvasTab !== tab
        ? session.activeRightCanvasTab && nextTabs.includes(session.activeRightCanvasTab)
          ? session.activeRightCanvasTab
          : nextTabs[0] ?? null
        : nextTabs[Math.min(closedTabIndex, nextTabs.length - 1)] ?? null;

      return {
        ...session,
        openRightCanvasTabs: nextTabs,
        activeRightCanvasTab: nextActiveTab,
      };
    });
  }, [updateActiveSession]);

  const handleJumpToDocuments = useCallback(() => {
    setActiveCoreTab('documents');
  }, []);

  const handleJumpToQa = useCallback(() => {
    setActiveCoreTab('qa');
  }, []);

  const handleJumpToNotes = useCallback(() => {
    setActiveCoreTab('notes');
  }, []);

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        label: 'Documents',
        icon: <FontAwesomeIcon icon={faFileLines} />,
        active: activeCoreTab === 'documents',
        onClick: () => setActiveCoreTab('documents'),
      },
      {
        label: 'Q&A',
        icon: <FontAwesomeIcon icon={faCommentsQuestion} />,
        active: activeCoreTab === 'qa',
        onClick: () => setActiveCoreTab('qa'),
      },
      {
        label: 'Q&A table',
        icon: <FontAwesomeIcon icon={faScaleBalanced} />,
        active: activeCoreTab === 'review',
        onClick: () => setActiveCoreTab('review'),
      },
      {
        label: 'Notes',
        icon: <FontAwesomeIcon icon={faPenLine} />,
        active: activeCoreTab === 'notes',
        onClick: () => setActiveCoreTab('notes'),
      },
    ],
    [activeCoreTab]
  );

  const recentChats = useMemo<RecentChat[]>(
    () => sessions.map((session) => ({
      id: session.id,
      title: session.title,
      relativeTime: session.relativeTime,
    })),
    [sessions]
  );

  const agentExpanded = agentDockMode === 'expanded';

  return (
    <DatasitePrototypeShell
      productMode="diligence"
      productName="Datasite"
      projectName="Project Aldgate"
      navItems={navItems}
      defaultExpanded
      search={
        <DatasiteSearchField
          query=""
          projectName="Project Aldgate"
          onClick={openSpotlight}
          onClear={openSpotlight}
        />
      }
      hideSidecar
      appMenuVariant="halo"
      appSwitcherPlacement="topbar"
      topBarActions={
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mr: 1 }}>
          {([
            { mode: 'docked' as const, icon: faFolderTree, label: 'Room-first — the index stays on stage, agent docked right', pressed: !agentExpanded },
            { mode: 'expanded' as const, icon: faComments, label: 'Chat-first — the conversation takes the stage', pressed: agentExpanded },
          ]).map(({ mode, icon, label, pressed }) => (
            <Tooltip key={mode} title={label}>
              <Box
                component="button"
                aria-pressed={pressed}
                onClick={() => setAgentDockMode(mode)}
                sx={{
                  border: '1px solid',
                  borderColor: pressed ? 'text.primary' : 'divider',
                  bgcolor: pressed ? 'text.primary' : 'transparent',
                  color: pressed ? 'background.paper' : 'text.secondary',
                  borderRadius: '999px',
                  px: 1,
                  py: 0.4,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />
              </Box>
            </Tooltip>
          ))}
        </Stack>
      }
      hideNotifications
      topBarHeight={8}
      mainBg="background.defaultAlt"
      user={{ name: PERSONAS[activeSeat].name, initials: PERSONAS[activeSeat].initials }}
      sx={{ height: '100%' }}
    >
      <GlobalStyles
        styles={{
          'html, body': {
            height: '100%',
            overflow: 'hidden',
          },
          body: {
            margin: 0,
            overscrollBehavior: 'none',
          },
          '#halo-app-root': {
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          },
        }}
      />
      <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: 'background.defaultAlt', p: 1, boxSizing: 'border-box' }}>
        <Box
          sx={{
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
            borderRadius: '16px',
            bgcolor: 'background.paper',
            display: 'flex',
            position: 'relative',
          }}
        >
          {!agentExpanded ? (
            <Box sx={{ flex: 1, minWidth: 0, height: '100%', minHeight: 0, overflow: 'hidden' }}>
              {activeCoreTab === 'documents' ? (
                <RoomWorkspacePane
                  state={state}
                  dispatch={dispatch}
                  openTabs={openRightCanvasTabs}
                  activeTab={activeRightCanvasTab}
                  onAddTab={openPayloadTab}
                  onSelectTab={handleSelectRightCanvasTab}
                  onCloseTab={handleCloseRightCanvasTab}
                  onShowIndex={handleShowStructureIndex}
                  notesByRowId={qaNotesByRowId}
                  onNoteChange={handleQaNoteChange}
                  selectedQaItemId={selectedQaItemId}
                />
              ) : null}
              {activeCoreTab === 'qa' ? (
                <RightContextCanvasQaView focusTarget={null} />
              ) : null}
              {activeCoreTab === 'review' ? (
                <LegalReviewWorkspace
                  state={state}
                  dispatch={dispatch}
                  notesByRowId={qaNotesByRowId}
                  onNoteChange={handleQaNoteChange}
                />
              ) : null}
              {activeCoreTab === 'notes' ? <NotesTab /> : null}
            </Box>
          ) : null}

          <AgentDock
            state={state}
            dispatch={dispatch}
            seat={activeSeat}
            dockMode={agentDockMode}
            activeTab={activeRightCanvasTab}
            onDockModeChange={setAgentDockMode}
            onNewChat={startNewChat}
            onOpenSkillsPage={openSkillsPage}
            onViewPlan={handleViewValidationPlan}
            onApprovePlan={handleApproveValidationPlan}
            onOpenSavedFiles={handleOpenSavedFiles}
            onOpenQaItem={handleOpenQaItem}
            onOpenFilingReview={handleOpenFilingReview}
            onOpenCitation={handleOpenCitation}
          />
        </Box>
        <SearchSpotlightDialog
          open={spotlightOpen}
          value={spotlightValue}
          recentChats={recentChats}
          onChange={setSpotlightValue}
          onClose={() => setSpotlightOpen(false)}
          onSubmit={submitSpotlightPrompt}
          onNewChat={() => {
            setSpotlightOpen(false);
            startNewChat();
          }}
          onSelectSession={(sessionId) => {
            setSpotlightOpen(false);
            selectSession(sessionId);
          }}
          onOpenDocumentFile={(fileId) => {
            setSpotlightOpen(false);
            handleOpenCitation(fileId);
          }}
          onJumpToDocuments={() => {
            setSpotlightOpen(false);
            handleJumpToDocuments();
          }}
          onJumpToQa={() => {
            setSpotlightOpen(false);
            handleJumpToQa();
          }}
          onJumpToNotes={() => {
            setSpotlightOpen(false);
            handleJumpToNotes();
          }}
        />
        <UpdateFolderIndexDialog
          open={state.stage === 'confirm-update'}
          flow={state.flow}
          filingVariant={state.filingVariant}
          onCancel={() => dispatch({ type: 'CANCEL_UPDATE' })}
          onConfirm={() => dispatch({ type: 'CONFIRM_UPDATE' })}
        />
      </Box>
    </DatasitePrototypeShell>
  );
}

function NotesTab() {
  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'auto' }}>
      <Stack spacing={3} sx={{ width: 'min(880px, 100%)', px: { xs: 3, md: 6 }, py: 5 }}>
        <Stack spacing={0.75}>
          <Typography component="h1" sx={{ fontSize: 24, fontWeight: 600, color: 'text.primary' }}>
            Private notes
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: 'text.secondary' }}>
            Discovery notes for the Stifel session: sell-side room operations, Q&A discipline, and Datasite AI workflow validation.
          </Typography>
        </Stack>

        <NotesCard
          title="Search behavior to observe"
          body="Does the deal team type a single keyword such as churn, or naturally ask a richer question like finding support for churn and NRR claims that can be shared with Round 1 buyers? Watch whether the seats differ."
        />
        <NotesCard
          title="One-input hypothesis"
          body="Use the Spotlight and centre chat input to test whether search, file retrieval, Q&A lookup, and agentic planning can live in one Datasite AI interaction rather than separate top search plus sidecar surfaces."
        />
        <NotesCard
          title="Follow-up prompts"
          body="Ask whether he expects search results, prior AI work, or the source file first; then ask what evidence, permissions, and approval checks he needs before sharing a buyer-facing response."
        />
      </Stack>
    </Box>
  );
}

function NotesCard({ title, body }: { title: string; body: string }) {
  return (
    <Stack
      spacing={0.75}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography component="h2" sx={{ fontSize: 15, fontWeight: 600, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.secondary' }}>
        {body}
      </Typography>
    </Stack>
  );
}

function createDraftSession(): AiSession {
  return {
    id: DRAFT_SESSION_ID,
    title: 'New chat',
    relativeTime: '',
    state: createEmptyState(),
    openRightCanvasTabs: [],
    activeRightCanvasTab: null,
  };
}

function createInitialSessions(): AiSession[] {
  return [
    {
      id: 'session-qa-triage',
      title: 'Triage buyer questions',
      relativeTime: '1m',
      state: createReadyReviewState(),
      openRightCanvasTabs: ['enhanced-index'],
      activeRightCanvasTab: null,
    },
    {
      id: 'session-source-code-routing',
      title: 'Source-code disclosure path',
      relativeTime: '21m',
      state: createBriefDraftState(),
      openRightCanvasTabs: ['qa'],
      activeRightCanvasTab: null,
    },
    {
      id: 'session-saved-searches',
      title: 'Churn / NRR buyer support',
      relativeTime: '1h',
      state: createEscrowReviewState(),
      openRightCanvasTabs: ['enhanced-index', 'files'],
      activeRightCanvasTab: null,
    },
    {
      id: 'session-source-metadata',
      title: 'DPA answer support',
      relativeTime: '1d',
      state: createWarrantyReviewState(),
      openRightCanvasTabs: ['qa'],
      activeRightCanvasTab: null,
    },
    {
      id: 'session-discovery-notes',
      title: 'Discovery notes',
      relativeTime: '1w',
      state: createEmploymentCovenantState(),
      openRightCanvasTabs: [],
      activeRightCanvasTab: null,
    },
  ];
}

function createEmptyState(): WorkspaceState {
  return {
    ...initialState,
    messages: [],
    recommendationStepIndex: 0,
    saveStepIndex: 0,
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
}

function createReadyReviewState(): WorkspaceState {
  return {
    ...createEmptyState(),
    stage: 'proposal-ready',
    messages: [
      {
        id: 'seed-user-ip',
        role: 'user',
        kind: 'text',
        content: COPY.userPrompt,
      },
      {
        id: 'seed-assistant-ip',
        role: 'assistant',
        kind: 'proposal',
        content: COPY.proposalSummary,
      },
    ],
  };
}

function createBriefDraftState(): WorkspaceState {
  return {
    ...createEmptyState(),
    stage: 'proposal-ready',
    messages: [
      {
        id: 'seed-user-permissions',
        role: 'user',
        kind: 'text',
        content: 'Route the source-code access answer before it goes to a buyer.',
      },
      {
        id: 'seed-assistant-permissions',
        role: 'assistant',
        kind: 'text',
        content:
          'I kept the source-code answer in restricted review and routed it to legal counsel because repository detail should not go out in Round 1.',
      },
    ],
  };
}

function createEscrowReviewState(): WorkspaceState {
  return {
    ...createEmptyState(),
    stage: 'proposal-ready',
    messages: [
      {
        id: 'seed-user-readiness',
        role: 'user',
        kind: 'text',
        content: 'Run saved searches for churn and source code.',
      },
      {
        id: 'seed-assistant-readiness',
        role: 'assistant',
        kind: 'text',
        content:
          'I found cited support for churn and NRR in the ARR cohort workbook. The source-code search found only restricted policy material, so that answer should stay routed to legal.',
      },
    ],
  };
}

function createWarrantyReviewState(): WorkspaceState {
  return {
    ...createEmptyState(),
    stage: 'proposal-ready',
    messages: [
      {
        id: 'seed-user-source',
        role: 'user',
        kind: 'text',
        content: 'Check the DPA and SOC 2 answer support.',
      },
      {
        id: 'seed-assistant-source',
        role: 'assistant',
        kind: 'text',
        content:
          'SOC 2 and DPA materials are available for Round 1 disclosure, but penetration-test detail should route to the security lead before release.',
      },
    ],
  };
}

function createEmploymentCovenantState(): WorkspaceState {
  return {
    ...createEmptyState(),
    stage: 'proposal-ready',
    messages: [
      {
        id: 'seed-user-room-notes',
        role: 'user',
        kind: 'text',
        content: 'Capture discovery notes for Stifel Q&A follow-up.',
      },
      {
        id: 'seed-assistant-room-notes',
        role: 'assistant',
        kind: 'text',
        content:
          'A private notes workspace could sit beside Q&A so the deal team can capture which steps are real pain, which controls matter, and who else at Stifel should validate the workflow.',
      },
    ],
  };
}

function getSessionTitleForAction(action: WorkspaceAction) {
  if (action.type === 'SELECT_FOLDER_PROMPT') return 'Triage buyer questions';
  if (action.type === 'SELECT_FILING_PROMPT') return 'File the latest upload';
  if (action.type === 'SELECT_RETRO_FILING_PROMPT') return 'Tidy the existing filing';
  if (action.type === 'SELECT_CLIENT_DROP_PROMPT') return 'Client drop review';
  if (action.type === 'SELECT_BRIEF_PROMPT') return 'State of the room';
  if (action.type === 'CHAT_PROMPT_SUBMITTED') {
    const prompt = action.prompt.trim();
    return prompt.length > 0 ? prompt : 'New Datasite AI chat';
  }
  return 'New Datasite AI chat';
}
