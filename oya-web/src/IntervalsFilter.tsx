import { Autocomplete, Box, Button, Collapse, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Activity, Interval } from './apiService';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { DateTimePicker } from '@mui/lab';
import AdapterJalali from '@date-io/date-fns-jalali';

type IntervalsFilterProps = {
  // intervals: Interval[],
  activities: Activity[],
  // filteredIntervals: Interval[],
  state: {
    selectedActivities: Activity[],
    start: Date,
    end: Date,
  },
  results: {
    sum: number,
    // occurance: number,
    // avgPerDay: number,
    // days: number,
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

/**
 * checks if a is b or a child of b
 * @param a child activity
 * @param b parent activity
 */
export const isChildOf = (a: Activity, b: Activity): boolean => {
  if (a.id === b.id) return true;
  return a.parents.some(p => isChildOf(p, b));
};

type useIntervalsFilterProps = {
  intervals: Interval[],
  // activities: Activity[],
};

export function useIntervalsFilter({ intervals }: useIntervalsFilterProps) {
  const [state, setState] = useState(() => {
    let min = new Date().toISOString();
    intervals.forEach(i => {
      if (i.start < min) min = i.start;
    });
    return {
      start: new Date(min),
      end: intervals[0]?.end ? new Date(intervals[0].end) : new Date(),
      selectedActivities: [] as Activity[],
    };
  });

  const onChange: IntervalsFilterProps['onChange'] = (name, value) => {
    setState(prev => ({ ...prev, [name]: value }));
  };

  const filteredIntervals = useMemo(() => {
    const timeFiltered = intervals.filter(i => ((i.start >= state.start.toISOString() || i.end <= state.end.toISOString())));
    if (state.selectedActivities.length === 0) return timeFiltered;
    return timeFiltered.filter(i => (
      i.entries.map(e => e.activity).some(a => state.selectedActivities.some(b => isChildOf(a, b)))
    ));
  }, [state, intervals]);

  const results = useMemo(() => ({
    sum: filteredIntervals.reduce((a, v) => (new Date(v.start).getTime() - new Date(v.end).getTime()) / 60000 + a, 0),
  }), [filteredIntervals]);

  return { state, onChange, filteredIntervals, results };
}
