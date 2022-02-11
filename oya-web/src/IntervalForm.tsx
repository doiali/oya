import { DateTimePicker } from '@mui/lab';
import { Box, Autocomplete, Divider, Stack, TextField } from '@mui/material';
import React, { memo } from 'react';
import { Entry } from './apiService/types';
import MarkdownBox from './MarkdownBox';
import useActivities from './useActivities';
import { getDeltaStringOfRange, getTimeDelta } from './utils';
import IntervalEntryEditor from './IntervalEntryEditor';

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

export default memo(function IntervalForm({
  state, onChange, children, onSubmit: handleSubmit,
}: IntervalFormProps) {
  const { activities, activityMappings } = useActivities();
  const intervalDuration = getTimeDelta(state.start, state.end);
  const entriesTotalTime = state.selectedEntries.reduce(
    (a, v) => a + (v.time ?? intervalDuration * 60), 0,
  ) / 60;
  const handleAutoCompleteChange = (_: any, newVal: number[]) => {
    const newEntries = [...state.selectedEntries.filter(e => newVal.includes(e.activity_id))];
    newVal.forEach(val => {
      if (!state.selectedEntries.some(e => e.activity_id === val)) {
        newEntries.push({ activity_id: val, time: intervalDuration * 60, note: '' });
      }
    });
    onChange('selectedEntries', newEntries);
  };

  const handleEntryChange = (newEntry: Entry) => {
    const newEntries = [...state.selectedEntries];
    const i = newEntries.findIndex(e => e.activity_id === newEntry.activity_id);
    if (i > -1) newEntries[i] = newEntry;
    onChange('selectedEntries', newEntries);
  };

  const handleEntryDelete = (deletedEntry: Entry) => {
    const newEntries = [...state.selectedEntries];
    const i = newEntries.findIndex(e => e.activity_id === deletedEntry.activity_id);
    if (i > -1) newEntries.splice(i, 1);
    onChange('selectedEntries', newEntries);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box p={2}>
        <Stack direction="column" spacing={2}>
          <Stack direction='row' spacing={2}>
            <DateTimePicker
              disableMaskedInput
              value={state.start}
              label="start"
              ampm={false}
              ampmInClock={false}
              onChange={(newValue) => onChange('start', newValue)}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
            <DateTimePicker
              disableMaskedInput
              value={state.end}
              ampm={false}
              ampmInClock={false}
              onChange={(newValue) => onChange('end', newValue)}
              label="end"
              renderInput={(params) => <TextField fullWidth {...params} />}
              minDateTime={new Date(state.start.getTime() + 1)}
            />
          </Stack>
          <span>
            Interval duration: <b>{getDeltaStringOfRange(intervalDuration)}</b>
            {' '} - {' '}
            Entries total time: <b>{getDeltaStringOfRange(entriesTotalTime)}</b>
            {' '} - {' '}
            entries cover <b>{Math.round(entriesTotalTime / intervalDuration * 100)} %</b> of total time
          </span>
          {activities && (
            <Autocomplete
              multiple
              options={activities.map(a => a.id)}
              getOptionLabel={(o) => activityMappings[o]?.name ?? 'unkown activity'}
              value={state.selectedEntries.map(e => e.activity_id)}
              onChange={handleAutoCompleteChange}
              renderInput={(params) => (
                <>
                  <input hidden required={state.selectedEntries.length === 0} />
                  <TextField
                    {...params}
                    InputLabelProps={{
                      required: true,
                    }}
                    required={state.selectedEntries.length === 0}
                    variant="outlined"
                    label="Activities"
                  />
                </>
              )}
            />
          )}
          <Stack direction="column" spacing={1} divider={<Divider flexItem />}>
            {state.selectedEntries.map(e => (
              <IntervalEntryEditor
                key={e.activity_id}
                intervalDuration={intervalDuration}
                entry={e}
                onChange={handleEntryChange}
                onDelete={handleEntryDelete}
              />
            ))}
          </Stack>
          <MarkdownBox
            name="notes"
            label="notes"
            value={state.note}
            onChange={(e) => onChange('note', e.target.value)}
          />
          {children}
        </Stack>
      </Box>
    </form>
  );
});
