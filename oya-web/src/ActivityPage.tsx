import { Box, Paper, Typography } from '@mui/material';
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
    <>
      <ActivitiesTreeView
        selected={selectedNodeId}
        onNodeSelect={handleSelect}
      />
      <ActivityActionPanel
        activity={selectedActivity}
        onClose={() => setSelectedNodeId('')}
      />
    </>
  );
}

type ActivityActionPanelProps = {
  activity: Activity | undefined,
  onClose: () => void,
};

function ActivityActionPanel({ activity, onClose }: ActivityActionPanelProps) {
  return (
    <Box sx={{ p: 2 }}>
      {activity && (
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
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
