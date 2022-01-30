import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Activity } from './apiService';
import ActivityEditor from './ActivityEditor';
import useActivities from './useActivities';
import ActivitiesTreeView from './ActivitiesTreeView';
import { ActivityOverViewReport, useReport } from './ReportPage';

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
  );
}

type ActivityActionPanelProps = {
  activity: Activity | undefined,
  onClose: () => void,
};

function ActivityActionPanel({ activity, onClose }: ActivityActionPanelProps) {
  const { atrm } = useReport();
  if (!activity) return null;
  return (
    <Stack spacing={2}>
      <Paper elevation={2} sx={{ p: 2, minWidth: 500 }}>
        <Typography variant='h5' mb={2}>
          Update Activity
        </Typography>
        <ActivityEditor
          activity={activity}
          onClose={() => onClose()}
        />
      </Paper>
      <ActivityOverViewReport
        activity={activity}
        atrm={atrm}
      />
    </Stack>
  );
}
