import {
  faBookOpenLines,
  faCommentsQuestion,
  faFolderTree,
  faPenLine,
  faTableCells,
} from '@fortawesome/pro-light-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import ChatComposer from './ChatComposer';
import { COPY, GAP_FINDER_PROMPT } from '../state/copy';
import type { SeatId } from '../state/persona';

export type FullChatEmptyStateMode = 'chat' | 'skills';

const fadeUpEntranceSx = (delayMs: number, durationMs = 380) => ({
  opacity: 0,
  transform: 'translateY(10px)',
  animation: `emptyChatFadeUp ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1) ${delayMs}ms forwards`,
  '@keyframes emptyChatFadeUp': {
    from: {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    opacity: 1,
    transform: 'none',
    animation: 'none',
  },
});

interface Props {
  mode?: FullChatEmptyStateMode;
  composerValue: string;
  attachedFileIds: string[];
  attachedFolderIds: string[];
  composerLoading?: boolean;
  composerPlaceholder?: string;
  onComposerChange: (value: string) => void;
  onComposerSubmit: (value: string) => void;
  onContextChange: (context: { fileIds: string[]; folderIds: string[] }) => void;
  onSelectFolderPrompt: () => void;
  onSelectFilingPrompt: () => void;
  onSelectRetroPrompt: () => void;
  onSelectClientDropPrompt: () => void;
  onSelectBriefPrompt: () => void;
  seat: SeatId;
}

export default function FullChatEmptyState({
  mode = 'chat',
  composerValue,
  attachedFileIds,
  attachedFolderIds,
  composerLoading = false,
  composerPlaceholder,
  onComposerChange,
  onComposerSubmit,
  onContextChange,
  onSelectFolderPrompt,
  onSelectFilingPrompt,
  onSelectRetroPrompt,
  onSelectClientDropPrompt,
  onSelectBriefPrompt,
  seat,
}: Props) {
  const copy = getEmptyStateCopy(mode, seat);

  const handlePromptClick = (prompt: EmptyStatePrompt) => {
    if (prompt.action === 'select-folder') {
      onSelectFolderPrompt();
      return;
    }
    if (prompt.action === 'select-filing') {
      onSelectFilingPrompt();
      return;
    }
    if (prompt.action === 'select-retro') {
      onSelectRetroPrompt();
      return;
    }
    if (prompt.action === 'select-client-drop') {
      onSelectClientDropPrompt();
      return;
    }
    if (prompt.action === 'select-brief') {
      onSelectBriefPrompt();
      return;
    }
    onComposerSubmit(prompt.prompt);
  };

  return (
    <Box
      sx={{
        height: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      <Stack spacing={2.5} alignItems="center" sx={{ width: 'min(780px, 100%)' }}>
        <Typography
          component="h1"
          sx={{
            fontSize: 24,
            fontWeight: 400,
            color: 'text.primary',
            textAlign: 'center',
            ...fadeUpEntranceSx(80),
          }}
        >
          {copy.title}
        </Typography>
        <Box sx={{ width: 'min(600px, 100%)', ...fadeUpEntranceSx(180, 420) }}>
          <ChatComposer
            large
            showPoweredLine={false}
            loading={composerLoading}
            value={composerValue}
            placeholder={composerPlaceholder}
            attachedFileIds={attachedFileIds}
            attachedFolderIds={attachedFolderIds}
            onChange={onComposerChange}
            onSubmit={onComposerSubmit}
            onContextChange={onContextChange}
          />
        </Box>
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
          {copy.prompts.map((prompt, index) => (
            <Box key={prompt.label} sx={fadeUpEntranceSx(340 + index * 90, 340)}>
              <HaloButton
                size="small"
                variant="outlined"
                startIcon={<FontAwesomeIcon icon={prompt.icon} />}
                onClick={() => handlePromptClick(prompt)}
                sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
              >
                {prompt.label}
              </HaloButton>
            </Box>
          ))}
        </Stack>
        <Typography
          variant="caption"
          sx={{ display: 'block', color: 'text.disabled', textAlign: 'center', ...fadeUpEntranceSx(720, 340) }}
        >
          {copy.footnote}
        </Typography>
      </Stack>
    </Box>
  );
}

export type EmptyStatePrompt = {
  label: string;
  prompt: string;
  icon: IconDefinition;
  action?: 'select-folder' | 'select-filing' | 'select-retro' | 'select-client-drop' | 'select-brief';
};

export function getEmptyStateCopy(mode: FullChatEmptyStateMode, seat: SeatId): {
  title: string;
  footnote: string;
  prompts: EmptyStatePrompt[];
} {
  if (mode === 'skills') {
    return {
      title: 'What skill should Datasite AI build?',
      footnote: 'Skills and templates are one thing: describe the workflow, or upload the framework it should follow — Datasite AI drafts objective, inputs, checks, and approval path.',
      prompts: [
        {
          label: 'Turn my DD request list into a skill',
          prompt: 'Here is our tech M&A DD request list — turn it into a reusable skill that checks the room against it and flags the gaps before a senior review.',
          icon: faBookOpenLines,
        },
        {
          label: 'Churn / NRR response',
          prompt: 'Build a reusable skill for finding support for churn and NRR claims that can be shared with Round 1 buyers.',
          icon: faTableCells,
        },
        {
          label: 'Source-code disclosure',
          prompt: 'Build a reusable skill for reviewing source-code disclosure requests and routing restricted answers before buyer release.',
          icon: faCommentsQuestion,
        },
        {
          label: 'Round 1 answer drafting',
          prompt: 'Build a reusable skill for drafting Round 1 buyer answers with citations, disclosure checks, and approval checkpoints.',
          icon: faPenLine,
        },
      ],
    };
  }

  return {
    title: 'What should we bring into Project Aldgate?',
    footnote: 'Firm-level Stifel patterns, last 24 months — the deal team validates whether they match live workflow.',
    prompts:
      seat === 'tom'
        ? [
            {
              label: COPY.folderPromptTitle,
              prompt: COPY.userPrompt,
              icon: faBookOpenLines,
              action: 'select-folder',
            },
            {
              // Tom's operator relief: batch upload → approval-gated filing plan.
              label: 'File my latest upload',
              prompt: FILING_COPY_USER_PROMPT,
              icon: faFolderTree,
              action: 'select-filing',
            },
            {
              // P0.1: filing must cover EXISTING files, not just uploads — their repeated ask.
              label: 'Tidy existing files',
              prompt: 'Sweep the files already in the sandbox for misfiles, naming breaks, and duplicates.',
              icon: faTableCells,
              action: 'select-retro',
            },
            {
              // Gap-finder replaces the refuted MD-readout brief for the operator seat:
              // seniors inspect the room; the job is airtight-before-they-look.
              label: 'Find the gaps',
              prompt: GAP_FINDER_PROMPT,
              icon: faCommentsQuestion,
            },
            {
              // P0.1: the "winner" shape — client acts in the sandbox, the banker approves.
              label: 'Review the client drop',
              prompt: 'The client dropped files into the sandbox overnight — propose where it all goes.',
              icon: faBookOpenLines,
              action: 'select-client-drop',
            },
          ]
        : [
            {
              label: COPY.folderPromptTitle,
              prompt: COPY.userPrompt,
              icon: faBookOpenLines,
              action: 'select-folder',
            },
            {
              label: 'State of the room',
              prompt: 'What moved overnight in Project Aldgate, what is stuck, and what would embarrass us in front of the MD? Make it a brief I could forward unedited.',
              icon: faCommentsQuestion,
              action: 'select-brief',
            },
            {
              // P0.1: the client-drop approval queue, reachable from the analyst seat too.
              label: 'Review the client drop',
              prompt: 'The client dropped files into the sandbox overnight — propose where it all goes.',
              icon: faTableCells,
              action: 'select-client-drop',
            },
            {
              label: 'Private notes',
              prompt: 'Capture discovery notes about Stifel Q&A and saved search pain',
              icon: faPenLine,
            },
          ],
  };
}

const FILING_COPY_USER_PROMPT =
  'I’ve just uploaded a batch of files to the staging area — file them into the sandbox structure, and propose new folders where nothing fits. Nothing moves until I approve.';
