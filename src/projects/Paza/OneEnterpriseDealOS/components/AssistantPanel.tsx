import { useState, type ReactNode } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faArrowRight, faFileLines, faMagnifyingGlass, faMessagesQuestion, faPenLine, faSparkles } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Dialog, DialogContent, InputBase, Snackbar, Stack, Typography } from '@mui/material';
import AssistantRail, { type AssistantRailMode, type RecentChat } from './AssistantRail';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';
import FullChatEmptyState from './FullChatEmptyState';
import MerlinComposerFrame from './MerlinComposerFrame';
import { SOURCING_COPY } from '../state/sourcingScenario';
import type { WorkspaceAction, WorkspaceState } from '../state/types';
import type { DealPlaybook } from '../state/dealsFixtures';
import type { DealLayout, SeatId } from '../state/persona';

export type { RecentChat };

interface Props {
  activeSessionId: string;
  activeMode: AssistantRailMode;
  recentChats: RecentChat[];
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onViewPlan: () => void;
  onApprovePlan: () => void;
  onOpenSavedFiles: () => void;
  onOpenQaItem: (itemId: string) => void;
  onOpenFilingReview: () => void;
  onOpenCitation: (fileId: string) => void;
  seat: SeatId;
  onOpenSkills: () => void;
  onOpenTemplates: () => void;
  onOpenDocumentFile: (fileId: string) => void;
  onJumpToDocuments: () => void;
  onJumpToQa: () => void;
  onJumpToNotes: () => void;
  composerPlaceholder?: string;
  railOnly?: boolean;
  // ── Deal workspace (Phases 2–3) ──
  dealActive?: boolean;
  onDealSuggestion?: (action: 'screen-gulfair' | 'queue-cim' | 'whats-changed') => void;
  onRunPlaybook?: (playbook: DealPlaybook) => void;
  onAllAgents?: () => void;
  researchAgentActive?: boolean;
  seatLayout?: DealLayout;
  onSeatLayout?: (layout: DealLayout) => void;
  onApproveCimPlan?: () => void;
  onOpenCimReview?: () => void;
  onAskGrataSimilar?: () => void;
}

export default function AssistantPanel({
  activeSessionId,
  activeMode,
  recentChats,
  state,
  dispatch,
  onNewChat,
  onSelectSession,
  onViewPlan,
  onApprovePlan,
  onOpenSavedFiles,
  onOpenQaItem,
  onOpenFilingReview,
  onOpenCitation,
  seat,
  onOpenSkills,
  onOpenTemplates,
  onOpenDocumentFile,
  onJumpToDocuments,
  onJumpToQa,
  onJumpToNotes,
  composerPlaceholder,
  railOnly = false,
  dealActive = false,
  onDealSuggestion,
  onRunPlaybook,
  onAllAgents,
  researchAgentActive = false,
  seatLayout = 'chat-first',
  onSeatLayout,
  onApproveCimPlan,
  onOpenCimReview,
  onAskGrataSimilar,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [sourcingToastOpen, setSourcingToastOpen] = useState(false);
  const showFullEmpty = state.stage === 'chat-empty';
  const composerLoading = state.stage === 'chat-processing-recommendation'
    || state.stage === 'save-processing'
    || state.cimRun.phase === 'working'
    || state.cimRun.phase === 'executing'
    || state.grataSimilarRunning;

  const openSearchSpotlight = () => {
    setSearchValue('');
    setSearchOpen(true);
  };

  const submitSearchPrompt = (prompt: string) => {
    setSearchOpen(false);
    dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt });
  };

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', overflow: 'hidden', bgcolor: 'background.paper' }}>
      <AssistantRail
        activeSessionId={activeSessionId}
        activeMode={activeMode}
        recentChats={recentChats}
        onNewChat={onNewChat}
        onOpenSearch={openSearchSpotlight}
        onOpenSkills={onOpenSkills}
        onOpenTemplates={onOpenTemplates}
        onSelectSession={onSelectSession}
        dealActive={dealActive}
        onRunPlaybook={onRunPlaybook}
        onAllAgents={onAllAgents}
        researchAgentActive={researchAgentActive}
        seatLayout={seatLayout}
        onSeatLayout={onSeatLayout}
      />
      <SearchSpotlightDialog
        open={searchOpen}
        value={searchValue}
        recentChats={recentChats}
        onChange={setSearchValue}
        onClose={() => setSearchOpen(false)}
        onSubmit={submitSearchPrompt}
        onNewChat={() => {
          setSearchOpen(false);
          onNewChat();
        }}
        onSelectSession={(sessionId) => {
          setSearchOpen(false);
          onSelectSession(sessionId);
        }}
        onOpenDocumentFile={(fileId) => {
          setSearchOpen(false);
          onOpenDocumentFile(fileId);
        }}
        onJumpToDocuments={() => {
          setSearchOpen(false);
          onJumpToDocuments();
        }}
        onJumpToQa={() => {
          setSearchOpen(false);
          onJumpToQa();
        }}
        onJumpToNotes={() => {
          setSearchOpen(false);
          onJumpToNotes();
        }}
      />
      {railOnly ? null : (
        <Box sx={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {showFullEmpty ? (
            <FullChatEmptyState
              mode={activeMode}
              composerValue={state.composerValue}
              attachedFileIds={state.attachedFileIds}
              attachedFolderIds={state.attachedFolderIds}
              composerLoading={composerLoading}
              composerPlaceholder={composerPlaceholder}
              onComposerChange={(value) => dispatch({ type: 'CHAT_PROMPT_CHANGED', value })}
              onComposerSubmit={(prompt) => dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt })}
              onContextChange={({ fileIds, folderIds }) => dispatch({ type: 'SET_CONTEXT_REFERENCES', fileIds, folderIds })}
              onSelectFolderPrompt={() => dispatch({ type: 'SELECT_FOLDER_PROMPT' })}
              onSelectFilingPrompt={() => dispatch({ type: 'SELECT_FILING_PROMPT' })}
              onSelectBriefPrompt={() => dispatch({ type: 'SELECT_BRIEF_PROMPT' })}
              seat={seat}
            />
          ) : (
            <>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                  overscrollBehavior: 'contain',
                  px: { xs: 2, md: 6 },
                  py: 5,
                }}
              >
                <Box sx={{ width: 'min(760px, 100%)', mx: 'auto' }}>
                  <ChatMessageList
                    state={state}
                    onViewPlan={onViewPlan}
                    onApprovePlan={onApprovePlan}
                    onOpenSavedFiles={onOpenSavedFiles}
                    onOpenQaItem={onOpenQaItem}
                    onOpenFilingReview={onOpenFilingReview}
                    onToggleRationale={() => dispatch({ type: 'SHOW_RATIONALE' })}
                    onOpenCitation={onOpenCitation}
                    onToggleSourcingTerms={() => dispatch({ type: 'TOGGLE_SOURCING_TERMS' })}
                    onRemoveSourcingTerm={(termId) => dispatch({ type: 'REMOVE_SOURCING_TERM', termId })}
                    onNarrowSourcing={() => dispatch({ type: 'NARROW_SOURCING' })}
                    onNoOpSourcingSuggestion={() => setSourcingToastOpen(true)}
                    onDealSuggestion={onDealSuggestion}
                    onApproveCimPlan={onApproveCimPlan}
                    onOpenCimReview={onOpenCimReview}
                    onAskGrataSimilar={onAskGrataSimilar}
                  />
                </Box>
              </Box>

              <Box sx={{ px: { xs: 2, md: 6 }, pb: 3 }}>
                <Box sx={{ width: 'min(600px, 100%)', mx: 'auto' }}>
                  <MerlinComposerFrame state={state} dispatch={dispatch} active={dealActive}>
                    <ChatComposer
                      large
                      showPoweredLine={!dealActive}
                      loading={composerLoading}
                      value={state.composerValue}
                      placeholder={composerPlaceholder}
                      attachedFileIds={state.attachedFileIds}
                      attachedFolderIds={state.attachedFolderIds}
                      onChange={(value) => dispatch({ type: 'CHAT_PROMPT_CHANGED', value })}
                      onSubmit={(prompt) => dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt })}
                      onContextChange={({ fileIds, folderIds }) => dispatch({ type: 'SET_CONTEXT_REFERENCES', fileIds, folderIds })}
                    />
                  </MerlinComposerFrame>
                </Box>
              </Box>
            </>
          )}
        </Box>
      )}
      <Snackbar
        open={sourcingToastOpen}
        autoHideDuration={2600}
        onClose={() => setSourcingToastOpen(false)}
        message={SOURCING_COPY.continuationToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

function SearchSpotlightDialog({
  open,
  value,
  recentChats,
  onChange,
  onClose,
  onSubmit,
  onNewChat,
  onSelectSession,
  onOpenDocumentFile,
  onJumpToDocuments,
  onJumpToQa,
  onJumpToNotes,
}: {
  open: boolean;
  value: string;
  recentChats: RecentChat[];
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onOpenDocumentFile: (fileId: string) => void;
  onJumpToDocuments: () => void;
  onJumpToQa: () => void;
  onJumpToNotes: () => void;
}) {
  const query = value.trim();
  const hasQuery = Boolean(query);
  const agenticPrompt = 'Find support for churn and NRR claims that can be shared with Round 1 buyers.';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent sx={{ p: 0 }}>
        <Stack spacing={0}>
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              if (query) {
                onSubmit(query);
                return;
              }
              onNewChat();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </Box>
            <InputBase
              autoFocus
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Search files, Q&A, chats, or ask Datasite AI..."
              fullWidth
              inputProps={{ 'aria-label': 'Search files, Q&A, chats, or ask Datasite AI' }}
              sx={{ fontSize: 15 }}
            />
          </Box>

          <Box sx={{ maxHeight: 'min(560px, 68vh)', overflowY: 'auto', overscrollBehavior: 'contain' }}>
            {hasQuery ? (
              <SpotlightSearchResults
                query={query}
                recentChats={recentChats}
                agenticPrompt={agenticPrompt}
                onSubmit={onSubmit}
                onOpenDocumentFile={onOpenDocumentFile}
                onSelectSession={onSelectSession}
              />
            ) : (
              <SpotlightDefaultState
                recentChats={recentChats}
                onNewChat={onNewChat}
                onSearchTermSelect={onChange}
                onOpenDocumentFile={onOpenDocumentFile}
                onSelectSession={onSelectSession}
                onJumpToDocuments={onJumpToDocuments}
                onJumpToQa={onJumpToQa}
                onJumpToNotes={onJumpToNotes}
              />
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

const RECENT_SEARCHES = ['churn', 'NRR', 'source code', 'SOC 2'];

const DEFAULT_RECENT_FILES = [
  {
    fileId: 'arr-bridge',
    title: 'ARR Bridge FY2024.xlsx',
    description: 'Financials / Revenue / ARR and cohorts',
  },
  {
    fileId: 'cohort-retention',
    title: 'Enterprise Cohort Retention.pdf',
    description: 'Financials / Revenue / ARR and cohorts',
  },
  {
    fileId: 'renewals',
    title: 'Renewal Pipeline FY2026.xlsx',
    description: 'Customers / Enterprise accounts / Top customers',
  },
];

const RELATED_CHURN_FILES = [
  {
    fileId: 'arr-bridge',
    title: 'ARR Bridge FY2024.xlsx',
    description: 'Includes churn and contraction bridge for FY2024 ARR movement.',
  },
  {
    fileId: 'cohort-retention',
    title: 'Enterprise Cohort Retention.pdf',
    description: 'Board version with cohort retention methodology and enterprise trends.',
  },
  {
    fileId: 'renewals',
    title: 'Renewal Pipeline FY2026.xlsx',
    description: 'Shows renewal quarter, gross ARR, expansion opportunity, and risk rating.',
  },
];

function SpotlightDefaultState({
  recentChats,
  onNewChat,
  onSearchTermSelect,
  onOpenDocumentFile,
  onSelectSession,
  onJumpToDocuments,
  onJumpToQa,
  onJumpToNotes,
}: {
  recentChats: RecentChat[];
  onNewChat: () => void;
  onSearchTermSelect: (value: string) => void;
  onOpenDocumentFile: (fileId: string) => void;
  onSelectSession: (sessionId: string) => void;
  onJumpToDocuments: () => void;
  onJumpToQa: () => void;
  onJumpToNotes: () => void;
}) {
  return (
    <Stack spacing={1.5} sx={{ p: 1.25 }}>
      <SpotlightResult
        prominent
        icon={faSparkles}
        title="New Datasite AI chat"
        description="Start a blank chat for search, Q&A, files, notes, or agentic work."
        onClick={onNewChat}
      />

      <SpotlightSection title="Recent chats">
        {recentChats.slice(0, 3).map((chat) => (
          <SpotlightResult
            key={chat.id}
            icon={faMessagesQuestion}
            title={chat.title}
            description={`Datasite AI session · ${chat.relativeTime}`}
            onClick={() => onSelectSession(chat.id)}
          />
        ))}
      </SpotlightSection>

      <SpotlightSection title="Recent searches">
        {RECENT_SEARCHES.map((search) => (
          <SpotlightResult
            key={search}
            icon={faMagnifyingGlass}
            title={search}
            description="Search files, Q&A, and Datasite AI threads"
            onClick={() => onSearchTermSelect(search)}
          />
        ))}
      </SpotlightSection>

      <SpotlightSection title="Recent files">
        {DEFAULT_RECENT_FILES.map((file) => (
          <SpotlightResult
            key={file.fileId}
            icon={faFileLines}
            title={file.title}
            description={file.description}
            onClick={() => onOpenDocumentFile(file.fileId)}
          />
        ))}
      </SpotlightSection>

      <SpotlightSection title="Jump to">
        <SpotlightResult
          icon={faFileLines}
          title="Documents"
          description="Open the sell-side room index and file preview."
          onClick={onJumpToDocuments}
        />
        <SpotlightResult
          icon={faMessagesQuestion}
          title="Q&A"
          description="Open buyer questions and answer-support detail."
          onClick={onJumpToQa}
        />
        <SpotlightResult
          icon={faPenLine}
          title="Notes"
          description="Open private discovery notes for this room."
          onClick={onJumpToNotes}
        />
      </SpotlightSection>
    </Stack>
  );
}

function SpotlightSearchResults({
  query,
  recentChats,
  agenticPrompt,
  onSubmit,
  onOpenDocumentFile,
  onSelectSession,
}: {
  query: string;
  recentChats: RecentChat[];
  agenticPrompt: string;
  onSubmit: (prompt: string) => void;
  onOpenDocumentFile: (fileId: string) => void;
  onSelectSession: (sessionId: string) => void;
}) {
  const relatedChats = recentChats.filter((chat) =>
    ['churn', 'nrr', 'triage'].some((term) => chat.title.toLowerCase().includes(term))
  );

  return (
    <Stack spacing={1.5} sx={{ p: 1.25 }}>
      <SpotlightSection title={`Related files for "${query}"`}>
        {RELATED_CHURN_FILES.map((file) => (
          <SpotlightResult
            key={file.fileId}
            icon={faFileLines}
            title={file.title}
            description={file.description}
            onClick={() => onOpenDocumentFile(file.fileId)}
          />
        ))}
      </SpotlightSection>

      <SpotlightSection title="Related Datasite AI chats">
        {(relatedChats.length > 0 ? relatedChats : recentChats.slice(0, 3)).map((chat) => (
          <SpotlightResult
            key={chat.id}
            icon={faMessagesQuestion}
            title={chat.title}
            description={`Return to this Datasite AI session · ${chat.relativeTime}`}
            onClick={() => onSelectSession(chat.id)}
          />
        ))}
      </SpotlightSection>

      <SpotlightResult
        icon={faSparkles}
        title="Find support for churn and NRR claims"
        description="Let Datasite AI form the search plan and prepare buyer-shareable support."
        onClick={() => onSubmit(agenticPrompt)}
      />
    </Stack>
  );
}

function SpotlightSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack spacing={0.5}>
      <Typography sx={{ px: 1, fontSize: 11, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Stack spacing={0.25}>{children}</Stack>
    </Stack>
  );
}

function SpotlightResult({
  icon,
  title,
  description,
  onClick,
  prominent = false,
}: {
  icon: IconDefinition;
  title: string;
  description: string;
  onClick: () => void;
  prominent?: boolean;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: '100%',
        border: 0,
        borderRadius: 2,
        bgcolor: prominent ? 'action.selected' : 'transparent',
        px: 1,
        py: 1,
        textAlign: 'left',
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: '28px minmax(0, 1fr) 20px',
        gap: 1,
        alignItems: 'center',
        font: 'inherit',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ color: 'text.secondary', display: 'inline-flex', justifyContent: 'center' }}>
        <FontAwesomeIcon icon={icon} />
      </Box>
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {description}
        </Typography>
      </Stack>
      <Box sx={{ color: 'text.disabled', display: 'inline-flex', justifyContent: 'center' }}>
        <FontAwesomeIcon icon={faArrowRight} />
      </Box>
    </Box>
  );
}
