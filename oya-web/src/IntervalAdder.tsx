
import { alpha, Button, Paper, Typography, useTheme } from '@mui/material';
import React, { memo, useState } from 'react';
import { Activity, IntervalCreate, EntryCreate, Interval } from './apiService/types';
import { addInterval } from './apiService';
import { mutate } from 'swr';
import AlertService from './AlertService';
import IntervalForm, { IntervalFormProps } from './IntervalForm';

type IntervalAdderProps = {
  intervals: Interval[],
  activities: Activity[],
};

const now = () => { const x = new Date(); x.setSeconds(0); return x; };

export default memo(function IntervalAdder({ activities, intervals }: IntervalAdderProps) {
  const intervalFormProps = useIntervalCreate({ intervals });
  const theme = useTheme();
  return (
    <Paper component="section" sx={{ mb: 2, py: 3, backgroundColor: alpha(theme.palette.secondary.main, 0.1) }}>
      <Typography pl={2} variant='h5'>
        Create Interval
      </Typography>
      <IntervalForm {...intervalFormProps} activities={activities}>
        <Button disabled={intervalFormProps.state.loading} size="large" type="submit" variant="contained">
          add interval
        </Button>
      </IntervalForm>
    </Paper>
  );
}, (prevProps, nextProps) => (
  prevProps.activities === nextProps.activities &&
  prevProps.intervals[0]?.end === nextProps.intervals[0].end
));

function useIntervalCreate({ intervals }: { intervals: Interval[]; }) {
  const [state, setState] = useState({
    start: intervals[0]?.end ? new Date(intervals[0]?.end) : now(),
    end: now(),
    note: '' as string,
    selectedEntries: [] as EntryCreate[],
    loading: false,
  });
  const onChange: IntervalFormProps['onChange'] = (name, value) => {
    setState((prev) => ({ ...prev, [name]: value }));
  };
  const onSubmit = (e: React.FormEvent) => {
    e?.preventDefault();
    if (state.start && state.end) {
      const data: IntervalCreate = {
        note: state.note,
        start: state.start?.toISOString(),
        end: state.end?.toISOString(),
        entries: state.selectedEntries,
      };
      addInterval(data).then(() => {
        AlertService.success('interval successfuly added');
        setState((prev) => ({
          start: prev.end,
          end: prev.end,
          note: '',
          selectedEntries: [],
          loading: false,
        }));
        mutate('/intervals/');
      }, () => {
        AlertService.error('error adding interval');
      });
    }
  };
  return { state, onChange, onSubmit };
}
