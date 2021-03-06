
import { Button } from '@mui/material';
import React, { memo, useState } from 'react';
import { IntervalCreate, Entry } from './apiService/types';
import { addInterval } from './apiService';
import { mutate } from 'swr';
import AlertService from './AlertService';
import IntervalForm, { IntervalFormProps } from './IntervalForm';
import useIntervals from './useIntervals';
import Widget from './Widget';

const now = (plus = 0) => {
  const x = new Date();
  x.setMinutes(x.getMinutes() + plus, 0, 0);
  return x;
};

export default memo(function IntervalAdder() {
  const intervalFormProps = useIntervalCreate();
  return (
    <Widget sx={{ mb: 3 }} title="Create Interval">
      <IntervalForm {...intervalFormProps}>
        <Button disabled={intervalFormProps.state.loading} size="large" type="submit" variant="contained">
          add interval
        </Button>
      </IntervalForm>
    </Widget>
  );
});

function useIntervalCreate() {
  const { meta } = useIntervals({
    onLoad: ({ meta }) => setState(p => ({
      ...p, start: meta.max ? new Date(meta.max) : now(-1),
    })),
  });
  const [state, setState] = useState({
    start: meta?.max ? new Date(meta.max) : now(-1),
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
