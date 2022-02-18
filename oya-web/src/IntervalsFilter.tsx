import {
  Autocomplete, Box, Button, Card, CardContent, CardHeader, Divider,
  Grid,
  Stack, TextField,
} from '@mui/material';
import { memo, useMemo, useState } from 'react';
import { Activity, Interval } from './apiService';
import { DatePicker } from '@mui/lab';
import useActivities from './useActivities';
import useIntervals from './useIntervals';

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
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title={(
          <Box
            sx={theme => ({
              [theme.breakpoints.up('md')]: {
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              },
            })}
          >
            <Box>
              Filter Intervals
            </Box>
            <Box fontSize="1rem">
              <b>sum:</b> {sum >= 1440 && Math.floor(sum / 1440).toString() + ' days and '} {
                Math.floor((sum % 1440) / 60).toString().padStart(2, '0') +
                ':' + Math.floor(sum % 60).toString().padStart(2, '0')
              }
            </Box>
          </Box>
        )}
      />
      <Divider />
      <CardContent component={Stack} direction="column" spacing={1}>
        <Grid container spacing={2}>
          {(['start', 'end'] as const).map((type) => (
            <Grid key={type} item xs={12} md={6}>
              <DatePicker
                disableMaskedInput
                value={state[type]}
                onChange={(newValue) => onChange(type, newValue)}
                label={type}
                renderInput={(params) => <TextField fullWidth {...params} />}
                minDate={type === 'end' ? state.start : undefined}
              />
            </Grid>
          ))}
        </Grid>
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
      </CardContent>
    </Card>
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

const getInitState = (intervals: Interval[], loaded = false) => {
  let min = new Date();
  if (loaded)
    intervals.forEach(i => { const s = new Date(i.start); if (s < min) min = s; });
  else min = new Date(0);
  const start = new Date(min);
  start.setDate(start.getDate() - 2);
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setDate(end.getDate() + 3);
  end.setHours(0, 0, 0, 0);
  return { start, end, selectedActivities: [] as Activity[] };
};

export function useIntervalsFilter() {
  const { intervals, loaded } = useIntervals({
    onLoad: (intervals) => { setState(getInitState(intervals, true)); },
  });
  const [state, setState] = useState(() => getInitState(intervals, loaded));
  const { activityMappings } = useActivities();

  const onReset = () => {
    setState(getInitState(intervals, loaded));
  };

  const onChange: IntervalsFilterProps['onChange'] = (name, value) => {
    setState(prev => ({ ...prev, [name]: value }));
  };

  const filteredIntervals = useMemo(() => intervals.filter((i) => {
    if (!loaded) return true;
    if (
      isNaN(state.end.getTime()) || isNaN(state.start.getTime()) ||
      (new Date(i.start) <= state.end && new Date(i.start) >= state.start) ||
      (new Date(i.end) <= state.end && new Date(i.end) >= state.start)
    ) {
      if (state.selectedActivities.length === 0) return true;
      if (
        i.entries.map(e => activityMappings[e.activity_id])
          .some(a => state.selectedActivities.some(b => isChildOf(b, a)))
      ) return true;
    }
    return false;
  }), [state, intervals, activityMappings, loaded]);

  const results = useMemo(() => ({
    sum: filteredIntervals.reduce((a, v) => (new Date(v.end).getTime() - new Date(v.start).getTime()) / 60000 + a, 0),
  }), [filteredIntervals]);

  return { state, onChange, filteredIntervals, results, onReset };
}
