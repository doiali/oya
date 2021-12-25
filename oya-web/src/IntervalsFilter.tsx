import { Autocomplete, Box, Button, Collapse, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Activity, Interval } from './apiService';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { DateTimePicker } from '@mui/lab';
import AdapterJalali from '@date-io/date-fns-jalali';

type IntervalsFilterProps = {
  intervals: Interval[],
  activities: Activity[],
  filteredIntervals: Interval[],
  state: {
    selectedActivities: Activity[],
    start: Date,
    end: Date,
  },
  results: {
    sum: number,
    occurance: number,
    avgPerDay: number,
    days: number,
  },
  onChange(name: 'start' | 'end', value: Date | null): void,
  onChange(name: 'selectedActivities', value: Activity[]): void,
};

export default function IntervalsFilter({
  activities, state, results, onChange,
}: IntervalsFilterProps) {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography>
          {Object.entries(results).map(([k, v]) => (
            <span key={k}>{k}: {v} {' '} - {' '}</span>
          ))}
        </Typography>
        <Button onClick={() => setOpen(prev => !prev)}>
          filters
        </Button>
      </Box>
      <Collapse in={open}>
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
              {activities && (
                <Autocomplete
                  fullWidth
                  multiple
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  options={activities}
                  getOptionLabel={(option) => option.name}
                  value={state.selectedActivities}
                  onChange={(_, newVal) => onChange('selectedActivities', newVal)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="dense"
                      variant="outlined"
                      label="selected activities activities"
                    />
                  )}
                />
              )}
            </Stack>
          </Stack>
        </LocalizationProvider>
      </Collapse>
    </Box>
  );
}
