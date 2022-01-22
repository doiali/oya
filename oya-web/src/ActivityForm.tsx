import { TextField, Autocomplete, Box, Checkbox, FormControlLabel } from '@mui/material';
import { Activity } from './apiService';
import React, { memo } from 'react';

export type ActivityFormProps = {
  state: {
    name: string,
    is_suspended: boolean,
    parents: Activity[],
  },
  activities: Activity[],
  children?: React.ReactNode,
  onSubmit?: (e: React.FormEvent) => void;
  onChange(name: 'name', value: string): void,
  onChange(name: 'is_suspended', value: boolean): void,
  onChange(name: 'parents', value: Activity[]): void,
};

export default memo(function ActivityForm(
  { activities, onSubmit: handleSubmit, onChange, state, children }: ActivityFormProps,
) {
  return (
    <Box mb={2} component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        margin="dense"
        required
        variant="outlined"
        label="Activity Name"
        value={state.name}
        onChange={(e) => onChange('name', e.target.value)}
      />
      {activities && (
        <Autocomplete
          fullWidth
          multiple
          isOptionEqualToValue={(o, v) => o.id === v.id}
          options={activities}
          getOptionLabel={(option) => option.name}
          value={state.parents}
          onChange={(_, newVal) => onChange('parents', newVal)}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              variant="outlined"
              label="parent activities"
            />
          )}
        />
      )}
      <FormControlLabel
        control={(
          <Checkbox
            checked={state.is_suspended}
            onChange={(e) => onChange('is_suspended', e.target.checked)}
          />
        )}
        label="is suspended"
      />
      {children}
    </Box>
  );
});
