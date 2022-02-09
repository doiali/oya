import { Box, Grid, Tab, Tabs } from '@mui/material';
import { useCallback, useMemo } from 'react';
import useActivities, { ActivityMappings } from './useActivities';
import ActivitiesTreeView from './ActivitiesTreeView';
import { ReportContext, useReport } from './report/ReportProvider';
import { Activity } from './apiService';
import { matchPath, Outlet, useLocation, useNavigate, useOutletContext, useParams, useResolvedPath } from 'react-router';
import { Link } from 'react-router-dom';
import { activityPanelRoutes } from './App';

export type ActivityContext = {
  activity?: Activity,
  onClose?: () => void,
  report: ReportContext,
};

export function useActivityContext() {
  return useOutletContext<ActivityContext>();
}

const getSelectedActivity = (id: string, am: ActivityMappings) => {
  const selectedIds = id.split('-');
  const selectedActivityId = selectedIds[selectedIds.length - 1];
  return am[selectedActivityId];
};

export default function ActivityPageLayout() {
  const { pathname: resolvedPath } = useResolvedPath('');
  const { id: nodeId = '' } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const report = useReport();
  const { activityMappings: am } = useActivities();
  const selectedActivity = useMemo(() => getSelectedActivity(nodeId, am), [nodeId, am]);

  const handleSelect = useCallback((newId: string) => {
    if (!nodeId) {
      navigate(newId);
    } else if (nodeId) {
      navigate(
        resolvedPath.slice(0, -nodeId.length) +
        (newId ? newId + pathname.slice(resolvedPath.length) : ''),
      );
    }
  }, [resolvedPath, nodeId, pathname, navigate]);

  let value: false | string = false;
  activityPanelRoutes.forEach((r) => {
    const m = matchPath(resolvedPath + '/' + r.path, pathname);
    if (m) { value = r.path; }
  });

  const context = useMemo<ActivityContext>(() => ({
    report,
    activity: selectedActivity,
    onClose: () => handleSelect(''),
  }), [report, selectedActivity, handleSelect]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5} sx={{ order: { xs: 2, md: 1 } }}>
        <ActivitiesTreeView
          selected={nodeId}
          onNodeSelect={handleSelect}
        />
      </Grid>
      <Grid item xs={12} md={7} sx={{ order: { xs: 1, md: 2 } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={nodeId ? value : false}>
            {activityPanelRoutes.map(r => (
              <Tab
                disabled={!nodeId}
                value={r.path}
                key={r.path}
                component={Link}
                to={r.path}
                label={r.label}
              />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ py: 2 }}>
          <Outlet context={context} />
        </Box>
      </Grid>
    </Grid>
  );
}
