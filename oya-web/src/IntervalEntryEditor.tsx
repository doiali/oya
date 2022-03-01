import { Chip, IconButton, Stack, TextField, Box } from '@mui/material';
import { memo } from 'react';
import { Entry } from './apiService/types';
import useActivities from './useActivities';
import { Delete } from '@mui/icons-material';

type EntryEditorProps = {
  entry: Entry,
  intervalDuration: number,
  onChange(e: Entry): void,
  onDelete(e: Entry): void,
};

export default memo(function EntryEditor({
  entry, intervalDuration, onChange, onDelete,
}: EntryEditorProps) {
  const { activityMap } = useActivities();
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ minWidth: '25%' }}>
        <Chip label={activityMap.get(entry.activity_id)?.name} />
        <span>{' '}:{' '}</span>
      </Box>
      <TextField
        variant="standard"
        required
        sx={{ minWidth: 170 }}
        inputProps={{
          min: 0,
          max: intervalDuration,
        }}
        value={entry.time ? entry.time / 60 : ''}
        type="number"
        label="spent time (minutes)"
        onChange={e => onChange({ ...entry, time: Math.round(Number(e.target.value)) * 60 })}
      />
      <TextField
        inputProps={{
          min: 0,
          max: 100,
          maxLength: 5,
        }}
        sx={{ maxWidth: 100 }}
        disabled
        variant="standard"
        value={entry.time ? Math.round(entry.time / 60 / intervalDuration * 100 * 100) / 100 : ''}
        type="number"
        label="%"
        onChange={e => onChange({
          ...entry,
          time: (Number(e.target.value) / 100 * intervalDuration) * 60,
        })}
      />
      <TextField
        sx={{ flexGrow: 1 }}
        variant="standard"
        value={entry.note ?? ''}
        type="text"
        label="note"
        onChange={e => onChange({ ...entry, note: e.target.value })}
      />
      <IconButton sx={{ flexShrink: 0 }} onClick={() => onDelete(entry)}>
        <Delete />
      </IconButton>
    </Stack>
  );
});
