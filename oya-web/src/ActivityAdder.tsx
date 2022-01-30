import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { ActivityCreate, createActivity } from './apiService';
import React, { memo, useState } from 'react';
import AlertService from './AlertService';
import { mutate } from 'swr';
import ActivityForm, { ActivityFormProps } from './ActivityForm';

const initState = {
  data: {
    name: '',
    is_suspended: false,
    parentIds: [],
    childIds: [],
  } as ActivityCreate,
  loading: false,
};

export function useActivityCreate({ onSuccess }: { onSuccess?: () => void; } = {}) {
  const [{ data, loading }, setState] = useState(initState);

  const onSubmit = (e: React.FormEvent) => {
    setState(p => ({ ...p, loading: true }));
    e.preventDefault();
    createActivity(data).then(() => {
      AlertService.success('activity created');
      setState(initState);
      mutate('/activities/');
      onSuccess?.();
    }, () => {
      setState(p => ({ ...p, loading: false }));
      AlertService.error('error creating activity');
    });
  };

  const onChange: ActivityFormProps['onChange'] = (name, value) => {
    setState((prev) => ({ ...prev, data: { ...prev.data, [name]: value } }));
  };

  return { data, loading, onChange, onSubmit };
}

export default memo(function ActivityAdder() {
  const { loading, ...rest } = useActivityCreate();
  return (
    <ActivityForm {...rest}>
      <Button disabled={loading} size="large" fullWidth sx={{ mt: 1 }} variant="contained" type="submit">
        create activity
      </Button>
    </ActivityForm>
  );
});

const ActivityAdderDialog = memo(function ActivityAdderDialog() {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    if (!loading)
      setOpen(false);
  };
  const { loading, ...rest } = useActivityCreate({ onSuccess: handleClose });
  return (
    <>
      <Button variant="contained" onClick={() => setOpen(p => !p)}>
        + New Activity
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Create a new activity
        </DialogTitle>
        <DialogContent>
          <ActivityForm {...rest}>
            <Button disabled={loading} size="large" sx={{ mt: 1 }} variant="contained" type="submit">
              save
            </Button>
            <Button disabled={loading} size="large" sx={{ mt: 1, ml: 1 }} onClick={handleClose}>
              cancel
            </Button>
          </ActivityForm>
        </DialogContent>
      </Dialog>
    </>
  );
});

export { ActivityAdderDialog };
