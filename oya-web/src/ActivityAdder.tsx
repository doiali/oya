import { Button } from '@mui/material';
import { ActivityCreate, createActivity } from './apiService';
import React, { memo, useState } from 'react';
import AlertService from './AlertService';
import { mutate } from 'swr';
import ActivityForm, { ActivityFormProps } from './ActivityForm';

const initState: ActivityCreate = {
  name: '',
  is_suspended: false,
  parentIds: [],
  childIds: [],
};

function useActivityCreate() {
  const [state, setState] = useState(initState);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createActivity(state).then(() => {
      AlertService.success('activity created');
      setState(initState);
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

export default memo(function ActivityAdder() {
  const formProps = useActivityCreate();
  return (
    <ActivityForm {...formProps}>
      <Button size="large" fullWidth sx={{ mt: 1 }} variant="contained" type="submit">
        create activity
      </Button>
    </ActivityForm>
  );
});
