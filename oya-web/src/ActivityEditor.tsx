import { Button, IconButton, Stack } from '@mui/material';
import { Activity, ActivityCreate, deleteActivity, editActivity } from './apiService';
import React, { memo, useEffect, useMemo, useState } from 'react';
import AlertService from './AlertService';
import { mutate } from 'swr';
import ActivityForm, { ActivityFormProps } from './ActivityForm';
import { Box } from '@mui/system';
import { Delete } from '@mui/icons-material';

type ActivityEditorProps = {
  activity: Activity,
  onClose?: () => void,
};

export default memo(function ActivityEditor({ activity, onClose }: ActivityEditorProps) {
  const defaultState = useMemo<ActivityCreate>(() => ({
    name: activity.name,
    is_suspended: activity.is_suspended,
    parentIds: activity.parentIds,
    childIds: activity.childIds,
  }), [activity]);

  const [state, setState] = useState(defaultState);

  useEffect(() => {
    setState(defaultState);
  }, [defaultState]);

  const handleClose = () => {
    setState(defaultState);
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editActivity({
      id: activity.id, ...state,
    }).then(() => {
      AlertService.success('activity edited');
      mutate('/activities/');
      onClose?.();
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
    <ActivityForm state={state} onSubmit={handleSubmit} onChange={handleChange}>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row">
          <Button variant="contained" type="submit">
            save
          </Button>
          {onClose && (
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
});
