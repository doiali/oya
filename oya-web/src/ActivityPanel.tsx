import { Box, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import ActivityEditor from './ActivityEditor';
import ActivityOverviewReport from './report/ActivityOverviewReport';
import { Outlet, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import React from 'react';
import { ActivityContext, useActivityContext } from './ActivityPageLayout';
import { activityPanelRoutes } from './App';

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

export function ActivityPanelLayout(props: ActivityContext) {
  const loc = useLocation();
  const paths = loc.pathname.split('/');
  const path = paths[paths.length - 1];
  const allowed = activityPanelRoutes.map(r => r.path);

  const current = allowed.indexOf(path);
  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={current === -1 ? 0 : current}>
          {activityPanelRoutes.map(r => (
            <Tab key={r.path} component={Link} to={r.path} label={r.label} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ py: 2 }}>
        <Outlet context={props} />
      </Box>
    </>
  );
}
