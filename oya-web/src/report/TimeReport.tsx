import { Grid } from '@mui/material';
import { useMemo, useState } from 'react';
import useActivities from '../useActivities';
import ActivitiesTreeView from '../ActivitiesTreeView';
import ReportProvider from '../report/ReportProvider';
import ActivityPanel from '../ActivityPanel';

export default function TimeReport() {
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
        <Grid item xs={12} md={5} lg={4} sx={{ order: { xs: 2, md: 1 } }}>
          <ActivitiesTreeView
            selected={selectedNodeId}
            onNodeSelect={handleSelect}
          />
        </Grid>
        <Grid item xs={12} md={7} lg={8} sx={{ order: { xs: 1, md: 2 } }}>
          <ActivityPanel
            activity={selectedActivity}
            onClose={() => setSelectedNodeId('')}
          />
        </Grid>
      </Grid>
    </ReportProvider>
  );
}
