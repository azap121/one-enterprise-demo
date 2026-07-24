import {
  faArrowRight,
  faBookOpenLines,
  faMagnifyingGlass,
  faMessagesQuestion,
  faTriangleExclamation,
} from '@fortawesome/pro-light-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { amber, jade, moondust, ruby, tanzanite } from '~/theme/halo/theme';
import { QA_TRIAGE_ITEMS, WILLIAM_BLAIR_SOURCE_FILES, type QaTriageItem, type QaTriageRowStatus } from './qaTriageData';

interface Props {
  onOpenQaItem: (itemId: string) => void;
}

const CITATION_FILE_IDS = [
  'wb-arr-cohort-workbook',
  'wb-source-code-policy',
  'wb-open-source-register',
  'wb-dpa-summary',
] as const;

export default function QaTriageReadoutCard({ onOpenQaItem }: Props) {
  const citationFiles = CITATION_FILE_IDS.flatMap((fileId) => {
    const file = WILLIAM_BLAIR_SOURCE_FILES.find((candidate) => candidate.id === fileId);
    return file ? [file] : [];
  });

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        bgcolor: 'background.paper',
        p: 2.5,
        maxWidth: 680,
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 650, fontSize: 16 }}>
            Q&A triage batch ready
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.65 }}>
            I grouped the new buyer questions into four workstreams, found two likely duplicates, and located cited source material for three answers. One item touches restricted source-code material and should stay in review until legal approves the disclosure path.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {citationFiles.map((file) => (
            <Stack
              key={file.id}
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                minHeight: 28,
                px: 1,
                borderRadius: '999px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.defaultAlt',
                color: 'text.secondary',
              }}
            >
              <FontAwesomeIcon icon={faBookOpenLines} style={{ fontSize: 11 }} />
              <Typography sx={{ fontSize: 12, maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <SignalChip icon={faMessagesQuestion} label="4 questions triaged" tone="success" />
          <SignalChip icon={faMagnifyingGlass} label="7 saved searches used" tone="info" />
          <SignalChip icon={faTriangleExclamation} label="1 restricted answer" tone="warning" />
        </Stack>

        <Box
          role="table"
          aria-label="Q&A triage mini table"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            role="row"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.55fr) minmax(118px, 0.65fr) minmax(84px, 0.42fr) minmax(98px, 0.48fr) 28px',
              gap: 1,
              px: 1.25,
              py: 0.9,
              bgcolor: 'background.defaultAlt',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {['Buyer question', 'AI read', 'Evidence', 'Next step', ''].map((header) => (
              <Typography
                key={header || 'empty-header'}
                role="columnheader"
                sx={{ fontSize: 11.5, fontWeight: 650, color: 'text.secondary' }}
              >
                {header}
              </Typography>
            ))}
          </Box>
          {QA_TRIAGE_ITEMS.map((item) => (
            <QaMiniTableRow key={item.id} item={item} onOpen={() => onOpenQaItem(item.id)} />
          ))}
        </Box>
      </Stack>
    </Box>
  );
}

function QaMiniTableRow({ item, onOpen }: { item: QaTriageItem; onOpen: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      role="row"
      onClick={onOpen}
      sx={{
        appearance: 'none',
        width: '100%',
        border: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.55fr) minmax(118px, 0.65fr) minmax(84px, 0.42fr) minmax(98px, 0.48fr) 28px',
        gap: 1,
        px: 1.25,
        py: 1.05,
        textAlign: 'left',
        cursor: 'pointer',
        font: 'inherit',
        color: 'text.primary',
        '&:last-of-type': { borderBottom: 0 },
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'action.focus',
          outlineOffset: -2,
        },
      }}
    >
      <Stack role="cell" spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.question}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.category}
        </Typography>
      </Stack>
      <Box role="cell">
        <AiReadChip status={item.aiRead} />
      </Box>
      <Typography role="cell" sx={{ fontSize: 12.5, color: 'text.secondary', alignSelf: 'center' }}>
        {item.evidenceLabel}
      </Typography>
      <Typography role="cell" sx={{ fontSize: 12.5, color: 'text.secondary', alignSelf: 'center' }}>
        {item.nextStep}
      </Typography>
      <Box role="cell" sx={{ alignSelf: 'center', color: 'text.secondary', justifySelf: 'end' }}>
        <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />
      </Box>
    </Box>
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
      sx={{
        maxWidth: '100%',
        bgcolor: palette.bg,
        color: palette.fg,
        fontWeight: 650,
        borderRadius: 1,
        '& .MuiChip-label': {
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }}
    />
  );
}

function SignalChip({
  icon,
  label,
  tone,
}: {
  icon: IconDefinition;
  label: string;
  tone: 'success' | 'warning' | 'info';
}) {
  const palette = {
    success: { bg: jade[50], fg: jade[800] },
    warning: { bg: amber[50], fg: amber[800] },
    info: { bg: tanzanite[50], fg: tanzanite[800] },
  }[tone];

  return (
    <Chip
      size="small"
      icon={<FontAwesomeIcon icon={icon} style={{ fontSize: 11, color: moondust[600] }} />}
      label={label}
      sx={{ bgcolor: palette.bg, color: palette.fg, fontWeight: 600 }}
    />
  );
}
