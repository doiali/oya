import { TextField, Autocomplete } from '@mui/material';
import { Activity } from './apiService';
import React from 'react';

export type ActivityFormProps = {
  state: {
    name: string,
    parents: Activity[],
  },
  activities: Activity[],
  children?: React.ReactNode,
  onSubmit?: (e: React.FormEvent) => void;
  onChange(name: 'name', value: string): void,
  onChange(name: 'parents', value: Activity[]): void,
};

export default function ActivityForm({ activities, onSubmit: handleSubmit, onChange, state, children }: ActivityFormProps) {
  return (
    <form onSubmit={handleSubmit}>
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
      {children}
    </form>
  );
}
