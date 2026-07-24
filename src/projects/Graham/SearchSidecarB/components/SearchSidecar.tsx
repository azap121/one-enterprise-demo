import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faFileLines, faListCheck, faComments, faUsers, faArrowUpRightFromSquare } from '@fortawesome/pro-light-svg-icons';
import { DatasitePrototypeShell, DatasiteAiButton, DatasiteAppSwitcher } from '~/shared';
import { Doc } from './mockData';
import { SearchResultsContent } from '~/projects/Graham/SearchResults/components/SearchResultsPage';
import FolderTable from './FolderTable';
import DocumentViewer from './DocumentViewer';
import FolderTreePanel from './FolderTreePanel';
import { CompactResultsPanel, TabbedDocViewer, InlineAiChatPanel, RESULTS_PANEL_WIDTH, type AiDocItem } from './AiSearchLayout';

// Layout constants
const SIDECAR_WIDTH       = 440;
const FOLDER_PANEL_WIDTH  = 280;
const FOLDER_PANEL_MIN    = 180;
const FOLDER_PANEL_MAX    = 480;
const NAV_WIDTH_COLLAPSED = 60;
const NAV_WIDTH_EXPANDED  = 224;

// Scene type — 'ai-chat' is triggered by long queries (>3 words)
type Scene = 'dashboard' | 'folder' | 'search' | 'document' | 'ai-chat';

const SearchSidecar: React.FC = () => {
  const [scene, setScene]               = useState<Scene>('folder');
  const [activeFolder, setActiveFolder] = useState('environmental');
  const [documentOpen, setDocumentOpen]   = useState<Doc | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [throttled, setThrottled]         = useState(false);
  const [folderPanelWidth, setFolderPanelWidth]         = useState(FOLDER_PANEL_WIDTH);
  const [folderPanelCollapsed, setFolderPanelCollapsed] = useState(false);
  const [navExpanded, setNavExpanded]     = useState(false);
  const [aiOpenDocs, setAiOpenDocs]       = useState<AiDocItem[]>([]);
  const [aiActiveDocId, setAiActiveDocId] = useState<string | null>(null);
  const [aiReadIds, setAiReadIds]         = useState<Set<string>>(new Set());
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const navWidth = navExpanded ? NAV_WIDTH_EXPANDED : NAV_WIDTH_COLLAPSED;

  const folderResizeDragStartX = useRef(0);
  const folderResizeDragStartW = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ']') setFolderPanelCollapsed(false);
      if (e.key === '[') setFolderPanelCollapsed(true);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFolderPanelResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    folderResizeDragStartX.current = e.clientX;
    folderResizeDragStartW.current = folderPanelWidth;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - folderResizeDragStartX.current;
      setFolderPanelWidth(Math.max(FOLDER_PANEL_MIN, Math.min(FOLDER_PANEL_MAX, folderResizeDragStartW.current + delta)));
    };
    const onUp = () => {
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [folderPanelWidth]);

  // When the query is cleared, exit search results — but leave ai-chat open (sparkle toggles it)
  useEffect(() => {
    if (!searchQuery.trim() && scene === 'search') {
      setScene(documentOpen ? 'document' : 'folder');
    }
  }, [searchQuery, scene, documentOpen]);

  const handleDocumentOpen = useCallback((doc: Doc) => {
    setDocumentOpen(doc);
    setScene('document');
    if (window.innerWidth <= 1280) setFolderPanelCollapsed(true);
  }, []);

  const handleDocumentClose = useCallback(() => {
    setDocumentOpen(null);
    setFolderPanelCollapsed(false);
    setScene(searchQuery.trim() ? 'search' : 'folder');
  }, [searchQuery]);

  const handleFolderChange = useCallback(
    (id: string) => {
      setActiveFolder(id);
      if (scene !== 'search') setScene('folder');
    },
    [scene]
  );

  const handleDocumentsNav = useCallback(() => {
    setSearchQuery('');
    setActiveFolder('environmental');
    setDocumentOpen(null);
    setFolderPanelCollapsed(false);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const wordCount = query.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 3) {
      setScene('ai-chat');
    } else if (query.trim()) {
      setScene('search');
    }
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: <FontAwesomeIcon icon={faChartBar} /> },
    { label: 'Documents', icon: <FontAwesomeIcon icon={faFileLines} />, active: true, onClick: handleDocumentsNav },
    { label: 'Trackers',  icon: <FontAwesomeIcon icon={faListCheck} /> },
    { label: 'Q&A',       icon: <FontAwesomeIcon icon={faComments} /> },
    { label: 'Users',     icon: <FontAwesomeIcon icon={faUsers} /> },
    { label: 'Search flow A', icon: <FontAwesomeIcon icon={faArrowUpRightFromSquare} />, href: '/projects/graham-search-sidecar-a' },
    { label: 'Search flow B', icon: <FontAwesomeIcon icon={faArrowUpRightFromSquare} />, href: '/projects/graham-search-sidecar-b' },
  ];

  const isAiChat = scene === 'ai-chat';

  // Clear doc tabs when leaving ai-chat scene
  useEffect(() => { if (!isAiChat) { setAiOpenDocs([]); setAiActiveDocId(null); setAiReadIds(new Set()); } }, [isAiChat]);

  const handleAiDocClick = useCallback((item: AiDocItem) => {
    setAiOpenDocs(prev => prev.some(d => d.indexNum === item.indexNum) ? prev : [...prev, item]);
    setAiActiveDocId(item.indexNum);
    setAiReadIds(prev => new Set([...prev, item.indexNum]));
  }, []);

  const handleAiDocClose = useCallback((indexNum: string) => {
    setAiOpenDocs(prev => {
      const remaining = prev.filter(d => d.indexNum !== indexNum);
      setAiActiveDocId(curr => curr === indexNum ? (remaining.length > 0 ? remaining[remaining.length - 1].indexNum : null) : curr);
      return remaining;
    });
  }, []);

  // Close drawer (and clear doc tabs) when the full ai-chat scene activates
  useEffect(() => { if (isAiChat) { setChatDrawerOpen(false); setAiOpenDocs([]); setAiActiveDocId(null); } }, [isAiChat]);

  const handleSparkleClick = useCallback(() => {
    setChatDrawerOpen(o => !o);
  }, []);

  const handleDrawerFileClick = useCallback((item: AiDocItem) => {
    if (!chatDrawerOpen) setChatDrawerOpen(true);
    handleAiDocClick(item);
  }, [chatDrawerOpen, handleAiDocClick]);

  // Effective margin-left for the main content area
  const mainMarginLeft: string | number = isAiChat
    ? RESULTS_PANEL_WIDTH
    : folderPanelCollapsed ? 0 : folderPanelWidth;

  return (
    <DatasitePrototypeShell
      productMode="diligence"
      projectName="Project Halo"
      navItems={navItems}
      onSearch={handleSearch}
      searchQuery={searchQuery}
      onExpandedChange={setNavExpanded}
      navBgColor="background.defaultAlt"
      hideSidecar
      topBarActions={
        <>
          <DatasiteAiButton onClick={handleSparkleClick} active={chatDrawerOpen} />
          <DatasiteAppSwitcher />
        </>
      }>

      {/* Left panel — folder tree OR compact results (ai-chat scene) */}
      {isAiChat ? (
        <CompactResultsPanel navWidth={navWidth} onDocClick={handleAiDocClick} activeDocId={aiActiveDocId} readIds={aiReadIds} />
      ) : (
        <FolderTreePanel
          activeFolder={scene === 'search' ? '' : activeFolder}
          onFolderChange={handleFolderChange}
          width={folderPanelWidth}
          onResizeStart={handleFolderPanelResizeStart}
          collapsed={folderPanelCollapsed}
          navWidth={navWidth}
        />
      )}

      {/* Main content area — always flex row; scenes live in the inner column */}
      <Box
        sx={{
          height: '100%',
          ml: typeof mainMarginLeft === 'string' ? mainMarginLeft : `${mainMarginLeft}px`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
        }}>

        {/* Inner scene column — doc viewer overlays this absolutely */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: isAiChat ? 'row' : 'column', overflow: 'hidden', minWidth: 0, position: 'relative' }}>
          {isAiChat && (
            <>
              {/* Tabbed doc viewer — slides in from left, takes majority of space */}
              <Box sx={{
                width: aiOpenDocs.length > 0 ? '65%' : '0%',
                flexShrink: 0,
                overflow: 'hidden',
                transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                {aiOpenDocs.length > 0 && (
                  <TabbedDocViewer
                    openDocs={aiOpenDocs}
                    activeDocId={aiActiveDocId}
                    onTabClick={setAiActiveDocId}
                    onTabClose={handleAiDocClose}
                    onCloseAll={() => { setAiOpenDocs([]); setAiActiveDocId(null); }}
                  />
                )}
              </Box>
              {/* Chat panel */}
              <Box sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                <InlineAiChatPanel
                  query={searchQuery}
                  onClose={() => { setSearchQuery(''); setScene('folder'); }}
                  onSourceClick={handleAiDocClick}
                />
              </Box>
            </>
          )}
          {!isAiChat && (scene === 'folder' || scene === 'document') && (
            <FolderTable
              activeFolder={activeFolder}
              onDocumentOpen={(doc) => {
                if (chatDrawerOpen) {
                  handleAiDocClick({ doc: doc.name, type: doc.type, indexNum: doc.id });
                } else {
                  handleDocumentOpen(doc);
                }
              }}
              openDocId={documentOpen?.id}
              throttled={throttled}
              onThrottleToggle={() => setThrottled(p => !p)}
            />
          )}
          {!isAiChat && scene === 'search' && (
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <SearchResultsContent query={searchQuery} onFileClick={handleDrawerFileClick} onToggleChat={handleSparkleClick} />
            </Box>
          )}

          {/* Doc viewer — absolute overlay, slides in from chat's left edge, sits above the grid */}
          {!isAiChat && (
            <Box sx={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: chatDrawerOpen && aiOpenDocs.length > 0 ? '70%' : 0,
              overflow: 'hidden',
              transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10,
              boxShadow: chatDrawerOpen && aiOpenDocs.length > 0 ? '-6px 0 24px rgba(0,0,0,0.10)' : 'none',
            }}>
              {aiOpenDocs.length > 0 && (
                <TabbedDocViewer
                  openDocs={aiOpenDocs}
                  activeDocId={aiActiveDocId}
                  onTabClick={setAiActiveDocId}
                  onTabClose={handleAiDocClose}
                  onCloseAll={() => { setAiOpenDocs([]); setAiActiveDocId(null); }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Chat panel — inline, fixed 440px, not floating */}
        {!isAiChat && (
          <Box sx={{
            width: chatDrawerOpen ? 440 : 0,
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <InlineAiChatPanel
              query={searchQuery}
              onClose={() => { setChatDrawerOpen(false); setAiOpenDocs([]); setAiActiveDocId(null); }}
              onSourceClick={handleAiDocClick}
            />
          </Box>
        )}
      </Box>

      {/* Document viewer overlay */}
      <DocumentViewer
        doc={documentOpen}
        onClose={handleDocumentClose}
        assistantOpen={false}
        assistantWidth={SIDECAR_WIDTH}
        assistantViewMode="sidebar"
        searchQuery={searchQuery}
        folderPanelWidth={folderPanelCollapsed ? 0 : folderPanelWidth}
        navWidth={navWidth}
      />
    </DatasitePrototypeShell>
  );
};

export default SearchSidecar;
