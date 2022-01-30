import { Button, Dialog, DialogContent, DialogTitle, IconButton, Stack } from '@mui/material';
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

const ActivityEditor = memo(function ActivityEditor({ activity, onClose }: ActivityEditorProps) {
  const defaultData = useMemo<ActivityCreate>(() => ({
    name: activity.name,
    is_suspended: activity.is_suspended,
    parentIds: activity.parentIds,
    childIds: activity.childIds,
  }), [activity]);

  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(defaultData);
  }, [defaultData]);

  const handleClose = () => {
    setData(defaultData);
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    editActivity({
      id: activity.id, ...data,
    }).then(() => {
      AlertService.success('activity edited');
      mutate('/activities/');
      setLoading(false);
      onClose?.();
    }, () => {
      setLoading(false);
      AlertService.error('error editing activity');
    });
  };

  const handleChange: ActivityFormProps['onChange'] = (name, value) => {
    setData((prev) => ({ ...prev, [name]: value }));
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
    <ActivityForm data={data} onSubmit={handleSubmit} onChange={handleChange}>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row">
          <Button disabled={loading} variant="contained" type="submit">
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

export const ActivityEditorDialog = memo(
  function ActivityEditorDialog({ activity, onClose }: ActivityEditorProps) {
    const [open, setOpen] = useState(false);
    const handleClose = () => {
      setOpen(false);
      onClose?.();
    };
    return (
      <>
        <Button variant="contained" onClick={() => setOpen(p => !p)}>
          Edit Activity
        </Button>
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Edit Activity - {activity.id}
          </DialogTitle>
          <DialogContent>
            <ActivityEditor
              activity={activity}
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

export default ActivityEditor;
