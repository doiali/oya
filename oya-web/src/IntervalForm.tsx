import AdapterJalali from '@date-io/date-fns-jalali';
import { Box } from '@mui/system';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { DateTimePicker } from '@mui/lab';
import { Autocomplete, Stack, TextField } from '@mui/material';
import React, { memo } from 'react';
import { Entry } from './apiService/types';
import MarkdownBox from './MarkdownBox';
import useActivities from './useActivities';

export type IntervalFormProps = {
  state: {
    start: Date,
    end: Date,
    note: string,
    selectedEntries: Entry[],
  },
  children?: React.ReactNode,
  onSubmit?: (e: React.FormEvent) => void;
  onChange(name: 'start' | 'end', value: Date | null): void,
  onChange(name: 'note', value: string): void,
  onChange(name: 'selectedEntries', value: Entry[]): void,
};

export default memo(function IntervalForm({ state, onChange, children, onSubmit: handleSubmit }: IntervalFormProps) {
  const { activities, activityMappings } = useActivities();
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
                options={activities.map(a => a.id)}
                getOptionLabel={(o) => activityMappings[o]?.name ?? 'unkown activity'}
                value={state.selectedEntries.map(e => e.activity_id)}
                onChange={(_, newVal) => onChange('selectedEntries', newVal.map(x => ({ activity_id: x })))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Activities"
                  />
                )}
              />
            )}
            <MarkdownBox
              name="notes"
              label="notes"
              value={state.note}
              onChange={(e) => onChange('note', e.target.value)}
            />
            {children}
          </Stack>
        </LocalizationProvider>
      </Box>
    </form>
  );
});
