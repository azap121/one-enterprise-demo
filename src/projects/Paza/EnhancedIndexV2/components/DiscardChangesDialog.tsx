import { Button, DialogContentText } from '@mui/material';
import { HaloDialog } from '~/theme/halo/components';

interface Props {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export default function DiscardChangesDialog({ open, onKeepEditing, onDiscard }: Props) {
  return (
    <HaloDialog
      open={open}
      onClose={onKeepEditing}
      title="Discard changes?"
      variant="caution"
      actions={
        <>
          <Button onClick={onKeepEditing}>Keep editing</Button>
          <Button color="error" variant="contained" onClick={onDiscard} autoFocus>
            Discard changes
          </Button>
        </>
      }
    >
        <DialogContentText>
          You have unsaved changes to Enhanced Index. Discarding will lose your accepted suggestions and any pending moves.
        </DialogContentText>
    </HaloDialog>
  );
}
