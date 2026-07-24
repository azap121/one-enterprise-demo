import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { faSidebarFlip } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, GlobalStyles, IconButton, Tooltip } from '@mui/material';
import { DatasitePrototypeShell, diligenceNavItems, type NavItem } from '~/shared';
import AiSparkleBadge from './AiSparkleBadge';
import AssistantPanel from './AssistantPanel';
import RightContextCanvas, { type RightCanvasTab } from './RightContextCanvas';
import SandboxFolderStructureView from './SandboxFolderStructureView';
import UpdateFolderIndexDialog from './UpdateFolderIndexDialog';
import { FINAL_STEP_PAUSE_MS, RECOMMENDATION_STEP_MS, SAVE_STEP_MS, recommendationSteps, saveSteps } from '../state/timing';
import { initialState, reducer } from '../state/reducer';

type ReviewTransitionPhase = 'idle' | 'canvas-entering';
type RightCanvasDisplayMode = 'default' | 'expanded';

const EMPTY_RIGHT_CANVAS_BASIS = 'clamp(420px, 44vw, 720px)';
const ENHANCED_INDEX_RIGHT_CANVAS_BASIS = 'clamp(620px, 48vw, 860px)';
const ASSISTANT_RAIL_BASIS = '227px';
const RIGHT_CANVAS_TOGGLE_MS = 280;
const REVIEW_ENTER_MS = 420;

export default function FolderRecommendationsChatAssistant() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [rightCanvasOpen, setRightCanvasOpen] = useState(false);
  const [openRightCanvasTabs, setOpenRightCanvasTabs] = useState<RightCanvasTab[]>([]);
  const [activeRightCanvasTab, setActiveRightCanvasTab] = useState<RightCanvasTab | null>(null);
  const [rightCanvasDisplayMode, setRightCanvasDisplayMode] = useState<RightCanvasDisplayMode>('default');
  const [reviewTransition, setReviewTransition] = useState<ReviewTransitionPhase>('idle');
  const transitionTimersRef = useRef<number[]>([]);
  const appliedTransitionHandledRef = useRef(false);

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        label: 'Datasite AI',
        icon: <DatasiteAiNavIcon />,
        active: true,
        onClick: () => dispatch({ type: 'OPEN_ASSISTANT_FULL' }),
      },
      ...diligenceNavItems.map((item) => ({ ...item, active: false })),
    ],
    []
  );

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

  useEffect(() => clearReviewTransitionTimers, [clearReviewTransitionTimers]);

  useEffect(() => {
    if (state.stage !== 'chat-processing-recommendation') return;
    if (state.recommendationStepIndex < recommendationSteps.length) {
      const timer = window.setTimeout(() => dispatch({ type: 'PROCESSING_STEP_DONE' }), RECOMMENDATION_STEP_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => dispatch({ type: 'RECOMMENDATION_READY' }), FINAL_STEP_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [state.stage, state.recommendationStepIndex]);

  useEffect(() => {
    if (state.stage !== 'save-processing') return;
    if (state.saveStepIndex < saveSteps.length) {
      const timer = window.setTimeout(() => dispatch({ type: 'SAVE_STEP_DONE' }), SAVE_STEP_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => dispatch({ type: 'INDEX_SAVED' }), FINAL_STEP_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [state.stage, state.saveStepIndex]);

  useEffect(() => {
    if (state.stage === 'chat-empty') {
      setRightCanvasOpen(false);
      setOpenRightCanvasTabs([]);
      setActiveRightCanvasTab(null);
      setRightCanvasDisplayMode('default');
      setReviewTransition('idle');
    }
  }, [state.stage]);

  const reviewStage = state.stage === 'split-review' || state.stage === 'confirm-update';
  const enhancedIndexOpen = openRightCanvasTabs.includes('enhanced-index');
  const rightCanvasExpanded = rightCanvasOpen && rightCanvasDisplayMode === 'expanded';
  const canvasEntering = reviewTransition === 'canvas-entering';
  const rightCanvasBasis = activeRightCanvasTab
    ? ENHANCED_INDEX_RIGHT_CANVAS_BASIS
    : EMPTY_RIGHT_CANVAS_BASIS;

  const openEnhancedIndexTab = useCallback((reducedMotion = false) => {
    setRightCanvasOpen(true);
    setOpenRightCanvasTabs((tabs) => (tabs.includes('enhanced-index') ? tabs : [...tabs, 'enhanced-index']));
    setActiveRightCanvasTab('enhanced-index');
    setReviewTransition(reducedMotion ? 'idle' : 'canvas-entering');
    if (!reducedMotion) {
      setReviewTransitionTimer(() => setReviewTransition('idle'), REVIEW_ENTER_MS);
    }
  }, [setReviewTransitionTimer]);

  const handleOpenReview = useCallback(() => {
    clearReviewTransitionTimers();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reviewStage) {
      dispatch({ type: 'OPEN_REVIEW' });
    }

    openEnhancedIndexTab(reducedMotion);
  }, [clearReviewTransitionTimers, openEnhancedIndexTab, reviewStage]);

  const handleShowRightCanvas = useCallback(() => {
    clearReviewTransitionTimers();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setRightCanvasOpen(true);
    setActiveRightCanvasTab((currentTab) => currentTab ?? openRightCanvasTabs[0] ?? null);
    setReviewTransition(reducedMotion ? 'idle' : 'canvas-entering');
    if (!reducedMotion) {
      setReviewTransitionTimer(() => setReviewTransition('idle'), RIGHT_CANVAS_TOGGLE_MS);
    }
  }, [clearReviewTransitionTimers, openRightCanvasTabs, setReviewTransitionTimer]);

  const handleHideRightCanvas = useCallback(() => {
    clearReviewTransitionTimers();
    setRightCanvasOpen(false);
    setRightCanvasDisplayMode('default');
    setReviewTransition('idle');
  }, [clearReviewTransitionTimers]);

  const handleExpandRightCanvas = useCallback(() => {
    setRightCanvasOpen(true);
    setRightCanvasDisplayMode('expanded');
  }, []);

  const handleRestoreRightCanvas = useCallback(() => {
    setRightCanvasDisplayMode('default');
  }, []);

  const handleAddRightCanvasTab = useCallback((tab: RightCanvasTab) => {
    clearReviewTransitionTimers();
    setRightCanvasOpen(true);
    setOpenRightCanvasTabs((tabs) => (tabs.includes(tab) ? tabs : [...tabs, tab]));
    setActiveRightCanvasTab(tab);
    setReviewTransition('idle');
  }, [clearReviewTransitionTimers]);

  const handleSelectRightCanvasTab = useCallback((tab: RightCanvasTab) => {
    setActiveRightCanvasTab(tab);
    setReviewTransition('idle');
  }, []);

  const handleCloseRightCanvasTab = useCallback((tab: RightCanvasTab) => {
    setOpenRightCanvasTabs((tabs) => {
      const closedTabIndex = tabs.indexOf(tab);
      const nextTabs = tabs.filter((item) => item !== tab);

      setActiveRightCanvasTab((currentTab) => {
        if (currentTab !== tab) {
          return currentTab && nextTabs.includes(currentTab) ? currentTab : nextTabs[0] ?? null;
        }

        return nextTabs[Math.min(closedTabIndex, nextTabs.length - 1)] ?? null;
      });

      return nextTabs;
    });
    setReviewTransition('idle');
  }, []);

  useEffect(() => {
    if (!state.structureApplied) {
      appliedTransitionHandledRef.current = false;
      return;
    }
    if (appliedTransitionHandledRef.current) return;

    appliedTransitionHandledRef.current = true;
    handleAddRightCanvasTab('files');
  }, [handleAddRightCanvasTab, state.structureApplied]);

  const handleOpenSavedFiles = useCallback(() => {
    dispatch({ type: 'OPEN_SAVED_PATH' });
    handleAddRightCanvasTab('files');
  }, [handleAddRightCanvasTab]);

  return (
    <DatasitePrototypeShell
      productMode="diligence"
      productName="Datasite"
      projectName="Project Atlas"
      navItems={navItems}
      defaultExpanded
      search={false}
      hideSidecar
      appMenuVariant="halo"
      appSwitcherPlacement="nav-bottom"
      topBarHeight={8}
      mainBg="background.defaultAlt"
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
          {state.stage === 'documents-view' ? (
            <SandboxFolderStructureView state={state} dispatch={dispatch} />
          ) : (
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
                  state={state}
                  dispatch={dispatch}
                  onReview={handleOpenReview}
                  onOpenSavedFiles={handleOpenSavedFiles}
                  reviewActive={enhancedIndexOpen}
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
                    entering={canvasEntering}
                    onHideCanvas={handleHideRightCanvas}
                    onExpandCanvas={handleExpandRightCanvas}
                    onRestoreCanvas={handleRestoreRightCanvas}
                    onAddTab={handleAddRightCanvasTab}
                    onSelectTab={handleSelectRightCanvasTab}
                    onCloseTab={handleCloseRightCanvasTab}
                    onOpenSavedFiles={handleOpenSavedFiles}
                  />
                </Box>
              ) : (
                <CollapsedRightCanvasToggle
                  hasEnhancedIndex={enhancedIndexOpen}
                  onOpen={handleShowRightCanvas}
                />
              )}
            </Box>
          )}
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

function CollapsedRightCanvasToggle({
  hasEnhancedIndex,
  onOpen,
}: {
  hasEnhancedIndex: boolean;
  onOpen: () => void;
}) {
  return (
    <Box
      sx={{
        flex: '0 0 44px',
        width: 44,
        height: '100%',
        p: 1,
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Tooltip title={hasEnhancedIndex ? 'Open Enhanced Index' : 'Open context canvas'}>
        <IconButton
          size="small"
          aria-label={hasEnhancedIndex ? 'Open Enhanced Index' : 'Open context canvas'}
          onClick={onOpen}
          sx={{
            width: 28,
            height: 28,
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
