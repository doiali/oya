
import { Button } from '@mui/material';
import React, { useState } from 'react';
import { Activity, IntervalCreate, EntryCreate, Interval } from './apiService/types';
import { addInterval } from './apiService';
import { mutate } from 'swr';
import AlertService from './AlertService';
import IntervalForm, { IntervalFormProps } from './IntervalForm';

type IntervalAdderProps = {
  intervals: Interval[],
  activities: Activity[],
};

export default function IntervalAdder({ activities, intervals }: IntervalAdderProps) {
  const intervalFormProps = useIntervalCreate({ intervals });
  return (
    <IntervalForm {...intervalFormProps} activities={activities}>
      <Button disabled={intervalFormProps.state.loading} size="large" type="submit" variant="contained">
        submit
      </Button>
    </IntervalForm>
  );
}

function useIntervalCreate({ intervals }: { intervals: Interval[]; }) {
  const [state, setState] = useState({
    start: new Date(intervals[0].end),
    end: new Date(),
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
