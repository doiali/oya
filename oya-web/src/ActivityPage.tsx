import { Box, Grid, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Activity } from './apiService';
import ActivityEditor from './ActivityEditor';
import useActivities from './useActivities';
import ActivitiesTreeView from './ActivitiesTreeView';
import ReportProvider from './report/ReportProvider';
import ActivityOverviewReport from './report/ActivityOverviewReport';
import { Route, Routes, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import TimeRe from './report/TimeRe';

export default function ActivityPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const { activityMappings } = useActivities();
  const selectedActivity = useMemo(() => {
    const selectedIds = selectedNodeId.split('-');
    const selectedActivityId = selectedIds[selectedIds.length - 1];
    return activityMappings[selectedActivityId];
  }, [selectedNodeId, activityMappings]);
  const handleSelect = (nodeId: string) => { setSelectedNodeId(nodeId); };
  return (
    <ReportProvider>
      <Grid container spacing={2}>
        <Grid item xs={12} md={5} sx={{ order: { xs: 2, md: 1 } }}>
          <ActivitiesTreeView
            selected={selectedNodeId}
            onNodeSelect={handleSelect}
          />
        </Grid>
        <Grid item xs={12} md={7} sx={{ order: { xs: 1, md: 2 } }}>
          <ActivityActionPanel
            activity={selectedActivity}
            onClose={() => setSelectedNodeId('')}
          />
        </Grid>
      </Grid>
    </ReportProvider>
  );
}

type ActivityActionPanelProps = {
  activity: Activity | undefined,
  onClose: () => void,
};

const ActivityActionPanelHome = ({ activity, onClose }: ActivityActionPanelProps) => activity ? (
  <Stack spacing={2}>
    <Paper elevation={2} sx={{ p: 2, minWidth: 500 }}>
      <Typography variant='h5' mb={2}>
        Update Activity <span style={{ fontSize: '0.7em' }}>id: {activity.id}</span>
      </Typography>
      <ActivityEditor
        activity={activity}
        onClose={() => onClose()}
      />
    </Paper>
    <ActivityOverviewReport activity={activity} />
  </Stack>
) : null;

const PanelRoutes = [
  {
    link: 'overview',
    label: 'overview',
    element: ActivityActionPanelHome,
  },
  {
    link: 'time',
    label: 'time chart',
    element: TimeRe,
  },
];

function ActivityActionPanel({ activity, onClose }: ActivityActionPanelProps) {
  const loc = useLocation();
  const paths = loc.pathname.split('/');
  const path = paths[paths.length - 1];
  const allowed = PanelRoutes.map(r => r.link);

  const current = allowed.indexOf(path);
  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={current === -1 ? 0 : current}>
          {PanelRoutes.map(r => (
            <Tab key={r.link} component={Link} to={r.link} label={r.label} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ py: 2 }}>
        <Routes>
          {PanelRoutes.map(({ link, element: C }) => (
            <Route key={link} path={link} element={<C {...{ activity, onClose }} />} />
          ))}
          <Route path="*" element={<ActivityActionPanelHome {...{ activity, onClose }} />} />
        </Routes>
      </Box>
    </>
  );
}
