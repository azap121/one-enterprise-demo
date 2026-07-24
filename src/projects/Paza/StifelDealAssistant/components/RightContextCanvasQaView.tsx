import { useEffect, useState } from 'react';
import {
  faArrowUpRightFromSquare,
  faBookOpenLines,
  faCheck,
  faMagnifyingGlass,
  faMessagesQuestion,
  faRoute,
  faShieldCheck,
  faTriangleExclamation,
} from '@fortawesome/pro-light-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { amber, jade, ruby, tanzanite } from '~/theme/halo/theme';
import {
  QA_DISCOVERY_PROMPTS,
  QA_EVIDENCE_CHIPS,
  QA_TRIAGE_ITEMS,
  STIFEL_SOURCE_FILES,
  getQaTriageItem,
  type QaTriageRowStatus,
} from './qaTriageData';

export interface QaFocusTarget {
  id: string;
  label: string;
  type: 'folder' | 'file';
  mode: 'ask' | 'view';
}

interface Props {
  bottomInset?: number;
  focusTarget?: QaFocusTarget | null;
  selectedItemId?: string | null;
  onOpenFile?: (fileId: string) => void;
}

type ActionState = 'idle' | 'routed' | 'ready';

export default function RightContextCanvasQaView({
  bottomInset = 0,
  focusTarget = null,
  selectedItemId = null,
  onOpenFile,
}: Props) {
  const selectedItem = getQaTriageItem(selectedItemId);
  const [actionState, setActionState] = useState<ActionState>('idle');
  const citationFiles = selectedItem.citationFileIds.flatMap((fileId) => {
    const file = STIFEL_SOURCE_FILES.find((candidate) => candidate.id === fileId);
    return file ? [file] : [];
  });

  useEffect(() => {
    setActionState('idle');
  }, [selectedItem.id]);

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5} sx={{ px: 2.5, pt: 1.5, pb: 1.25, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 500, color: 'text.primary' }}>
              {focusTarget ? focusTarget.mode === 'ask' ? 'Ask question' : 'Q&A for selected item' : 'Q&A triage detail'}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
              {focusTarget
                ? `${focusTarget.label} · ${focusTarget.type === 'folder' ? 'Folder' : 'File'}`
                : 'Selected buyer question, cited answer support, saved searches, and routing controls'}
            </Typography>
          </Stack>
          <AiReadChip status={selectedItem.aiRead} />
        </Stack>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {QA_EVIDENCE_CHIPS.slice(0, 2).map((chip) => (
            <Chip key={chip} size="small" label={chip} variant="outlined" />
          ))}
        </Stack>
      </Stack>

      <Stack
        spacing={1.5}
        sx={{
          flex: 1,
          minHeight: 0,
          px: 2,
          pt: 1.5,
          pb: bottomInset ? `${bottomInset}px` : 1.5,
          overflow: 'auto',
          transition: 'padding-bottom 180ms cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <Stack
          spacing={1.5}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            p: 1.75,
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box sx={{ width: 24, pt: 0.25, flexShrink: 0, color: 'text.secondary' }}>
              <FontAwesomeIcon icon={faMessagesQuestion} style={{ fontSize: 15 }} />
            </Box>
            <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={selectedItem.buyer} variant="outlined" />
                <Chip size="small" label={selectedItem.category} variant="outlined" />
                <Chip size="small" label={selectedItem.owner} variant="outlined" />
              </Stack>
              <Typography sx={{ fontSize: 14.5, fontWeight: 650, color: 'text.primary', lineHeight: 1.45 }}>
                {selectedItem.question}
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <DetailBlock
              icon={faBookOpenLines}
              title="Suggested answer"
              body={selectedItem.suggestedAnswer}
            />
            <DetailBlock
              icon={faMessagesQuestion}
              title="Duplicate signal"
              body={selectedItem.duplicateMatch}
            />
            <DetailBlock
              icon={selectedItem.aiRead === 'Sensitive' ? faTriangleExclamation : faShieldCheck}
              title="Permission and sensitivity"
              body={selectedItem.sensitivity}
            />
          </Stack>

          <Stack spacing={0.75}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 12 }} />
              <Typography sx={{ fontSize: 12.5, fontWeight: 650 }}>Saved searches used</Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {selectedItem.savedSearches.map((search) => (
                <Chip key={search} size="small" label={search} sx={{ bgcolor: 'background.defaultAlt' }} />
              ))}
            </Stack>
          </Stack>

          <Stack spacing={0.75}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
              <FontAwesomeIcon icon={faBookOpenLines} style={{ fontSize: 12 }} />
              <Typography sx={{ fontSize: 12.5, fontWeight: 650 }}>Cited content</Typography>
            </Stack>
            <Stack spacing={0.75}>
              {citationFiles.map((file) => (
                <Box
                  key={file.id}
                  component="button"
                  type="button"
                  onClick={() => onOpenFile?.(file.id)}
                  sx={{
                    appearance: 'none',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.25,
                    bgcolor: 'background.defaultAlt',
                    p: 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    textAlign: 'left',
                    color: 'text.primary',
                    cursor: onOpenFile ? 'pointer' : 'default',
                    font: 'inherit',
                    '&:hover': onOpenFile ? { bgcolor: 'action.hover' } : undefined,
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'action.focus',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <FontAwesomeIcon icon={faBookOpenLines} style={{ marginTop: 3, fontSize: 12 }} />
                  <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.45 }}>
                      {file.previewLines[0]}
                    </Typography>
                  </Stack>
                  {onOpenFile ? <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ marginTop: 3, fontSize: 11 }} /> : null}
                </Box>
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <HaloButton
              size="small"
              variant={actionState === 'routed' ? 'contained' : 'outlined'}
              startIcon={<FontAwesomeIcon icon={actionState === 'routed' ? faCheck : faRoute} />}
              onClick={() => setActionState('routed')}
              sx={{ textTransform: 'none' }}
            >
              {actionState === 'routed' ? 'Routed' : 'Route to SME'}
            </HaloButton>
            <HaloButton
              size="small"
              variant={actionState === 'ready' ? 'contained' : 'outlined'}
              startIcon={<FontAwesomeIcon icon={actionState === 'ready' ? faCheck : faShieldCheck} />}
              onClick={() => setActionState('ready')}
              sx={{ textTransform: 'none' }}
            >
              {actionState === 'ready' ? 'Marked ready' : 'Mark ready for approval'}
            </HaloButton>
            {citationFiles[0] ? (
              <HaloButton
                size="small"
                variant="text"
                endIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}
                onClick={() => onOpenFile?.(citationFiles[0].id)}
                sx={{ textTransform: 'none' }}
              >
                Open source
              </HaloButton>
            ) : null}
          </Stack>
        </Stack>

        <Stack
          spacing={1}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            p: 1.5,
            bgcolor: 'background.defaultAlt',
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 650 }}>What this is testing with the Stifel deal team</Typography>
          <Stack spacing={0.75}>
            {QA_DISCOVERY_PROMPTS.slice(0, 5).map((prompt) => (
              <Stack key={prompt} direction="row" spacing={0.75} alignItems="flex-start">
                <Box sx={{ pt: '7px', width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
                  {prompt}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Stack spacing={0.75}>
          <Typography sx={{ px: 0.5, fontSize: 12.5, fontWeight: 650, color: 'text.secondary' }}>
            Batch items
          </Typography>
          {QA_TRIAGE_ITEMS.map((item) => (
            <Stack
              key={item.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
              sx={{
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: item.id === selectedItem.id ? 'text.primary' : 'divider',
                p: 1,
                bgcolor: item.id === selectedItem.id ? 'action.selected' : 'background.paper',
              }}
            >
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.question}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                  {item.aiRead} · {item.nextStep}
                </Typography>
              </Stack>
              <Chip size="small" label={item.evidenceLabel} variant="outlined" />
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

function DetailBlock({
  icon,
  title,
  body,
}: {
  icon: IconDefinition;
  title: string;
  body: string;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Box sx={{ width: 18, pt: 0.25, color: 'text.secondary', flexShrink: 0 }}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />
      </Box>
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 650, color: 'text.primary' }}>{title}</Typography>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.55 }}>{body}</Typography>
      </Stack>
    </Stack>
  );
}

function AiReadChip({ status }: { status: QaTriageRowStatus }) {
  const palette = {
    'Suggested answer ready': { bg: jade[50], fg: jade[800] },
    Sensitive: { bg: ruby[50], fg: ruby[700] },
    'Duplicate likely': { bg: amber[50], fg: amber[800] },
    'Needs SME': { bg: tanzanite[50], fg: tanzanite[800] },
  }[status];

  return (
    <Chip
      size="small"
      label={status}
      sx={{ bgcolor: palette.bg, color: palette.fg, fontWeight: 650 }}
    />
  );
}
