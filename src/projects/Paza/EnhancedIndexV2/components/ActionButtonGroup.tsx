import { IconButton, Stack, Tooltip } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faFolderPlus,
  faTrash,
  faRotateLeft,
} from '@fortawesome/pro-light-svg-icons';
import { moondust, peridot } from '~/theme/halo/theme';

interface Props {
  nodeName: string;
  canDelete: boolean;
  removed?: boolean;
  onEdit: () => void;
  onAddFolder: () => void;
  onDeleteOrRestore: () => void;
}

export default function ActionButtonGroup({
  nodeName,
  canDelete,
  removed,
  onEdit,
  onAddFolder,
  onDeleteOrRestore,
}: Props) {
  return (
    <Stack
      className="row-actions"
      direction="row"
      spacing={0.25}
      sx={{
        opacity: 0,
        transition: 'opacity 0.2s ease-in-out',
        minWidth: 92,
        flexShrink: 0,
        justifyContent: 'flex-start',
        '.row:hover &, .row:focus-within &': { opacity: 1 },
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {!removed && (
        <>
          <Tooltip title="Rename">
            <IconButton
              size="small"
              aria-label={`Rename ${nodeName}`}
              onClick={onEdit}
              sx={{ p: 0.5 }}
            >
              <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 12, color: moondust[500] }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add folder">
            <IconButton
              size="small"
              aria-label={`Add folder near ${nodeName}`}
              onClick={onAddFolder}
              sx={{ p: 0.5 }}
            >
              <FontAwesomeIcon icon={faFolderPlus} style={{ fontSize: 12, color: moondust[500] }} />
            </IconButton>
          </Tooltip>
        </>
      )}
      {(removed || canDelete) && (
        <Tooltip title={removed ? 'Restore' : 'Delete empty folder'}>
          <IconButton
            size="small"
            aria-label={removed ? `Restore ${nodeName}` : `Delete ${nodeName}`}
            onClick={onDeleteOrRestore}
            sx={{ p: 0.5 }}
          >
            <FontAwesomeIcon
              icon={removed ? faRotateLeft : faTrash}
              style={{ fontSize: 12, color: removed ? peridot[600] : moondust[500] }}
            />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}
