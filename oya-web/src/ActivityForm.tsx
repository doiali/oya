import { TextField, Autocomplete, Box, Checkbox, FormControlLabel, FormControl } from '@mui/material';
import { ActivityCreate } from './apiService';
import React, { memo } from 'react';
import useActivities from './useActivities';

export type ActivityFormProps = {
  data: ActivityCreate,
  children?: React.ReactNode,
  onSubmit?: (e: React.FormEvent) => void;
  onChange<T extends keyof ActivityCreate>(name: T, value: ActivityCreate[T]): void;
};

export default memo(function ActivityForm(
  { onSubmit: handleSubmit, onChange, data, children }: ActivityFormProps,
) {
  const { activities, activityMap } = useActivities();
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        sx={{ mb: 0.5 }}
        required
        variant="outlined"
        label="Activity Name"
        value={data.name}
        onChange={(e) => onChange('name', e.target.value)}
      />
      {(['parentIds', 'childIds'] as const).map((l) => (
        <Autocomplete
          key={l}
          fullWidth
          multiple
          options={activities.map(a => a.id)}
          getOptionLabel={(option) => activityMap.get(option)?.name ?? 'unknown activity...'}
          value={data[l]}
          onChange={(_, newVal) => onChange(l, newVal)}
          renderInput={(params) => (
            <TextField
              margin="dense"
              {...params}
              variant="outlined"
              label={l === 'parentIds' ? 'parent activities' : 'child activities'}
            />
          )}
        />
      ))}
      <FormControl fullWidth>
        <FormControlLabel
          control={(
            <Checkbox
              checked={data.is_suspended}
              onChange={(e) => onChange('is_suspended', e.target.checked)}
            />
          )}
          label="is suspended"
        />
      </FormControl>
      {children}
    </Box>
  );
});
