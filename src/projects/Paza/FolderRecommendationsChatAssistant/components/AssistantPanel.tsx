import { Box } from '@mui/material';
import AssistantRail from './AssistantRail';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';
import FullChatEmptyState from './FullChatEmptyState';
import type { WorkspaceAction, WorkspaceState } from '../state/types';

interface Props {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  onReview: () => void;
  onOpenSavedFiles: () => void;
  reviewActive?: boolean;
  railOnly?: boolean;
}

export default function AssistantPanel({
  state,
  dispatch,
  onReview,
  onOpenSavedFiles,
  reviewActive = false,
  railOnly = false,
}: Props) {
  const showFullEmpty = state.stage === 'chat-empty';
  const composerLoading = state.stage === 'chat-processing-recommendation' || state.stage === 'save-processing';

  const handleNewChat = () => {
    dispatch({ type: 'NEW_CHAT' });
  };

  const handleSelectHistoryItem = (label: string) => {
    if (label.includes('folder structure')) {
      dispatch({ type: 'SELECT_FOLDER_PROMPT' });
      return;
    }
    dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt: label });
  };

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', overflow: 'hidden', bgcolor: 'background.paper' }}>
      <AssistantRail
        onNewChat={handleNewChat}
        onSelectItem={handleSelectHistoryItem}
      />
      {railOnly ? null : (
        <Box sx={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {showFullEmpty ? (
            <FullChatEmptyState
              composerValue={state.composerValue}
              attachedFileIds={state.attachedFileIds}
              composerLoading={composerLoading}
              onComposerChange={(value) => dispatch({ type: 'CHAT_PROMPT_CHANGED', value })}
              onComposerSubmit={(prompt) => dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt })}
              onAttachmentsChange={(fileIds) => dispatch({ type: 'SET_ATTACHMENTS', fileIds })}
              onSelectFolderPrompt={() => dispatch({ type: 'SELECT_FOLDER_PROMPT' })}
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
                    onReview={onReview}
                    reviewActive={reviewActive}
                    onShowRationale={() => dispatch({ type: 'SHOW_RATIONALE' })}
                    onOpenSavedFiles={onOpenSavedFiles}
                  />
                </Box>
              </Box>

              <Box sx={{ px: { xs: 2, md: 6 }, pb: 3 }}>
                <Box sx={{ width: 'min(600px, 100%)', mx: 'auto' }}>
                  <ChatComposer
                    large
                    loading={composerLoading}
                    value={state.composerValue}
                    attachedFileIds={state.attachedFileIds}
                    onChange={(value) => dispatch({ type: 'CHAT_PROMPT_CHANGED', value })}
                    onSubmit={(prompt) => dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt })}
                    onAttachmentsChange={(fileIds) => dispatch({ type: 'SET_ATTACHMENTS', fileIds })}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
