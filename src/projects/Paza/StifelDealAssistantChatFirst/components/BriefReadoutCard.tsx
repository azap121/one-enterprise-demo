import { useState } from 'react';
import {
  faArrowTrendUp,
  faCheck,
  faCopy,
  faFileLines,
  faHourglassHalf,
  faTriangleExclamation,
} from '@fortawesome/pro-light-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { amber, jade, moondust, ruby } from '~/theme/halo/theme';
import {
  BRIEF_COPY,
  BRIEF_SECTIONS,
  BRIEF_SOURCE_FILES,
  briefPlainText,
  type BriefSection,
} from '../state/briefScenario';

interface Props {
  onOpenCitation: (fileId: string) => void;
}

const TONE_STYLES: Record<BriefSection['tone'], { icon: IconDefinition; color: string; bg: string }> = {
  moved: { icon: faArrowTrendUp, color: jade[800], bg: jade[50] },
  stuck: { icon: faHourglassHalf, color: amber[800], bg: amber[50] },
  risk: { icon: faTriangleExclamation, color: ruby[800], bg: ruby[50] },
};

export default function BriefReadoutCard({ onOpenCitation }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(briefPlainText()).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    });
  };

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
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 650, fontSize: 16 }}>
            {BRIEF_COPY.readoutTitle}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.55 }}>
            {BRIEF_COPY.readoutSummary}
          </Typography>
        </Stack>

        {BRIEF_SECTIONS.map((section) => {
          const tone = TONE_STYLES[section.tone];
          return (
            <Stack key={section.id} spacing={1}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: tone.bg,
                    color: tone.color,
                    flexShrink: 0,
                  }}
                >
                  <FontAwesomeIcon icon={tone.icon} style={{ fontSize: 11 }} />
                </Box>
                <Typography
                  sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}
                >
                  {section.label}
                </Typography>
              </Stack>

              <Stack spacing={1} sx={{ pl: 0.25 }}>
                {section.rows.map((row) => (
                  <Box
                    key={row.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1.1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Stack spacing={0.9}>
                      <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.primary' }}>
                        {row.text}
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {row.citationFileIds.map((fileId) => {
                          const file = BRIEF_SOURCE_FILES.find((candidate) => candidate.id === fileId);
                          if (!file) return null;
                          return (
                            <Stack
                              key={fileId}
                              component="button"
                              type="button"
                              onClick={() => onOpenCitation(fileId)}
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              sx={{
                                appearance: 'none',
                                minHeight: 26,
                                px: 0.9,
                                borderRadius: '999px',
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.defaultAlt',
                                color: 'text.secondary',
                                cursor: 'pointer',
                                '&:hover': { borderColor: 'text.secondary', color: 'text.primary' },
                              }}
                              aria-label={`View source: ${file.name}`}
                            >
                              <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 11 }} />
                              <Typography sx={{ fontSize: 12, maxWidth: 230, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {file.name}
                              </Typography>
                              <Typography sx={{ fontSize: 10.5, color: moondust[500], whiteSpace: 'nowrap' }}>
                                view
                              </Typography>
                            </Stack>
                          );
                        })}
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>
          );
        })}

        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic' }}>
            {BRIEF_COPY.readoutFootnote}
          </Typography>
          <HaloButton
            variant="outlined"
            size="small"
            startIcon={<FontAwesomeIcon icon={copied ? faCheck : faCopy} />}
            onClick={handleCopy}
            sx={{ textTransform: 'none', flexShrink: 0 }}
          >
            {copied ? BRIEF_COPY.copiedCta : BRIEF_COPY.copyCta}
          </HaloButton>
        </Stack>
      </Stack>
    </Box>
  );
}
