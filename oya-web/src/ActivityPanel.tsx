import { Paper, Stack, Typography } from '@mui/material';
import ActivityEditor from './ActivityEditor';
import ActivityOverviewReport from './report/ActivityOverviewReport';
import React from 'react';
import { useActivityContext } from './ActivityPageLayout';

export const ActivityPanelHome = () => {
  const { activity, onClose } = useActivityContext();
  return activity ? (
    <Stack spacing={2}>
      <Paper elevation={2} sx={{ p: 2, minWidth: 500 }}>
        <Typography variant='h5' mb={2}>
          Update Activity <span style={{ fontSize: '0.7em' }}>id: {activity.id}</span>
        </Typography>
        <ActivityEditor
          activity={activity}
          onClose={() => onClose?.()}
        />
      </Paper>
      <ActivityOverviewReport activity={activity} />
    </Stack>
  ) : null;
};
