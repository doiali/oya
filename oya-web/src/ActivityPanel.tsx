import { Box, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import ActivityEditor from './ActivityEditor';
import ActivityOverviewReport from './report/ActivityOverviewReport';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import TimeRe from './report/TimeRe';
import React from 'react';
import ActivityPage, { ActivityContext, useActivityContext } from './ActivityPage';

const ActivityPanelHome = () => {
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

export const ActivityPanelRoutes: { link: string; label: string, element: React.ReactElement; }[] = [
  {
    link: 'overview',
    label: 'overview',
    element: <ActivityPanelHome />,
  },
  {
    link: 'time',
    label: 'time chart',
    element: <TimeRe />,
  },
];

export function ActivityPanelLayout(props: ActivityContext) {
  const loc = useLocation();
  const paths = loc.pathname.split('/');
  const path = paths[paths.length - 1];
  const allowed = ActivityPanelRoutes.map(r => r.link);

  const current = allowed.indexOf(path);
  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={current === -1 ? 0 : current}>
          {ActivityPanelRoutes.map(r => (
            <Tab key={r.link} component={Link} to={r.link} label={r.label} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ py: 2 }}>
        <Outlet context={props} />
      </Box>
    </>
  );
}

export function ActivityPanelRouter() {
  return (
    <Routes>
      <Route path="/" element={<ActivityPage />}>
        {ActivityPanelRoutes.map(({ link, element }) => (
          <Route key={link} path={link} element={element} />
        ))}
        <Route index element={<ActivityPanelHome />} />
        <Route path="*" element="not found" />
      </Route>
    </Routes>
  );
}
