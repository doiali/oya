import { Box, Grid, Paper, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Activity } from './apiService';
import ActivityEditor from './ActivityEditor';
import useActivities from './useActivities';
import ActivitiesTreeView from './ActivitiesTreeView';

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
  return (
    <Box>
      {activity && (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant='h5' mb={2}>
            Update Activity
          </Typography>
          <ActivityEditor
            activity={activity}
            onClose={() => onClose()}
          />
        </Paper>
      )}
    </Box>
  );
}
