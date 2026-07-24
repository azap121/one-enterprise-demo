import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  faArrowDownLeftAndArrowUpRightToCenter,
  faArrowUpRightAndArrowDownLeftFromCenter,
  faChevronDown,
  faChevronRight,
  faCommentsQuestion,
  faFileLines,
  faFolder,
  faMagnifyingGlass,
  faPenLine,
  faScaleBalanced,
  faSidebarFlip,
  faXmark,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, GlobalStyles, IconButton, InputBase, Stack, Tooltip, Typography } from '@mui/material';
import { DatasitePrototypeShell, type NavItem } from '~/shared';
import AiSparkleBadge from './AiSparkleBadge';
import AssistantPanel, { type RecentChat } from './AssistantPanel';
import type { AssistantRailMode } from './AssistantRail';
import LegalReviewWorkspace from './LegalReviewWorkspace';
import RightContextCanvas, { getComposerPlaceholderForRightTab, type RightCanvasMotion, type RightCanvasTab } from './RightContextCanvas';
import RightContextCanvasFileDetailView from './RightContextCanvasFileDetailView';
import RightContextCanvasFilesView from './RightContextCanvasFilesView';
import RightContextCanvasQaView, { type QaFocusTarget } from './RightContextCanvasQaView';
import SandboxFolderStructureView from './SandboxFolderStructureView';
import UpdateFolderIndexDialog from './UpdateFolderIndexDialog';
import {
  SELLER_INDEX_SOURCE,
  findSellerFileById,
  findSellerContainingFolderId,
  findSellerFolderById,
  getFilesForFolderId,
  type SellerIndexFile,
  type SellerIndexFolder,
  type SellerIndexFolderNode,
  type SellerIndexNode,
  type SellerIndexSource,
} from './rightCanvasFileData';
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
import { initialState, reducer } from '../state/reducer';
import type { WorkspaceAction, WorkspaceState } from '../state/types';

type CoreTab = 'ai' | 'documents' | 'qa' | 'review' | 'notes';
type RightCanvasDisplayMode = 'default' | 'expanded';
type DocumentSourceSection = {
  id: 'index';
  label: string;
  source: SellerIndexSource;
};
type DocumentPreviewState = {
  fileIds: string[];
  activeFileId: string | null;
  open: boolean;
  displayMode: RightCanvasDisplayMode;
};

interface AiSession {
  id: string;
  title: string;
  relativeTime: string;
  state: WorkspaceState;
  rightCanvasOpen: boolean;
  openRightCanvasTabs: RightCanvasTab[];
  activeRightCanvasTab: RightCanvasTab | null;
  rightCanvasDisplayMode: RightCanvasDisplayMode;
}

const DRAFT_SESSION_ID = 'draft-new-chat';
const EMPTY_RIGHT_CANVAS_BASIS = 'clamp(420px, 44vw, 720px)';
const REVIEW_RIGHT_CANVAS_BASIS = 'clamp(560px, 48vw, 680px)';
const ASSISTANT_RAIL_BASIS = '236px';
const DOCUMENT_PREVIEW_RAIL_BASIS = 'clamp(520px, 44vw, 680px)';
const RIGHT_CANVAS_TOGGLE_MS = 280;
const REVIEW_ENTER_MS = 420;
const REVIEWER_DOCUMENT_SECTIONS: DocumentSourceSection[] = [
  { id: 'index', label: 'Index', source: SELLER_INDEX_SOURCE },
];

export default function FolderRecommendationsChatAssistant() {
  const [activeCoreTab, setActiveCoreTab] = useState<CoreTab>('ai');
  const [assistantRailMode, setAssistantRailMode] = useState<AssistantRailMode>('chat');
  const [sessions, setSessions] = useState<AiSession[]>(() => createInitialSessions());
  const [draftSession, setDraftSession] = useState<AiSession>(() => createDraftSession());
  const [activeSessionId, setActiveSessionId] = useState(DRAFT_SESSION_ID);
  const [selectedDocumentFolderId, setSelectedDocumentFolderId] = useState<string | null>(null);
  const [documentRevealKey, setDocumentRevealKey] = useState(0);
  const [documentPreview, setDocumentPreview] = useState<DocumentPreviewState>(() => createEmptyDocumentPreview());
  const [documentQaFocusTarget, setDocumentQaFocusTarget] = useState<QaFocusTarget | null>(null);
  const [rightCanvasMotion, setRightCanvasMotion] = useState<RightCanvasMotion>('idle');
  const [qaNotesByRowId, setQaNotesByRowId] = useState<Record<string, string>>({});
  const [selectedQaItemId, setSelectedQaItemId] = useState<string | null>(null);
  const transitionTimersRef = useRef<number[]>([]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? draftSession,
    [activeSessionId, draftSession, sessions]
  );
  const state = activeSession.state;
  const rightCanvasOpen = activeSession.rightCanvasOpen;
  const openRightCanvasTabs = activeSession.openRightCanvasTabs;
  const activeRightCanvasTab = activeSession.activeRightCanvasTab;
  const rightCanvasExpanded = rightCanvasOpen && activeSession.rightCanvasDisplayMode === 'expanded';
  const reviewOpen = openRightCanvasTabs.includes('enhanced-index');
  const rightCanvasBasis = activeRightCanvasTab
    ? REVIEW_RIGHT_CANVAS_BASIS
    : EMPTY_RIGHT_CANVAS_BASIS;
  const selectedDocumentFolder = useMemo(
    () => selectedDocumentFolderId ? findSellerFolderById(selectedDocumentFolderId) : null,
    [selectedDocumentFolderId]
  );
  const selectedDocumentFolderFiles = useMemo(
    () => selectedDocumentFolderId ? getFilesForFolderId(selectedDocumentFolderId) : [],
    [selectedDocumentFolderId]
  );

  const handleQaNoteChange = useCallback((rowId: string, value: string) => {
    setQaNotesByRowId((current) => ({
      ...current,
      [rowId]: value,
    }));
  }, []);

  const openDocumentPreview = useCallback((fileId: string) => {
    setDocumentPreview((current) => ({
      ...current,
      fileIds: current.fileIds.includes(fileId) ? current.fileIds : [...current.fileIds, fileId],
      activeFileId: fileId,
      open: true,
    }));
  }, []);

  const selectDocumentPreview = useCallback((fileId: string) => {
    setDocumentPreview((current) => ({
      ...current,
      activeFileId: fileId,
      open: true,
    }));
  }, []);

  const closeDocumentPreview = useCallback((fileId: string) => {
    setDocumentPreview((current) => {
      const closedIndex = current.fileIds.indexOf(fileId);
      const nextFileIds = current.fileIds.filter((id) => id !== fileId);
      const nextActiveFileId = current.activeFileId !== fileId
        ? current.activeFileId && nextFileIds.includes(current.activeFileId)
          ? current.activeFileId
          : nextFileIds[0] ?? null
        : nextFileIds[Math.min(closedIndex, nextFileIds.length - 1)] ?? null;

      return {
        fileIds: nextFileIds,
        activeFileId: nextActiveFileId,
        open: nextFileIds.length > 0 ? current.open : false,
        displayMode: nextFileIds.length > 0 ? current.displayMode : 'default',
      };
    });
  }, []);

  const hideDocumentPreview = useCallback(() => {
    setDocumentPreview((current) => ({ ...current, open: false, displayMode: 'default' }));
  }, []);

  const showDocumentPreview = useCallback(() => {
    setDocumentPreview((current) => ({
      ...current,
      activeFileId: current.activeFileId ?? current.fileIds[0] ?? null,
      open: current.fileIds.length > 0,
    }));
  }, []);

  const expandDocumentPreview = useCallback(() => {
    setDocumentPreview((current) => ({ ...current, open: true, displayMode: 'expanded' }));
  }, []);

  const restoreDocumentPreview = useCallback(() => {
    setDocumentPreview((current) => ({ ...current, displayMode: 'default' }));
  }, []);

  const clearReviewTransitionTimers = useCallback(() => {
    transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimersRef.current = [];
  }, []);

  const setReviewTransitionTimer = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      transitionTimersRef.current = transitionTimersRef.current.filter((id) => id !== timer);
      callback();
    }, delay);
    transitionTimersRef.current.push(timer);
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
    clearReviewTransitionTimers();
    setRightCanvasMotion('idle');
    setAssistantRailMode('chat');
    setDraftSession(createDraftSession());
    setActiveSessionId(DRAFT_SESSION_ID);
    setActiveCoreTab('ai');
  }, [clearReviewTransitionTimers]);

  const selectSession = useCallback((sessionId: string) => {
    clearReviewTransitionTimers();
    setRightCanvasMotion('idle');
    setAssistantRailMode('chat');
    setActiveSessionId(sessionId);
    setActiveCoreTab('ai');
  }, [clearReviewTransitionTimers]);

  const openSelectedFolderOverview = useCallback(() => {
    if (!selectedDocumentFolder || selectedDocumentFolderFiles.length === 0) {
      setActiveCoreTab('ai');
      return;
    }

    clearReviewTransitionTimers();
    setRightCanvasMotion('idle');
    setDraftSession({
      ...createDraftSession(),
      state: createFolderOverviewState(selectedDocumentFolder, selectedDocumentFolderFiles),
      openRightCanvasTabs: ['files'],
      activeRightCanvasTab: 'files',
    });
    setActiveSessionId(DRAFT_SESSION_ID);
    setActiveCoreTab('ai');
  }, [clearReviewTransitionTimers, selectedDocumentFolder, selectedDocumentFolderFiles]);

  const dispatch = useCallback((action: WorkspaceAction) => {
    if (action.type === 'NEW_CHAT') {
      startNewChat();
      return;
    }

    const createsOrUpdatesThread = action.type === 'SELECT_FOLDER_PROMPT' || action.type === 'CHAT_PROMPT_SUBMITTED';
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
        title: createsOrUpdatesThread ? currentSession.title : currentSession.title,
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

  useEffect(() => clearReviewTransitionTimers, [clearReviewTransitionTimers]);

  useEffect(() => {
    if (activeCoreTab !== 'ai') return undefined;
    if (state.stage !== 'chat-planning-plan') return undefined;
    if (state.planStepIndex < planFormationSteps.length) {
      const timer = window.setTimeout(() => dispatch({ type: 'PLAN_STEP_DONE' }), PLAN_STEP_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => dispatch({ type: 'PLAN_READY' }), FINAL_STEP_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [activeCoreTab, dispatch, state.planStepIndex, state.stage]);

  useEffect(() => {
    if (activeCoreTab !== 'ai') return undefined;
    if (state.stage !== 'chat-processing-recommendation') return undefined;
    if (state.recommendationStepIndex < recommendationSteps.length) {
      const timer = window.setTimeout(() => dispatch({ type: 'PROCESSING_STEP_DONE' }), RECOMMENDATION_STEP_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => dispatch({ type: 'RECOMMENDATION_READY' }), FINAL_STEP_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [activeCoreTab, dispatch, state.recommendationStepIndex, state.stage]);

  useEffect(() => {
    if (activeCoreTab !== 'ai') return undefined;
    if (state.stage !== 'save-processing') return undefined;
    if (state.saveStepIndex < saveSteps.length) {
      const timer = window.setTimeout(() => dispatch({ type: 'SAVE_STEP_DONE' }), SAVE_STEP_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => dispatch({ type: 'INDEX_SAVED' }), FINAL_STEP_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [activeCoreTab, dispatch, state.saveStepIndex, state.stage]);

  const openValidationPlanContext = useCallback((reducedMotion = false) => {
    updateActiveSession((session) => ({
      ...session,
      rightCanvasOpen: true,
      rightCanvasDisplayMode: 'default',
      openRightCanvasTabs: session.openRightCanvasTabs.includes('validation-plan')
        ? session.openRightCanvasTabs
        : [...session.openRightCanvasTabs, 'validation-plan'],
      activeRightCanvasTab: 'validation-plan',
    }));
    setRightCanvasMotion(reducedMotion ? 'idle' : 'entering-from-right');
    if (!reducedMotion) {
      setReviewTransitionTimer(() => setRightCanvasMotion('idle'), REVIEW_ENTER_MS);
    }
  }, [setReviewTransitionTimer, updateActiveSession]);

  const handleViewValidationPlan = useCallback(() => {
    clearReviewTransitionTimers();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    openValidationPlanContext(reducedMotion);
  }, [clearReviewTransitionTimers, openValidationPlanContext]);

  const handleApproveValidationPlan = useCallback(() => {
    dispatch({ type: 'APPROVE_VALIDATION_PLAN' });
  }, [dispatch]);

  const handleShowRightCanvas = useCallback(() => {
    clearReviewTransitionTimers();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    updateActiveSession((session) => ({
      ...session,
      rightCanvasOpen: true,
      activeRightCanvasTab: session.activeRightCanvasTab ?? session.openRightCanvasTabs[0] ?? null,
    }));
    setRightCanvasMotion(reducedMotion ? 'idle' : 'entering-from-right');
    if (!reducedMotion) {
      setReviewTransitionTimer(() => setRightCanvasMotion('idle'), RIGHT_CANVAS_TOGGLE_MS);
    }
  }, [clearReviewTransitionTimers, setReviewTransitionTimer, updateActiveSession]);

  const handleHideRightCanvas = useCallback(() => {
    clearReviewTransitionTimers();
    updateActiveSession((session) => ({
      ...session,
      rightCanvasOpen: false,
      rightCanvasDisplayMode: 'default',
    }));
    setRightCanvasMotion('idle');
  }, [clearReviewTransitionTimers, updateActiveSession]);

  const handleExpandRightCanvas = useCallback(() => {
    clearReviewTransitionTimers();
    setRightCanvasMotion('idle');
    updateActiveSession((session) => ({
      ...session,
      rightCanvasOpen: true,
      rightCanvasDisplayMode: 'expanded',
    }));
  }, [clearReviewTransitionTimers, updateActiveSession]);

  const handleRestoreRightCanvas = useCallback(() => {
    clearReviewTransitionTimers();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    updateActiveSession((session) => ({
      ...session,
      rightCanvasDisplayMode: 'default',
    }));
    setRightCanvasMotion(reducedMotion ? 'idle' : 'restoring-to-side');
    if (!reducedMotion) {
      setReviewTransitionTimer(() => setRightCanvasMotion('idle'), RIGHT_CANVAS_TOGGLE_MS);
    }
  }, [clearReviewTransitionTimers, setReviewTransitionTimer, updateActiveSession]);

  const handleAddRightCanvasTab = useCallback((tab: RightCanvasTab) => {
    clearReviewTransitionTimers();
    updateActiveSession((session) => ({
      ...session,
      rightCanvasOpen: true,
      openRightCanvasTabs: session.openRightCanvasTabs.includes(tab)
        ? session.openRightCanvasTabs
        : [...session.openRightCanvasTabs, tab],
      activeRightCanvasTab: tab,
    }));
    setRightCanvasMotion('idle');
  }, [clearReviewTransitionTimers, updateActiveSession]);

  const openAssistantBuilderPage = useCallback((mode: Extract<AssistantRailMode, 'skills' | 'templates'>) => {
    clearReviewTransitionTimers();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setAssistantRailMode(mode);
    setActiveCoreTab('ai');
    updateActiveSession((session) => {
      const openTabs = [...session.openRightCanvasTabs];
      (['skills', 'templates'] as const).forEach((tab) => {
        if (!openTabs.includes(tab)) openTabs.push(tab);
      });
      return {
        ...session,
        rightCanvasOpen: true,
        rightCanvasDisplayMode: 'default',
        openRightCanvasTabs: openTabs,
        activeRightCanvasTab: mode,
      };
    });
    setRightCanvasMotion(reducedMotion ? 'idle' : 'entering-from-right');
    if (!reducedMotion) {
      setReviewTransitionTimer(() => setRightCanvasMotion('idle'), REVIEW_ENTER_MS);
    }
  }, [clearReviewTransitionTimers, setReviewTransitionTimer, updateActiveSession]);

  const handleOpenQaItem = useCallback((itemId: string) => {
    setSelectedQaItemId(itemId);
    clearReviewTransitionTimers();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    updateActiveSession((session) => ({
      ...session,
      rightCanvasOpen: true,
      rightCanvasDisplayMode: 'default',
      openRightCanvasTabs: session.openRightCanvasTabs.includes('qa')
        ? session.openRightCanvasTabs
        : [...session.openRightCanvasTabs, 'qa'],
      activeRightCanvasTab: 'qa',
    }));
    setActiveCoreTab('ai');
    setRightCanvasMotion(reducedMotion ? 'idle' : 'entering-from-right');
    if (!reducedMotion) {
      setReviewTransitionTimer(() => setRightCanvasMotion('idle'), REVIEW_ENTER_MS);
    }
  }, [clearReviewTransitionTimers, setReviewTransitionTimer, updateActiveSession]);

  const handleSelectRightCanvasTab = useCallback((tab: RightCanvasTab) => {
    updateActiveSession((session) => ({ ...session, activeRightCanvasTab: tab }));
    setRightCanvasMotion('idle');
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
        rightCanvasOpen: nextTabs.length > 0,
      };
    });
    setRightCanvasMotion('idle');
  }, [updateActiveSession]);

  const handleOpenSavedFiles = useCallback(() => {
    dispatch({ type: 'OPEN_SAVED_PATH' });
    handleAddRightCanvasTab('files');
  }, [dispatch, handleAddRightCanvasTab]);

  const handleDocumentFolderChange = useCallback((folderId: string | null) => {
    setSelectedDocumentFolderId(folderId);
  }, []);

  const handleOpenDocumentQa = useCallback((target: QaFocusTarget) => {
    setDocumentQaFocusTarget(target);
    setActiveCoreTab('qa');
  }, []);

  const handleOpenDocumentFileFromSpotlight = useCallback((fileId: string) => {
    clearReviewTransitionTimers();
    setRightCanvasMotion('idle');
    const containingFolderId = findSellerContainingFolderId(fileId);
    if (containingFolderId) {
      setSelectedDocumentFolderId(containingFolderId);
      setDocumentRevealKey((current) => current + 1);
    }
    openDocumentPreview(fileId);
    setActiveCoreTab('documents');
  }, [clearReviewTransitionTimers, openDocumentPreview]);

  const handleJumpToDocuments = useCallback(() => {
    clearReviewTransitionTimers();
    setRightCanvasMotion('idle');
    setActiveCoreTab('documents');
  }, [clearReviewTransitionTimers]);

  const handleJumpToQa = useCallback(() => {
    clearReviewTransitionTimers();
    setDocumentQaFocusTarget(null);
    setActiveCoreTab('qa');
  }, [clearReviewTransitionTimers]);

  const handleJumpToNotes = useCallback(() => {
    clearReviewTransitionTimers();
    setRightCanvasMotion('idle');
    setActiveCoreTab('notes');
  }, [clearReviewTransitionTimers]);

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        label: 'Datasite AI',
        icon: <DatasiteAiNavIcon />,
        active: activeCoreTab === 'ai',
        onClick: () => {
          if (activeCoreTab === 'documents' && selectedDocumentFolder) {
            openSelectedFolderOverview();
            return;
          }
          dispatch({ type: 'OPEN_ASSISTANT_FULL' });
          setActiveCoreTab('ai');
        },
      },
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
        onClick: () => {
          setDocumentQaFocusTarget(null);
          setActiveCoreTab('qa');
        },
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
    [activeCoreTab, openSelectedFolderOverview, selectedDocumentFolder]
  );

  const recentChats = useMemo<RecentChat[]>(
    () => sessions.map((session) => ({
      id: session.id,
      title: session.title,
      relativeTime: session.relativeTime,
    })),
    [sessions]
  );

  return (
    <DatasitePrototypeShell
      productMode="diligence"
      productName="Datasite"
      projectName="Project Silverstar"
      navItems={navItems}
      defaultExpanded
      search={false}
      hideSidecar
      appMenuVariant="halo"
      appSwitcherPlacement="topbar"
      topBarActions={<></>}
      hideNotifications
      topBarHeight={8}
      mainBg="background.defaultAlt"
      user={{ name: 'Robbin Momoh', initials: 'RM' }}
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
          }}
        >
          {activeCoreTab === 'ai' ? (
            <AiWorkspace
              activeSessionId={activeSessionId}
              activeMode={assistantRailMode}
              recentChats={recentChats}
              state={state}
              dispatch={dispatch}
              rightCanvasOpen={rightCanvasOpen}
              openRightCanvasTabs={openRightCanvasTabs}
              activeRightCanvasTab={activeRightCanvasTab}
              rightCanvasExpanded={rightCanvasExpanded}
              rightCanvasBasis={rightCanvasBasis}
              rightCanvasMotion={rightCanvasMotion}
              reviewOpen={reviewOpen}
              composerPlaceholder={getComposerPlaceholderForRightTab(activeRightCanvasTab)}
              onNewChat={startNewChat}
              onSelectSession={selectSession}
              onViewPlan={handleViewValidationPlan}
              onApprovePlan={handleApproveValidationPlan}
              onOpenSavedFiles={handleOpenSavedFiles}
              onOpenQaItem={handleOpenQaItem}
              onOpenDocumentFile={handleOpenDocumentFileFromSpotlight}
              onJumpToDocuments={handleJumpToDocuments}
              onJumpToQa={handleJumpToQa}
              onJumpToNotes={handleJumpToNotes}
              onOpenSkillsPage={() => openAssistantBuilderPage('skills')}
              onOpenTemplatesPage={() => openAssistantBuilderPage('templates')}
              onShowRightCanvas={handleShowRightCanvas}
              onHideRightCanvas={handleHideRightCanvas}
              onExpandRightCanvas={handleExpandRightCanvas}
              onRestoreRightCanvas={handleRestoreRightCanvas}
              onAddRightCanvasTab={handleAddRightCanvasTab}
              onSelectRightCanvasTab={handleSelectRightCanvasTab}
              onCloseRightCanvasTab={handleCloseRightCanvasTab}
              notesByRowId={qaNotesByRowId}
              onNoteChange={handleQaNoteChange}
              selectedQaItemId={selectedQaItemId}
            />
          ) : null}
          {activeCoreTab === 'documents' ? (
            <DocumentsTab
              selectedFolderId={selectedDocumentFolderId}
              revealKey={documentRevealKey}
              preview={documentPreview}
              state={state}
              dispatch={dispatch}
              onSelectedFolderChange={handleDocumentFolderChange}
              onOpenFilePreview={openDocumentPreview}
              onSelectFilePreview={selectDocumentPreview}
              onCloseFilePreview={closeDocumentPreview}
              onHidePreview={hideDocumentPreview}
              onShowPreview={showDocumentPreview}
              onExpandPreview={expandDocumentPreview}
              onRestorePreview={restoreDocumentPreview}
              onOpenQa={handleOpenDocumentQa}
            />
          ) : null}
          {activeCoreTab === 'qa' ? <QaTab focusTarget={documentQaFocusTarget} /> : null}
          {activeCoreTab === 'review' ? (
            <ReviewTab
              state={state}
              dispatch={dispatch}
              notesByRowId={qaNotesByRowId}
              onNoteChange={handleQaNoteChange}
            />
          ) : null}
          {activeCoreTab === 'notes' ? <NotesTab /> : null}
        </Box>
        <UpdateFolderIndexDialog
          open={state.stage === 'confirm-update'}
          onCancel={() => dispatch({ type: 'CANCEL_UPDATE' })}
          onConfirm={() => dispatch({ type: 'CONFIRM_UPDATE' })}
        />
      </Box>
    </DatasitePrototypeShell>
  );
}

function AiWorkspace({
  activeSessionId,
  activeMode,
  recentChats,
  state,
  dispatch,
  rightCanvasOpen,
  openRightCanvasTabs,
  activeRightCanvasTab,
  rightCanvasExpanded,
  rightCanvasBasis,
  rightCanvasMotion,
  reviewOpen,
  composerPlaceholder,
  onNewChat,
  onSelectSession,
  onViewPlan,
  onApprovePlan,
  onOpenSavedFiles,
  onOpenQaItem,
  onOpenDocumentFile,
  onJumpToDocuments,
  onJumpToQa,
  onJumpToNotes,
  onOpenSkillsPage,
  onOpenTemplatesPage,
  onShowRightCanvas,
  onHideRightCanvas,
  onExpandRightCanvas,
  onRestoreRightCanvas,
  onAddRightCanvasTab,
  onSelectRightCanvasTab,
  onCloseRightCanvasTab,
  notesByRowId,
  onNoteChange,
  selectedQaItemId,
}: {
  activeSessionId: string;
  activeMode: AssistantRailMode;
  recentChats: RecentChat[];
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  rightCanvasOpen: boolean;
  openRightCanvasTabs: RightCanvasTab[];
  activeRightCanvasTab: RightCanvasTab | null;
  rightCanvasExpanded: boolean;
  rightCanvasBasis: string;
  rightCanvasMotion: RightCanvasMotion;
  reviewOpen: boolean;
  composerPlaceholder?: string;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onViewPlan: () => void;
  onApprovePlan: () => void;
  onOpenSavedFiles: () => void;
  onOpenQaItem: (itemId: string) => void;
  onOpenDocumentFile: (fileId: string) => void;
  onJumpToDocuments: () => void;
  onJumpToQa: () => void;
  onJumpToNotes: () => void;
  onOpenSkillsPage: () => void;
  onOpenTemplatesPage: () => void;
  onShowRightCanvas: () => void;
  onHideRightCanvas: () => void;
  onExpandRightCanvas: () => void;
  onRestoreRightCanvas: () => void;
  onAddRightCanvasTab: (tab: RightCanvasTab) => void;
  onSelectRightCanvasTab: (tab: RightCanvasTab) => void;
  onCloseRightCanvasTab: (tab: RightCanvasTab) => void;
  notesByRowId: Record<string, string>;
  onNoteChange: (rowId: string, value: string) => void;
  selectedQaItemId: string | null;
}) {
  if (state.stage === 'documents-view') {
    return <SandboxFolderStructureView state={state} dispatch={dispatch} />;
  }

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          flex: rightCanvasExpanded ? `0 0 ${ASSISTANT_RAIL_BASIS}` : '1 1 auto',
          width: rightCanvasExpanded ? ASSISTANT_RAIL_BASIS : 'auto',
          minWidth: 0,
          height: '100%',
          transition: `width ${RIGHT_CANVAS_TOGGLE_MS}ms cubic-bezier(0.2, 0, 0, 1), flex-basis ${RIGHT_CANVAS_TOGGLE_MS}ms cubic-bezier(0.2, 0, 0, 1)`,
        }}
      >
        <AssistantPanel
          activeSessionId={activeSessionId}
          activeMode={activeMode}
          recentChats={recentChats}
          state={state}
          dispatch={dispatch}
          onNewChat={onNewChat}
          onSelectSession={onSelectSession}
          onViewPlan={onViewPlan}
          onApprovePlan={onApprovePlan}
          onOpenSavedFiles={onOpenSavedFiles}
          onOpenQaItem={onOpenQaItem}
          onOpenSkills={onOpenSkillsPage}
          onOpenTemplates={onOpenTemplatesPage}
          onOpenDocumentFile={onOpenDocumentFile}
          onJumpToDocuments={onJumpToDocuments}
          onJumpToQa={onJumpToQa}
          onJumpToNotes={onJumpToNotes}
          composerPlaceholder={composerPlaceholder}
          railOnly={rightCanvasExpanded}
        />
      </Box>

      {rightCanvasOpen ? (
        <Box
          sx={{
            flex: rightCanvasExpanded ? '1 1 0' : `0 0 ${rightCanvasBasis}`,
            width: rightCanvasExpanded ? 'auto' : rightCanvasBasis,
            minWidth: 0,
            height: '100%',
            overflow: 'hidden',
            opacity: 1,
            transform: 'translateX(0)',
            transition: `opacity ${RIGHT_CANVAS_TOGGLE_MS}ms cubic-bezier(0.2, 0, 0, 1), transform ${RIGHT_CANVAS_TOGGLE_MS}ms cubic-bezier(0.2, 0, 0, 1), flex-basis ${RIGHT_CANVAS_TOGGLE_MS}ms cubic-bezier(0.2, 0, 0, 1)`,
          }}
        >
          <RightContextCanvas
            openTabs={openRightCanvasTabs}
            activeTab={activeRightCanvasTab}
            state={state}
            dispatch={dispatch}
            expanded={rightCanvasExpanded}
            motion={rightCanvasMotion}
            onHideCanvas={onHideRightCanvas}
            onExpandCanvas={onExpandRightCanvas}
            onRestoreCanvas={onRestoreRightCanvas}
            onAddTab={onAddRightCanvasTab}
            onSelectTab={onSelectRightCanvasTab}
            onCloseTab={onCloseRightCanvasTab}
            onOpenSavedFiles={onOpenSavedFiles}
            notesByRowId={notesByRowId}
            onNoteChange={onNoteChange}
            selectedQaItemId={selectedQaItemId}
            onOpenQaItem={onOpenQaItem}
          />
        </Box>
      ) : (
        <CollapsedRightCanvasToggle
          hasReview={reviewOpen}
          onOpen={onShowRightCanvas}
        />
      )}
    </Box>
  );
}

function DocumentsTab({
  selectedFolderId,
  revealKey,
  preview,
  state,
  dispatch,
  onSelectedFolderChange,
  onOpenFilePreview,
  onSelectFilePreview,
  onCloseFilePreview,
  onHidePreview,
  onShowPreview,
  onExpandPreview,
  onRestorePreview,
  onOpenQa,
}: {
  selectedFolderId: string | null;
  revealKey: number;
  preview: DocumentPreviewState;
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  onSelectedFolderChange: (folderId: string | null) => void;
  onOpenFilePreview: (fileId: string) => void;
  onSelectFilePreview: (fileId: string) => void;
  onCloseFilePreview: (fileId: string) => void;
  onHidePreview: () => void;
  onShowPreview: () => void;
  onExpandPreview: () => void;
  onRestorePreview: () => void;
  onOpenQa: (target: QaFocusTarget) => void;
}) {
  const handlePanelFolderSelect = (folderId: string | null) => {
    onSelectedFolderChange(folderId);
  };
  const previewExpanded = preview.open && preview.displayMode === 'expanded';

  return (
    <Box sx={{ height: '100%', minHeight: 0, p: 1, boxSizing: 'border-box', bgcolor: 'background.defaultAlt' }}>
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          bgcolor: 'background.paper',
          display: 'flex',
        }}
      >
        <DocumentsFolderPanel
          sections={REVIEWER_DOCUMENT_SECTIONS}
          selectedFolderId={selectedFolderId}
          revealKey={revealKey}
          onSelectedFolderChange={handlePanelFolderSelect}
        />
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <RightContextCanvasFilesView
              mode="browse"
              selectedFolderId={selectedFolderId}
              onSelectedFolderChange={onSelectedFolderChange}
              attachedFileIds={state.attachedFileIds}
              attachedFolderIds={state.attachedFolderIds}
              onToggleFileAttachment={(fileId) => dispatch({ type: 'TOGGLE_ATTACHMENT', fileId })}
              onToggleFolderAttachment={(folderId) => {
                const nextFolderIds = state.attachedFolderIds.includes(folderId)
                  ? state.attachedFolderIds.filter((id) => id !== folderId)
                  : [...state.attachedFolderIds, folderId];
                dispatch({ type: 'SET_CONTEXT_REFERENCES', fileIds: state.attachedFileIds, folderIds: nextFolderIds });
              }}
              onOpenQa={onOpenQa}
              onOpenFile={onOpenFilePreview}
              onShowHiddenPreview={!preview.open && preview.fileIds.length > 0 ? onShowPreview : undefined}
              source={SELLER_INDEX_SOURCE}
            />
          </Box>
          {preview.open && preview.activeFileId ? (
          <Box
            sx={{
              flex: previewExpanded ? undefined : `0 0 ${DOCUMENT_PREVIEW_RAIL_BASIS}`,
              width: previewExpanded ? 'auto' : DOCUMENT_PREVIEW_RAIL_BASIS,
              minWidth: 0,
              height: '100%',
              overflow: 'hidden',
              borderLeft: previewExpanded ? 0 : '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              ...(previewExpanded
                ? {
                    position: 'absolute',
                    inset: 0,
                    zIndex: 3,
                  }
                : null),
              transition: `flex-basis ${RIGHT_CANVAS_TOGGLE_MS}ms cubic-bezier(0.2, 0, 0, 1), width ${RIGHT_CANVAS_TOGGLE_MS}ms cubic-bezier(0.2, 0, 0, 1)`,
            }}
          >
            <DocumentsPreviewRail
              preview={preview}
              state={state}
              dispatch={dispatch}
              expanded={previewExpanded}
              onSelectFile={onSelectFilePreview}
              onCloseFile={onCloseFilePreview}
              onHide={onHidePreview}
              onExpand={onExpandPreview}
              onRestore={onRestorePreview}
            />
          </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

function DocumentsPreviewRail({
  preview,
  state,
  dispatch,
  expanded,
  onSelectFile,
  onCloseFile,
  onHide,
  onExpand,
  onRestore,
}: {
  preview: DocumentPreviewState;
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  expanded: boolean;
  onSelectFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
  onHide: () => void;
  onExpand: () => void;
  onRestore: () => void;
}) {
  const activeFileId = preview.activeFileId;
  if (!activeFileId) return null;

  return (
    <Stack sx={{ height: '100%', minHeight: 0, bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          minHeight: 67,
          px: 2.5,
          pt: 1.5,
          pb: 1,
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{
            minWidth: 0,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {preview.fileIds.map((fileId) => (
            <DocumentPreviewTabPill
              key={fileId}
              fileId={fileId}
              selected={activeFileId === fileId}
              onSelect={onSelectFile}
              onClose={onCloseFile}
            />
          ))}
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Tooltip title={expanded ? 'Restore document preview' : 'Expand document preview'}>
          <IconButton
            size="small"
            aria-label={expanded ? 'Restore document preview' : 'Expand document preview'}
            onClick={expanded ? onRestore : onExpand}
            sx={{ width: 30, height: 30 }}
          >
            <FontAwesomeIcon
              icon={expanded ? faArrowDownLeftAndArrowUpRightToCenter : faArrowUpRightAndArrowDownLeftFromCenter}
              style={{ fontSize: 13 }}
            />
          </IconButton>
        </Tooltip>

        <Tooltip title="Hide document preview">
          <IconButton
            size="small"
            aria-label="Hide document preview"
            onClick={onHide}
            sx={{ width: 30, height: 30 }}
          >
            <FontAwesomeIcon icon={faSidebarFlip} style={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <RightContextCanvasFileDetailView
          fileId={activeFileId}
          attached={state.attachedFileIds.includes(activeFileId)}
          onToggleAttachment={() => dispatch({ type: 'TOGGLE_ATTACHMENT', fileId: activeFileId })}
        />
      </Box>
    </Stack>
  );
}

function DocumentPreviewTabPill({
  fileId,
  selected,
  onSelect,
  onClose,
}: {
  fileId: string;
  selected: boolean;
  onSelect: (fileId: string) => void;
  onClose: (fileId: string) => void;
}) {
  const file = findSellerFileById(fileId);
  const label = file?.name ?? 'File preview';

  return (
    <Box
      role="tab"
      aria-selected={selected}
      tabIndex={0}
      onClick={() => onSelect(fileId)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onSelect(fileId);
      }}
      sx={{
        minHeight: 30,
        borderRadius: '999px',
        border: '1px solid',
        borderColor: selected ? 'text.primary' : 'divider',
        px: 1.25,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        fontSize: 13,
        fontWeight: selected ? 500 : 400,
        color: 'text.primary',
        bgcolor: selected ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        outline: 'none',
        '&:focus-visible': {
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}`,
        },
      }}
    >
      <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 12, flexShrink: 0 }} />
      <Box
        component="span"
        sx={{
          minWidth: 0,
          maxWidth: 210,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Box>
      <Tooltip title={`Remove ${label} tab`}>
        <IconButton
          size="small"
          aria-label={`Remove ${label} tab`}
          onClick={(event) => {
            event.stopPropagation();
            onClose(fileId);
          }}
          sx={{ width: 20, height: 20, ml: 0.25 }}
        >
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function DocumentsFolderPanel({
  sections,
  selectedFolderId,
  revealKey,
  onSelectedFolderChange,
}: {
  sections: DocumentSourceSection[];
  selectedFolderId: string | null;
  revealKey: number;
  onSelectedFolderChange: (folderId: string | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(() => new Set());
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => new Set());

  const normalizedQuery = normalizeFolderPanelQuery(query);
  const searchGroups = useMemo(
    () => getFolderPanelSearchGroups(normalizedQuery, sections),
    [normalizedQuery, sections]
  );

  const revealFolder = useCallback((folderId: string, section: DocumentSourceSection) => {
    const ancestorIds = getFolderAncestorIds(folderId, section.source.tree);
    setExpandedSectionIds((current) => addToSet(current, section.id));
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      ancestorIds.forEach((ancestorId) => next.add(ancestorId));
      return next;
    });
  }, []);

  const selectFolder = useCallback((folderId: string, section: DocumentSourceSection) => {
    revealFolder(folderId, section);
    onSelectedFolderChange(folderId);
  }, [onSelectedFolderChange, revealFolder]);

  useEffect(() => {
    if (!selectedFolderId) return;
    if (revealKey > 0) setQuery('');
    const selectedSection = sections.find((section) => findSellerFolderById(selectedFolderId, section.source));
    if (!selectedSection) return;
    revealFolder(selectedFolderId, selectedSection);
  }, [revealFolder, revealKey, sections, selectedFolderId]);

  return (
    <Box
      sx={{
        width: 236,
        flex: '0 0 236px',
        minWidth: 0,
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.25} sx={{ px: 2, pt: 2, pb: 1.25, flexShrink: 0 }}>
        <Box
          sx={{
            minHeight: 34,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.25,
            display: 'flex',
            alignItems: 'center',
            px: 1,
            gap: 1,
            bgcolor: 'background.default',
            '&:focus-within': {
              borderColor: 'text.secondary',
              bgcolor: 'background.paper',
            },
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 13, opacity: 0.62 }} />
          <InputBase
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search folders"
            inputProps={{ 'aria-label': 'Search folders' }}
            sx={{ flex: 1, minWidth: 0, fontSize: 13 }}
          />
          {query ? (
            <Tooltip title="Clear search">
              <IconButton
                size="small"
                aria-label="Clear folder search"
                onClick={() => setQuery('')}
                sx={{ width: 22, height: 22 }}
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          overscrollBehavior: 'contain',
          px: 1.25,
          pb: 2,
        }}
      >
        {normalizedQuery ? (
          <Stack spacing={1}>
            {searchGroups.some((group) => group.folders.length > 0) ? (
              searchGroups.map((group) => (
                group.folders.length > 0 ? (
                  <Stack key={group.section.id} spacing={0.25}>
                    <Typography sx={{ px: 1, py: 0.5, fontSize: 11, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                      {group.section.label}
                    </Typography>
                    {group.folders.map((folder) => (
                      <FolderSearchResultRow
                        key={folder.id}
                        folder={folder}
                        selected={folder.id === selectedFolderId}
                        onSelect={() => selectFolder(folder.id, group.section)}
                      />
                    ))}
                  </Stack>
                ) : null
              ))
            ) : (
              <Stack spacing={1} alignItems="center" sx={{ px: 2, py: 5, color: 'text.secondary' }}>
                <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: 13, textAlign: 'center' }}>No matching folders.</Typography>
              </Stack>
            )}
          </Stack>
        ) : (
          <Box role="tree" aria-label="Document folder navigation">
            {sections.map((section) => {
              const expanded = expandedSectionIds.has(section.id);
              const rootSelected = selectedFolderId === null;
              const folderNodes = section.source.tree.filter(isSellerFolderNode);

              return (
                <Box key={section.id}>
                  <Stack
                    role="treeitem"
                    aria-expanded={expanded}
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    tabIndex={0}
                    onClick={() => onSelectedFolderChange(null)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      onSelectedFolderChange(null);
                    }}
                    sx={{
                      minHeight: 34,
                      px: 0.75,
                      borderRadius: 1,
                      cursor: 'pointer',
                      outline: 'none',
                      bgcolor: rootSelected ? 'action.selected' : 'transparent',
                      color: 'text.primary',
                      '&:hover': { bgcolor: rootSelected ? 'action.selected' : 'action.hover' },
                      '&:focus-visible': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}` },
                    }}
                  >
                    <IconButton
                      size="small"
                      aria-label={expanded ? `Collapse ${section.label}` : `Expand ${section.label}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedSectionIds((current) => toggleSetValue(current, section.id));
                      }}
                      sx={{ width: 22, height: 22, color: 'text.secondary' }}
                    >
                      <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} style={{ fontSize: 11 }} />
                    </IconButton>
                    <Typography
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 13.5,
                        fontWeight: rootSelected ? 600 : 500,
                      }}
                    >
                      {section.label}
                    </Typography>
                  </Stack>

                  {expanded ? (
                    <Box role="group" sx={{ mt: 0.25 }}>
                      {folderNodes.map((node) => (
                        <DocumentsFolderTreeNode
                          key={node.id}
                          node={node}
                          section={section}
                          depth={0}
                          selectedFolderId={selectedFolderId}
                          expandedFolderIds={expandedFolderIds}
                          onToggleFolder={(folderId) => setExpandedFolderIds((current) => toggleSetValue(current, folderId))}
                          onSelectFolder={selectFolder}
                        />
                      ))}
                    </Box>
                  ) : null}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function DocumentsFolderTreeNode({
  node,
  section,
  depth,
  selectedFolderId,
  expandedFolderIds,
  onToggleFolder,
  onSelectFolder,
}: {
  node: SellerIndexFolderNode;
  section: DocumentSourceSection;
  depth: number;
  selectedFolderId: string | null;
  expandedFolderIds: Set<string>;
  onToggleFolder: (folderId: string) => void;
  onSelectFolder: (folderId: string, section: DocumentSourceSection) => void;
}) {
  const childFolders = node.children.filter(isSellerFolderNode);
  const expanded = expandedFolderIds.has(node.id);
  const selected = selectedFolderId === node.id;

  return (
    <Box role="treeitem" aria-label={`${node.index} ${node.name}`} aria-expanded={childFolders.length > 0 ? expanded : undefined}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        tabIndex={0}
        onClick={() => onSelectFolder(node.id, section)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onSelectFolder(node.id, section);
        }}
        sx={{
          minHeight: 31,
          pl: 0.5 + depth * 1.35,
          pr: 0.75,
          borderRadius: 1,
          cursor: 'pointer',
          outline: 'none',
          bgcolor: selected ? 'action.selected' : 'transparent',
          color: selected ? 'text.primary' : 'text.secondary',
          '&:hover': { bgcolor: selected ? 'action.selected' : 'action.hover' },
          '&:focus-visible': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}` },
        }}
      >
        {childFolders.length > 0 ? (
          <IconButton
            size="small"
            aria-label={expanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFolder(node.id);
            }}
            sx={{ width: 22, height: 22, color: 'text.secondary' }}
          >
            <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} style={{ fontSize: 10 }} />
          </IconButton>
        ) : (
          <Box sx={{ width: 22, flexShrink: 0 }} />
        )}
        <Box sx={{ width: 18, flexShrink: 0, color: selected ? 'text.primary' : 'text.secondary' }}>
          <FontAwesomeIcon icon={faFolder} style={{ fontSize: 13 }} />
        </Box>
        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 13,
            fontWeight: selected ? 600 : 400,
          }}
        >
          {node.name}
        </Typography>
      </Stack>

      {expanded && childFolders.length > 0 ? (
        <Box role="group">
          {childFolders.map((child) => (
            <DocumentsFolderTreeNode
              key={child.id}
              node={child}
              section={section}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              expandedFolderIds={expandedFolderIds}
              onToggleFolder={onToggleFolder}
              onSelectFolder={onSelectFolder}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

function FolderSearchResultRow({
  folder,
  selected,
  onSelect,
}: {
  folder: SellerIndexFolder;
  selected: boolean;
  onSelect: () => void;
}) {
  const path = getFolderDisplayPath(folder);

  return (
    <Stack
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onSelect();
      }}
      sx={{
        minHeight: 44,
        px: 1,
        py: 0.75,
        borderRadius: 1,
        cursor: 'pointer',
        outline: 'none',
        bgcolor: selected ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: selected ? 'action.selected' : 'action.hover' },
        '&:focus-visible': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}` },
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
        <FontAwesomeIcon icon={faFolder} style={{ fontSize: 13, opacity: 0.72 }} />
        <Typography
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 13,
            fontWeight: selected ? 600 : 500,
          }}
        >
          {folder.name}
        </Typography>
      </Stack>
      <Typography
        sx={{
          mt: 0.25,
          pl: 2.5,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 11.5,
          color: 'text.secondary',
        }}
      >
        {path}
      </Typography>
    </Stack>
  );
}

function QaTab({ focusTarget }: { focusTarget?: QaFocusTarget | null }) {
  return (
    <Box sx={{ height: '100%', minHeight: 0, p: 1, boxSizing: 'border-box', bgcolor: 'background.defaultAlt' }}>
      <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', borderRadius: '16px', bgcolor: 'background.paper' }}>
        <RightContextCanvasQaView focusTarget={focusTarget} />
      </Box>
    </Box>
  );
}

function ReviewTab({
  state,
  dispatch,
  notesByRowId,
  onNoteChange,
}: {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  notesByRowId: Record<string, string>;
  onNoteChange: (rowId: string, value: string) => void;
}) {
  return (
    <Box sx={{ height: '100%', minHeight: 0, p: 1, boxSizing: 'border-box', bgcolor: 'background.defaultAlt' }}>
      <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', borderRadius: '16px', bgcolor: 'background.paper' }}>
        <LegalReviewWorkspace
          state={state}
          dispatch={dispatch}
          notesByRowId={notesByRowId}
          onNoteChange={onNoteChange}
        />
      </Box>
    </Box>
  );
}

function NotesTab() {
  return (
    <Box sx={{ height: '100%', minHeight: 0, p: 1, boxSizing: 'border-box', bgcolor: 'background.defaultAlt' }}>
      <Box sx={{ height: '100%', minHeight: 0, overflow: 'auto', borderRadius: '16px', bgcolor: 'background.paper' }}>
        <Stack spacing={3} sx={{ width: 'min(880px, 100%)', px: { xs: 3, md: 6 }, py: 5 }}>
          <Stack spacing={0.75}>
            <Typography component="h1" sx={{ fontSize: 24, fontWeight: 600, color: 'text.primary' }}>
              Private notes
            </Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: 'text.secondary' }}>
              Discovery notes for Robbin’s sell-side search, Q&A, and Datasite AI workflow validation.
            </Typography>
          </Stack>

          <NotesCard
            title="Search behavior to observe"
            body="Does Robbin type a single keyword such as churn, or does he naturally ask a richer question like finding support for churn and NRR claims that can be shared with Round 1 buyers?"
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

function CollapsedRightCanvasToggle({
  hasReview,
  onOpen,
}: {
  hasReview: boolean;
  onOpen: () => void;
}) {
  return (
    <Box
      sx={{
        flex: '0 0 44px',
        width: 44,
        height: '100%',
        pt: 3.5,
        px: 0.875,
        pb: 1,
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Tooltip title={hasReview ? 'Open Q&A table' : 'Open context canvas'}>
        <IconButton
          size="small"
          aria-label={hasReview ? 'Open Q&A table' : 'Open context canvas'}
          onClick={onOpen}
          sx={{
            width: 30,
            height: 30,
            bgcolor: 'background.paper',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.15)',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <FontAwesomeIcon icon={faSidebarFlip} style={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function DatasiteAiNavIcon() {
  return <AiSparkleBadge size={22} iconSize={15} />;
}

function isSellerFolderNode(node: SellerIndexNode): node is SellerIndexFolderNode {
  return node.kind === 'folder';
}

function toggleSetValue<T>(current: Set<T>, value: T) {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
    return next;
  }
  next.add(value);
  return next;
}

function addToSet<T>(current: Set<T>, value: T) {
  if (current.has(value)) return current;
  const next = new Set(current);
  next.add(value);
  return next;
}

function normalizeFolderPanelQuery(value: string) {
  return value.trim().toLowerCase();
}

function getFolderDisplayPath(folder: SellerIndexFolder) {
  return [...folder.folderPath, folder.name].join(' / ');
}

function getFolderPanelSearchGroups(query: string, sections: DocumentSourceSection[]) {
  return sections.map((section) => ({
    section,
    folders: query
      ? section.source.folders.filter((folder) =>
          [folder.name, getFolderDisplayPath(folder), ...getFolderSearchAliases(folder)].some((value) =>
            normalizeFolderPanelQuery(value).includes(query)
          )
        )
      : [],
  }));
}

function getFolderSearchAliases(folder: SellerIndexFolder) {
  const path = getFolderDisplayPath(folder).toLowerCase();
  const aliases: string[] = [];
  if (path.includes('intellectual property')) aliases.push('ip');
  return aliases;
}

function getFolderAncestorIds(folderId: string, nodes: SellerIndexNode[], ancestorIds: string[] = []): string[] {
  for (const node of nodes) {
    if (!isSellerFolderNode(node)) continue;
    if (node.id === folderId) return ancestorIds;

    const childMatch = getFolderAncestorIds(folderId, node.children, [...ancestorIds, node.id]);
    if (childMatch.length > 0) return childMatch;
  }

  return [];
}

function createEmptyDocumentPreview(): DocumentPreviewState {
  return {
    fileIds: [],
    activeFileId: null,
    open: false,
    displayMode: 'default',
  };
}

function createDraftSession(): AiSession {
  return {
    id: DRAFT_SESSION_ID,
    title: 'New chat',
    relativeTime: '',
    state: createEmptyState(),
    rightCanvasOpen: false,
    openRightCanvasTabs: [],
    activeRightCanvasTab: null,
    rightCanvasDisplayMode: 'default',
  };
}

function createInitialSessions(): AiSession[] {
  return [
    {
      id: 'session-qa-triage',
      title: 'Triage buyer questions',
      relativeTime: '1m',
      state: createReadyReviewState(),
      rightCanvasOpen: true,
      openRightCanvasTabs: ['enhanced-index'],
      activeRightCanvasTab: 'enhanced-index',
      rightCanvasDisplayMode: 'default',
    },
    {
      id: 'session-source-code-routing',
      title: 'Source-code disclosure path',
      relativeTime: '21m',
      state: createBriefDraftState(),
      rightCanvasOpen: true,
      openRightCanvasTabs: ['files', 'qa'],
      activeRightCanvasTab: 'qa',
      rightCanvasDisplayMode: 'default',
    },
    {
      id: 'session-saved-searches',
      title: 'Churn / NRR buyer support',
      relativeTime: '1h',
      state: createEscrowReviewState(),
      rightCanvasOpen: true,
      openRightCanvasTabs: ['enhanced-index', 'files'],
      activeRightCanvasTab: 'files',
      rightCanvasDisplayMode: 'default',
    },
    {
      id: 'session-source-metadata',
      title: 'DPA answer support',
      relativeTime: '1d',
      state: createWarrantyReviewState(),
      rightCanvasOpen: true,
      openRightCanvasTabs: ['qa'],
      activeRightCanvasTab: 'qa',
      rightCanvasDisplayMode: 'default',
    },
    {
      id: 'session-discovery-notes',
      title: 'Discovery notes',
      relativeTime: '1w',
      state: createEmploymentCovenantState(),
      rightCanvasOpen: false,
      openRightCanvasTabs: [],
      activeRightCanvasTab: null,
      rightCanvasDisplayMode: 'default',
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

function createFolderOverviewState(folder: SellerIndexFolder, files: SellerIndexFile[]): WorkspaceState {
  const citationFileIds = pickFolderCitationFiles(files).map((file) => file.id);

  return {
    ...createEmptyState(),
    stage: 'proposal-ready',
    attachedFolderIds: [folder.id],
    attachedFileIds: citationFileIds,
    messages: [
      {
        id: `folder-overview-${folder.id}`,
        role: 'assistant',
        kind: 'folder-overview',
        content: createFolderOverviewCopy(folder, files),
        citationFileIds,
      },
    ],
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
    stage: 'split-review',
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
        content: 'Capture discovery notes for William Blair Q&A follow-up.',
      },
      {
        id: 'seed-assistant-room-notes',
        role: 'assistant',
        kind: 'text',
        content:
          'A private notes workspace could sit beside Q&A so Robbin can capture which steps are real pain, which controls matter, and who else at William Blair should validate the workflow.',
      },
    ],
  };
}

function pickFolderCitationFiles(files: SellerIndexFile[]) {
  const preferred = files.filter((file) =>
    ['pdf', 'xlsx', 'docx'].includes(file.fileType)
  );
  return (preferred.length > 0 ? preferred : files).slice(0, 3);
}

function createFolderOverviewCopy(folder: SellerIndexFolder, files: SellerIndexFile[]) {
  const folderPath = [...folder.folderPath, folder.name].join(' / ');
  const fileCount = files.length;
  const fileTypes = Array.from(new Set(files.map((file) => file.fileType.toUpperCase()))).join(', ');
  const currentEvidence = files.filter((file) =>
    /current|approved|clean room|seller uploaded|board version|management case/i.test(file.status)
  ).length;
  const evidenceSignals = files
    .slice(0, 3)
    .map((file) => file.previewLines[0] ?? file.meta)
    .filter(Boolean);

  return [
    `I reviewed ${folderPath}. It contains ${fileCount} uploaded item${fileCount === 1 ? '' : 's'}${fileTypes ? ` across ${fileTypes}` : ''}. For Robbin’s Q&A workflow, I would treat this as answer support: the value is in checking whether the files are cited, permissioned correctly, and safe to reference.`,
    currentEvidence > 0
      ? `The strongest support appears to be the materials marked as current or approved. I would still verify permission level before using them in a buyer-facing answer.`
      : `I do not see a clean current/approved signal across this folder, so the first follow-up should be evidence currency: ask which files are final, which are drafts, and whether any newer version exists.`,
    evidenceSignals.length > 0
      ? `The points I would check first are ${evidenceSignals.join('; ')}. If Robbin wants to answer a buyer, I would keep the underlying files cited and frame restricted content as review-required.`
      : `I would use the cited files below as the starting evidence and ask the seller to confirm whether anything material is missing from this folder.`,
  ].join('\n\n');
}

function getSessionTitleForAction(action: WorkspaceAction) {
  if (action.type === 'SELECT_FOLDER_PROMPT') return 'Triage buyer questions';
  if (action.type === 'CHAT_PROMPT_SUBMITTED') {
    const prompt = action.prompt.trim();
    return prompt.length > 0 ? prompt : 'New Datasite AI chat';
  }
  return 'New Datasite AI chat';
}
