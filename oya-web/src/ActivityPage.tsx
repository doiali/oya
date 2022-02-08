import { Grid } from '@mui/material';
import { useMemo, useState } from 'react';
import useActivities from './useActivities';
import ActivitiesTreeView from './ActivitiesTreeView';
import { ReportContext, useReport } from './report/ReportProvider';
import { ActivityPanelLayout } from './ActivityPanel';
import { Activity } from './apiService';
import { useOutletContext } from 'react-router';

export type ActivityContext = {
  activity?: Activity,
  onClose?: () => void,
  report: ReportContext,
};

export function useActivityContext() {
  return useOutletContext<ActivityContext>();
}

export default function ActivityPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const report = useReport();
  const { activityMappings } = useActivities();
  const selectedActivity = useMemo(() => {
    const selectedIds = selectedNodeId.split('-');
    const selectedActivityId = selectedIds[selectedIds.length - 1];
    return activityMappings[selectedActivityId];
  }, [selectedNodeId, activityMappings]);
  const handleSelect = (nodeId: string) => { setSelectedNodeId(nodeId); };
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5} sx={{ order: { xs: 2, md: 1 } }}>
        <ActivitiesTreeView
          selected={selectedNodeId}
          onNodeSelect={handleSelect}
        />
      </Grid>
      <Grid item xs={12} md={7} sx={{ order: { xs: 1, md: 2 } }}>
        <ActivityPanelLayout
          activity={selectedActivity}
          onClose={() => setSelectedNodeId('')}
          report={report}
        />
      </Grid>
    </Grid>
  );
}
