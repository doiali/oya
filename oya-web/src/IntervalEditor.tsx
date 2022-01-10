
import { Button, Stack } from '@mui/material';
import React, { memo, useState } from 'react';
import { EntryUpdate, IntervalUpdate, Interval, Activity } from './apiService/types';
import { updateInterval } from './apiService';
import { mutate } from 'swr';
import AlertService from './AlertService';
import IntervalForm, { IntervalFormProps } from './IntervalForm';

type IntervalEditorProps = {
  interval: Interval,
  activities: Activity[],
  onClose?: () => void;
};

export default memo(function IntervalEditor({ interval, onClose, activities }: IntervalEditorProps) {
  const formProps = useIntervalEdit({ interval, onSuccess: onClose });
  return (
    <IntervalForm
      {...formProps}
      activities={activities}
    >
      <Stack direction="row">
        <Button disabled={formProps.state.loading} size="large" type="submit" variant="contained">
          save
        </Button>
        <Button size="large" onClick={() => onClose?.()}>
          cancel
        </Button>
      </Stack>
    </IntervalForm>
  );
});

function useIntervalEdit({ interval, onSuccess }: { interval: Interval, onSuccess?: () => void; }) {
  const [state, setState] = useState({
    start: new Date(interval.start),
    end: new Date(interval.end),
    note: (interval.note ?? '') as string,
    selectedEntries: interval.entries as EntryUpdate[],
    loading: false,
  });
  const onChange: IntervalFormProps['onChange'] = (name, value) => {
    setState((prev) => ({ ...prev, [name]: value }));
  };
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true }));
    if (state.start && state.end) {
      const data: IntervalUpdate = {
        id: interval.id,
        note: state.note,
        start: state.start?.toISOString(),
        end: state.end?.toISOString(),
        entries: state.selectedEntries,
      };
      updateInterval(data).then(() => {
        AlertService.success('interval successfuly edited');
        setState((prev) => ({ ...prev, loading: false }));
        mutate('/intervals/');
        onSuccess?.();
      }, () => {
        setState((prev) => ({ ...prev, loading: false }));
        AlertService.error('error editing interval');
      });
    }
  };

  return { state, onChange, onSubmit };
}
