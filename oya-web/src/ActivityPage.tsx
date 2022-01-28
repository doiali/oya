import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { TreeItem, TreeView } from '@mui/lab';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Activity } from './apiService';
import ActivityEditor from './ActivityEditor';
import useActivities from './useActivities';
import ActivityAdder from './ActivityAdder';

export default function ActivityPage() {
  return (
    <ActivityView />
  );
}

// type ActivityViewProps = {
//   activities?: Activity[];
// };

function ActivityView() {
  const { activities, activityMappings } = useActivities();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  const selectedIds = selected.split('-');
  const selectedActivityId = selectedIds[selectedIds.length - 1];
  const selectedActivity = activityMappings[selectedActivityId];

  const getAllNodeIds = () => {
    const ids: string[] = [];
    const getTreeIds = (activity: Activity, rendererId = '') => {
      const prefix = rendererId ? (rendererId + '-') : '';
      ids.push(prefix + activity.id);
      activity.children.forEach(a => { getTreeIds(a, prefix + activity.id); });
    };
    activities.forEach(a => { getTreeIds(a); });
    return ids;
  };

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeId: string) => {
    setSelected(nodeId);
  };

  const handleExpandClick = () => {
    setExpanded(oldExpanded => {
      return oldExpanded.length === 0 ? getAllNodeIds() : [];
    });
  };

  const filteredActivities = (
    [...activities].filter(a => a.parents.length === 0)
      .sort((a, b) => b.allChildIds.length - a.allChildIds.length)
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Box>
          <Box sx={{ mb: 1 }}>
            <Button onClick={handleExpandClick}>
              {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
            </Button>
          </Box>
          <TreeView
            expanded={expanded}
            selected={selected}
            onNodeToggle={handleToggle}
            onNodeSelect={handleSelect}
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
          >
            {filteredActivities.map((a) => (
              <ActivityTreeSingle
                type="children"
                key={a.id}
                activity={a}
              />
            ))}
          </TreeView>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            position: 'fixed',
            right: 0,
            height: '100%',
            overflowY: 'auto',
            p: 2,
            width: 600,
          }}
        >
          <Paper elevation={2} sx={{ p: 2, mt: -2 }}>
            <Typography variant='h5'>
              Create Activity
            </Typography>
            {activities && <ActivityAdder activities={activities} />}
          </Paper>
          {selectedActivity && (
            <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
              <Typography variant='h5'>
                Update Activity
              </Typography>
              <ActivityEditor
                activities={activities}
                activity={selectedActivity}
                onClose={() => setSelected('')}
              />
            </Paper>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

type ActivityTreeSingleProps = {
  activity: Activity;
  rendererId?: string;
  type?: 'children' | 'parents' | 'single';
};

function ActivityTreeSingle({ activity, rendererId = '', type = 'children' }: ActivityTreeSingleProps) {
  const prefix = rendererId ? (rendererId + '-') : '';
  return (
    <TreeItem
      nodeId={prefix + activity.id}
      label={activity.name}
    >
      {(type === 'children' || type === 'parents') && activity[type].map((c) => (
        <ActivityTreeSingle
          type={type}
          key={c.id}
          activity={c}
          rendererId={prefix + activity.id}
        />
      ))}
    </TreeItem>
  );
}
