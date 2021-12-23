import AdapterJalali from '@date-io/date-fns-jalali';
import { Box } from '@mui/system';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { DateTimePicker } from '@mui/lab';
import { Autocomplete, Stack, TextField } from '@mui/material';
import React from 'react';
import { EntryUpdate, Activity } from './apiService/types';

export type IntervalFormProps = {
  state: {
    start: Date,
    end: Date,
    note: string,
    selectedEntries: EntryUpdate[],
  },
  activities: Activity[],
  children?: React.ReactNode,
  onSubmit?: (e: React.FormEvent) => void;
  onChange(name: 'start' | 'end', value: Date | null): void,
  onChange(name: 'note', value: string): void,
  onChange(name: 'selectedEntries', value: EntryUpdate[]): void,
};

export default function IntervalForm({ state, activities, onChange, children, onSubmit: handleSubmit }: IntervalFormProps) {
  return (
    <form onSubmit={handleSubmit}>
      <Box p={2}>
        <LocalizationProvider dateAdapter={AdapterJalali}>
          <Stack direction="column" spacing={2}>
            <Stack direction='row' spacing={2}>
              <DateTimePicker
                value={state.start}
                label="start"
                ampm={false}
                ampmInClock={false}
                onChange={(newValue) => onChange('start', newValue)}
                renderInput={(params) => <TextField fullWidth {...params} />}
              />
              <DateTimePicker
                value={state.end}
                ampm={false}
                ampmInClock={false}
                onChange={(newValue) => onChange('end', newValue)}
                label="end"
                renderInput={(params) => <TextField fullWidth {...params} />}
                minDateTime={state.start}
              />
            </Stack>
            {activities && (
              <Autocomplete
                multiple
                isOptionEqualToValue={(o, v) => o.activity_id === v.activity_id}
                options={activities.map((a) => ({ activity_id: a.id, activity_name: a.name }))}
                getOptionLabel={(option) => option.activity_name}
                value={state.selectedEntries}
                onChange={(_, newVal) => onChange('selectedEntries', newVal)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Activities"
                  />
                )}
              />
            )}
            <TextField
              multiline
              variant="outlined"
              name="note"
              value={state.note}
              onChange={(e) => onChange('note', e.target.value)}
              label="note"

            />
            {children}
          </Stack>
        </LocalizationProvider>
      </Box>
    </form>
  );
}
