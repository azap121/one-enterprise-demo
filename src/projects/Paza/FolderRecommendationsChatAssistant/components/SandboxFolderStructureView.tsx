import { faArrowLeft, faFileLines, faFolder, faFolderOpen } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { jade, moondust } from '~/theme/halo/theme';
import type { CompositedNode } from '../lib/compositeTree';
import type { WorkspaceAction, WorkspaceState } from '../state/types';
import { COPY } from '../state/copy';
import { selectCompositedTree } from '../state/reducer';

interface Props {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
}

export default function SandboxFolderStructureView({ state, dispatch }: Props) {
  const roots = selectCompositedTree(state);

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'auto', bgcolor: 'background.default', p: 3 }}>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 650 }}>
              Sandbox folder structure
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              {COPY.pathLabel}
            </Typography>
          </Stack>
          <HaloButton
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
            onClick={() => dispatch({ type: 'OPEN_REVIEW' })}
          >
            Back to assistant
          </HaloButton>
        </Stack>

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ color: jade[700] }}>
                <FontAwesomeIcon icon={faFolderOpen} />
              </Box>
              <Typography sx={{ fontWeight: 650 }}>Project Atlas / Sandbox workspace</Typography>
            </Stack>
            <Chip size="small" label="Updated" sx={{ bgcolor: jade[50], color: jade[800], fontWeight: 600 }} />
          </Stack>
          <Box sx={{ py: 1 }}>
            {roots.map((node) => (
              <StructureRow key={node.id} node={node} level={0} />
            ))}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

function StructureRow({ node, level }: { node: CompositedNode; level: number }) {
  if (node.removed || node.actionTypes?.includes('move-source')) return null;
  const label = node.proposedName ?? node.name;
  const isFolder = node.kind === 'folder';

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          minHeight: 30,
          px: 2,
          pl: 2 + level * 2,
          color: 'text.primary',
        }}
      >
        <FontAwesomeIcon
          icon={isFolder ? faFolder : faFileLines}
          style={{ color: moondust[500], fontSize: 13, width: 16 }}
        />
        <Typography sx={{ fontSize: 13, flex: 1 }}>{label}</Typography>
        {node.isProposed && <Chip size="small" label="New" sx={{ height: 20 }} />}
        {node.proposedName && <Chip size="small" label="Renamed" sx={{ height: 20 }} />}
        {node.actionTypes?.includes('move-dest') && <Chip size="small" label="Moved" sx={{ height: 20 }} />}
      </Stack>
      {node.children?.map((child) => (
        <StructureRow key={child.id} node={child} level={level + 1} />
      ))}
    </>
  );
}

