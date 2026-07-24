import { useState, useEffect, useRef } from 'react';
import { InputBase, IconButton, Stack, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/pro-light-svg-icons';
import { moondust, peridot } from '~/theme/halo/theme';

interface Props {
  value: string;
  editing: boolean;
  onCommit: (next: string) => void;
  onCancel: () => void;
  placeholder?: string;
  ariaLabel: string;
}

export default function EditableField({ value, editing, onCommit, onCancel, placeholder, ariaLabel }: Props) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      // select-all on open for fast overwrite
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, value]);

  if (!editing) {
    return (
      <Typography
        sx={{
          fontSize: 14,
          minWidth: 0,
          flexShrink: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </Typography>
    );
  }

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      onCancel();
      return;
    }
    onCommit(trimmed);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.25}
      sx={{ minWidth: 0, flexShrink: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      <InputBase
        inputRef={inputRef}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
        }}
        onBlur={onCancel}
        inputProps={{ 'aria-label': ariaLabel }}
        sx={{
          fontSize: 14,
          px: 0.5,
          py: 0.25,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          minWidth: 120,
          flex: 1,
        }}
      />
      <IconButton
        size="small"
        aria-label="Confirm"
        onMouseDown={(e) => e.preventDefault()}
        onClick={commit}
        sx={{ p: 0.5 }}
      >
        <FontAwesomeIcon icon={faCheck} style={{ fontSize: 12, color: peridot[600] }} />
      </IconButton>
      <IconButton
        size="small"
        aria-label="Cancel"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onCancel}
        sx={{ p: 0.5 }}
      >
        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 12, color: moondust[500] }} />
      </IconButton>
    </Stack>
  );
}
