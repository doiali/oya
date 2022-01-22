import { Button } from '@mui/material';
import { Activity, createActivity } from './apiService';
import React, { memo, useState } from 'react';
import AlertService from './AlertService';
import { mutate } from 'swr';
import ActivityForm, { ActivityFormProps } from './ActivityForm';

function useActivityCreate() {
  const [state, setState] = useState({
    name: '',
    is_suspended: false,
    parents: [] as Activity[],
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createActivity({
      name: state.name,
      is_suspended: state.is_suspended,
      parentIds: state.parents.map(({ id }) => id),
    }).then(() => {
      AlertService.success('activity created');
      setState({ name: '', is_suspended: false, parents: [] });
      mutate('/activities/');
    }, () => {
      AlertService.error('error creating activity');
    });
  };

  const onChange: ActivityFormProps['onChange'] = (name, value) => {
    setState((prev) => ({ ...prev, [name]: value }));
  };

  return { state, onChange, onSubmit };
}

export default memo(function ActivityAdder({ activities }: { activities: Activity[], }) {
  const formProps = useActivityCreate();
  return (
    <ActivityForm {...formProps} activities={activities}>
      <Button size="large" fullWidth sx={{ mt: 1 }} variant="contained" type="submit">
        create activity
      </Button>
    </ActivityForm>
  );
});
