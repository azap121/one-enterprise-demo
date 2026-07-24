import { Box, Breadcrumbs, Button, Stack, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faUpload, faFolder } from '@fortawesome/pro-light-svg-icons';
import { faAiSparkle } from '~/shared/icons/faAiSparkle';
import { faFilePdf, faFileLines, faFileExcel, faFilePowerpoint, faFileWord } from '@fortawesome/pro-duotone-svg-icons';
import type { Scenario } from '../state/types';
import StatusBadge from './StatusBadge';
import { track } from '../state/track';
import { amber, citrine } from '~/theme/halo/theme';

const FILE_ICON: Record<string, any> = {
  pdf: faFilePdf, docx: faFileWord, xlsx: faFileExcel, pptx: faFilePowerpoint,
};

interface Props {
  scenario: Scenario;
  onOpen: () => void;
}

export default function FileRoomSurface({ scenario, onOpen }: Props) {
  const root = scenario.nodes[0];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 2, fontSize: 13 }}>
        <Typography color="text.secondary">Documents</Typography>
        <Typography color="text.primary">{scenario.rootName}</Typography>
      </Breadcrumbs>

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<FontAwesomeIcon icon={faUpload} />}>Upload</Button>
        {/* Halo AI button — sparkle on start icon, no corner dot.
            Latest halo-theme pattern: compose domain icon + sparkle overlay top-left. */}
        <Button
          variant="outlined"
          startIcon={
            <Box sx={{ position: 'relative', display: 'inline-flex', width: 18, height: 18 }}>
              <FontAwesomeIcon icon={faFolder} style={{ width: 18, height: 18 }} />
              {/* Rounded paper mask cuts the folder behind the sparkle. */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -3,
                  right: -5,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesomeIcon
                  icon={faAiSparkle as unknown as IconProp}
                  style={{ width: 12, height: 12, color: amber[600] }}
                />
              </Box>
            </Box>
          }
          sx={{
            borderColor: 'warning.main',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'warning.dark',
              bgcolor: 'background.sandbox',
            },
          }}
          onClick={() => { track('enhanced_index.cta.click', { scenarioId: scenario.id }); onOpen(); }}
          aria-label="Enhanced Index (AI-powered)"
        >
          Enhanced Index
        </Button>
      </Stack>

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
        {(root?.children ?? []).map(n => {
          const icon = n.kind === 'folder' ? faFolder : (FILE_ICON[n.fileExt ?? 'pdf'] ?? faFileLines);
          return (
            <Stack key={n.id} direction="row" alignItems="center" spacing={1.5}
                   sx={{ px: 2, height: 40, borderTop: 1, borderColor: 'divider', '&:first-of-type': { borderTop: 0 } }}>
              <Box sx={{ width: 18, color: n.kind === 'folder' ? citrine[700] : 'text.secondary' }}>
                <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />
              </Box>
              <Typography sx={{ fontSize: 13, flex: 1 }}>{n.name}</Typography>
              <StatusBadge state={n.publishState} />
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
}
