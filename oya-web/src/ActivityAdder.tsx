import { Button } from '@mui/material';
import { Activity, createActivity } from './apiService';
import React, { useState } from 'react';
import AlertService from './AlertService';
import { mutate } from 'swr';
import ActivityForm, { ActivityFormProps } from './ActivityForm';

function useActivityCreate() {
  const [state, setState] = useState({
    name: '',
    parents: [] as Activity[],
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createActivity({
      name: state.name,
      parentIds: state.parents.map(({ id }) => id),
    }).then(() => {
      AlertService.success('activity created');
      setState({ name: '', parents: [] });
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

export default function ActivityAdder({ activities }: { activities: Activity[], }) {
  const formProps = useActivityCreate();
  return (
    <ActivityForm {...formProps} activities={activities}>
      <Button size="large" fullWidth sx={{ mt: 1 }} variant="contained" type="submit">
        create activity
      </Button>
    </ActivityForm>
  );
}
