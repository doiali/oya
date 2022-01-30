
import { alpha, Button, Paper, Typography, useTheme } from '@mui/material';
import React, { memo, useState } from 'react';
import { IntervalCreate, Entry } from './apiService/types';
import { addInterval } from './apiService';
import { mutate } from 'swr';
import AlertService from './AlertService';
import IntervalForm, { IntervalFormProps } from './IntervalForm';
import useIntervals from './useIntervals';

const now = (plus = 0) => {
  const x = new Date();
  x.setMinutes(x.getMinutes() + plus, 0, 0);
  return x;
};

export default memo(function IntervalAdder() {
  const intervalFormProps = useIntervalCreate();
  const theme = useTheme();
  return (
    <Paper component="section" sx={{ mb: 2, py: 3, backgroundColor: alpha(theme.palette.secondary.main, 0.1) }}>
      <Typography pl={2} variant='h5'>
        Create Interval
      </Typography>
      <IntervalForm {...intervalFormProps}>
        <Button disabled={intervalFormProps.state.loading} size="large" type="submit" variant="contained">
          add interval
        </Button>
      </IntervalForm>
    </Paper>
  );
});

function useIntervalCreate() {
  const { intervals } = useIntervals({
    onLoad: (intervals) => setState(p => ({
      ...p, start: intervals[0]?.end ? new Date(intervals[0]?.end) : now(-1),
    })),
  });
  const [state, setState] = useState({
    start: intervals[0]?.end ? new Date(intervals[0]?.end) : now(-1),
    end: now(),
    note: '' as string,
    selectedEntries: [] as Entry[],
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
