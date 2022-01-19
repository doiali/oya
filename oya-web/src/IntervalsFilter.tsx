import { Autocomplete, Box, Button, emphasize, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';
import { memo, useMemo } from 'react';
import { Activity, Interval } from './apiService';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { DateTimePicker } from '@mui/lab';
import AdapterJalali from '@date-io/date-fns-jalali';
import useDelayedState from './useDelayedState';
import useActivities from './useActivities';

type IntervalsFilterProps = {
  // intervals: Interval[],
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
  onReset(): void,
};

export default memo(function IntervalsFilter({
  state, results: { sum }, onChange, onReset: handleReset,
}: IntervalsFilterProps) {
  const { activities } = useActivities();
  const theme = useTheme();
  return (
    <Paper sx={{ p: 2, mb: 2, backgroundColor: emphasize(theme.palette.background.paper, 0.1) }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">
          Filter Intervals
        </Typography>
        <Box>
          <b>sum:</b> {sum >= 1440 && Math.floor(sum / 1440).toString() + ' days and '} {
            Math.floor((sum % 1440) / 60).toString().padStart(2, '0') +
            ':' + Math.floor(sum % 60).toString().padStart(2, '0')
          }
        </Box>
      </Box>
      <LocalizationProvider dateAdapter={AdapterJalali}>
        <Stack direction="column" spacing={1}>
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
                  label="activities"
                />
              )}
            />
          )}
          <div>
            <Button onClick={handleReset}>
              reset filters
            </Button>
          </div>
        </Stack>
      </LocalizationProvider>
    </Paper>
  );
});

/**
 * checks if a is b or a child of b
 * @param a child activity
 * @param b parent activity
 */
export const isChildOf = (a: Activity | undefined, b: Activity | undefined): boolean => {
  if (!a || !b) return false;
  return b.allParentIds.includes(a.id);
};

type useIntervalsFilterProps = {
  intervals: Interval[],
};

export function useIntervalsFilter({ intervals }: useIntervalsFilterProps) {
  const initState = useMemo(() => {
    let min = new Date().toISOString();
    intervals.forEach(i => { if (i.start < min) min = i.start; });
    const start = new Date(min);
    start.setDate(start.getDate() - 2);
    const end = new Date();
    end.setDate(end.getDate() + 2);
    return { start, end, selectedActivities: [] as Activity[] };
  }, [intervals]);
  const [state, setState, delayedSate] = useDelayedState(initState);
  const { activityMappings } = useActivities();

  const onReset = () => {
    setState(initState);
  };

  const onChange: IntervalsFilterProps['onChange'] = (name, value) => {
    setState(prev => ({ ...prev, [name]: value }));
  };

  const filteredIntervals = useMemo(() => {
    const timeFiltered = intervals.filter(i => (
      (new Date(i.start) <= delayedSate.end && new Date(i.start) >= delayedSate.start) ||
      (new Date(i.end) <= delayedSate.end && new Date(i.end) >= delayedSate.start)
    ));
    if (delayedSate.selectedActivities.length === 0) return timeFiltered;
    return timeFiltered.filter(i => (
      i.entries.map(e => activityMappings[e.activity_id])
        .some(a => delayedSate.selectedActivities.some(b => isChildOf(a, b)))
    ));
  }, [delayedSate, intervals]);

  const results = useMemo(() => ({
    sum: filteredIntervals.reduce((a, v) => (new Date(v.end).getTime() - new Date(v.start).getTime()) / 60000 + a, 0),
  }), [filteredIntervals]);

  return { state, onChange, filteredIntervals, results, onReset };
}
