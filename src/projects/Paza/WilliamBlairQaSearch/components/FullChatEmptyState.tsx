import {
  faBookOpenLines,
  faCommentsQuestion,
  faPenLine,
  faTableCells,
} from '@fortawesome/pro-light-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import ChatComposer from './ChatComposer';
import { COPY } from '../state/copy';

export type FullChatEmptyStateMode = 'chat' | 'skills' | 'templates';

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
}: Props) {
  const copy = getEmptyStateCopy(mode);

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
          <Box sx={fadeUpEntranceSx(340, 340)}>
            <HaloButton
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={copy.prompts[0].icon} />}
              onClick={() => {
                if (copy.prompts[0].action === 'select-folder') {
                  onSelectFolderPrompt();
                  return;
                }
                onComposerSubmit(copy.prompts[0].prompt);
              }}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {copy.prompts[0].label}
            </HaloButton>
          </Box>
          <Box sx={fadeUpEntranceSx(430, 340)}>
            <HaloButton
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={copy.prompts[1].icon} />}
              onClick={() => onComposerSubmit(copy.prompts[1].prompt)}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {copy.prompts[1].label}
            </HaloButton>
          </Box>
          <Box sx={fadeUpEntranceSx(520, 340)}>
            <HaloButton
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={copy.prompts[2].icon} />}
              onClick={() => onComposerSubmit(copy.prompts[2].prompt)}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {copy.prompts[2].label}
            </HaloButton>
          </Box>
          <Box sx={fadeUpEntranceSx(610, 340)}>
            <HaloButton
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={copy.prompts[3].icon} />}
              onClick={() => onComposerSubmit(copy.prompts[3].prompt)}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {copy.prompts[3].label}
            </HaloButton>
          </Box>
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

type EmptyStatePrompt = {
  label: string;
  prompt: string;
  icon: IconDefinition;
  action?: 'select-folder';
};

function getEmptyStateCopy(mode: FullChatEmptyStateMode): {
  title: string;
  footnote: string;
  prompts: EmptyStatePrompt[];
} {
  if (mode === 'skills') {
    return {
      title: 'What skill should Datasite AI build?',
      footnote: 'Describe the reusable workflow once. Datasite AI can draft the objective, inputs, checks, templates, and approval path.',
      prompts: [
        {
          label: 'Churn / NRR response',
          prompt: 'Build a reusable skill for finding support for churn and NRR claims that can be shared with Round 1 buyers.',
          icon: faBookOpenLines,
        },
        {
          label: 'Source-code disclosure',
          prompt: 'Build a reusable skill for reviewing source-code disclosure requests and routing restricted answers before buyer release.',
          icon: faCommentsQuestion,
        },
        {
          label: 'DPA evidence search',
          prompt: 'Build a reusable skill for finding DPA, SOC 2, and security evidence while flagging buyer-safe and restricted content.',
          icon: faTableCells,
        },
        {
          label: 'Round 1 answer drafting',
          prompt: 'Build a reusable skill for drafting Round 1 buyer answers with citations, disclosure checks, and approval checkpoints.',
          icon: faPenLine,
        },
      ],
    };
  }

  if (mode === 'templates') {
    return {
      title: 'What template should Datasite AI prepare?',
      footnote: 'Use firm playbooks and preferred output standards to ground the next agent workflow.',
      prompts: [
        {
          label: 'Q&A response template',
          prompt: 'Create a Q&A response template for cited buyer answers with disclosure status, owner, and approval notes.',
          icon: faBookOpenLines,
        },
        {
          label: 'Banker update format',
          prompt: 'Create a senior banker update template for search findings, unresolved risks, and next review actions.',
          icon: faCommentsQuestion,
        },
        {
          label: 'ARR diligence checklist',
          prompt: 'Create an ARR and churn diligence checklist template that agents can use when searching the room.',
          icon: faTableCells,
        },
        {
          label: 'Disclosure playbook',
          prompt: 'Create a Round 1 disclosure playbook template for permission checks, restricted files, and legal routing.',
          icon: faPenLine,
        },
      ],
    };
  }

  return {
    title: 'What should we triage in Project Silverstar?',
    footnote: 'Account-level William Blair signals only; Robbin validates whether they match live workflow.',
    prompts: [
      {
        label: COPY.folderPromptTitle,
        prompt: COPY.userPrompt,
        icon: faBookOpenLines,
        action: 'select-folder',
      },
      {
        label: 'Duplicates',
        prompt: 'Show duplicate buyer questions and which answers can be merged',
        icon: faCommentsQuestion,
      },
      {
        label: 'Q&A table',
        prompt: 'Open the Q&A command table',
        icon: faTableCells,
      },
      {
        label: 'Private notes',
        prompt: 'Capture discovery notes about William Blair Q&A and saved search pain',
        icon: faPenLine,
      },
    ],
  };
}
