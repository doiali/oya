import { Box, Grid, Tab, Tabs } from '@mui/material';
import { useMemo, useState } from 'react';
import useActivities from './useActivities';
import ActivitiesTreeView from './ActivitiesTreeView';
import { ReportContext, useReport } from './report/ReportProvider';
import { Activity } from './apiService';
import { Outlet, useNavigate, useOutletContext, useParams, useResolvedPath } from 'react-router';
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

export default function ActivityPageLayout() {
  const resolvedPath = useResolvedPath('');
  const params = useParams();
  const navigate = useNavigate();
  const report = useReport();
  const { activityMappings } = useActivities();

  const [selectedNodeId, setSelectedNodeId] = useState<string>(params.id ?? '');

  const selectedActivity = useMemo(() => {
    const selectedIds = selectedNodeId.split('-');
    const selectedActivityId = selectedIds[selectedIds.length - 1];
    return activityMappings[selectedActivityId];
  }, [selectedNodeId, activityMappings]);

  const handleSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    if (!params.id) navigate(nodeId);
    else if (params.id && params['*']) {
      navigate(
        resolvedPath.pathname.slice(0, -params.id.length) +
        nodeId + params['*'].slice(params.id.length),
      );
    }
  };

  const context = useMemo<ActivityContext>(() => ({
    report,
    activity: selectedActivity,
    onClose: () => setSelectedNodeId(''),
  }), [report, selectedActivity]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5} sx={{ order: { xs: 2, md: 1 } }}>
        <ActivitiesTreeView
          selected={selectedNodeId}
          onNodeSelect={handleSelect}
        />
      </Grid>
      <Grid item xs={12} md={7} sx={{ order: { xs: 1, md: 2 } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={params.id ? params['*']?.slice(params.id.length + 1) : false}>
            {activityPanelRoutes.map(r => (
              <Tab
                disabled={!params.id}
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
