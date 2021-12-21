import { Button, IconButton, Stack } from '@mui/material';
import { Activity, deleteActivity, editActivity } from './apiService';
import React, { useState } from 'react';
import AlertService from './AlertService';
import { mutate } from 'swr';
import ActivityForm, { ActivityFormProps } from './ActivityForm';
import { Box } from '@mui/system';
import { Delete } from '@mui/icons-material';

type ActivityEditorProps = {
  activities: Activity[],
  activity: Activity,
  onClose?: () => void,
};

export default function ActivityEditor({ activities, activity, onClose: handleClose }: ActivityEditorProps) {
  const [state, setState] = useState({
    name: activity.name,
    parents: activity.parents,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editActivity({
      id: activity.id,
      name: state.name,
      parentIds: state.parents.map(({ id }) => id),
    }).then(() => {
      AlertService.success('activity edited');
      mutate('/activities/');
      mutate('/intervals/');
      handleClose?.();
    }, () => {
      AlertService.error('error editing activity');
    });
  };

  const handleChange: ActivityFormProps['onChange'] = (name, value) => {
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = () => {
    deleteActivity(activity.id).then(() => {
      AlertService.success('activity ' + activity.id + ' deleted');
      mutate('/activities/');
      mutate('/intervals/');
    }, () => {
      AlertService.error('error deleting activity');
    });
  };

  return (
    <ActivityForm state={state} onSubmit={handleSubmit} onChange={handleChange} activities={activities}>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row">
          <Button variant="contained" type="submit">
            save
          </Button>
          {handleClose && (
            <Button onClick={handleClose}>
              cancel
            </Button>
          )}
        </Stack>
        <IconButton onClick={handleDelete}>
          <Delete />
        </IconButton>
      </Box>
    </ActivityForm>
  );
}
