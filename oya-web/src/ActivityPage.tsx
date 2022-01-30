import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { TreeItem, TreeView } from '@mui/lab';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import React, { memo, useMemo, useState } from 'react';
import { Activity } from './apiService';
import ActivityEditor from './ActivityEditor';
import useActivities from './useActivities';
import { ActivityAdderDialog } from './ActivityAdder';
import { DrawerHeader } from './Layout';
import ActivityFilter, { ActivityFilterProps, ActivityFilters, filterActivities } from './ActivityFilter';

export default function ActivityPage() {
  return (
    <ActivitiesTreeView />
  );
}

const getAllTreeNodeIds = (activities: Activity[]) => {
  const ids: string[] = [];
  const getTreeIds = (activity: Activity, rendererId = '') => {
    const prefix = rendererId ? (rendererId + '-') : '';
    ids.push(prefix + activity.id);
    activity.children.forEach(a => { getTreeIds(a, prefix + activity.id); });
  };
  activities.forEach(a => { getTreeIds(a); });
  return ids;
};

const initFilters: ActivityFilters = {
  searchVal: '',
  treeView: true,
  hideSubActivities: true,
  orderBychildrenLength: true,
  order: 'name',
  orderType: 'asc',
};

function ActivitiesTreeView() {
  const { activities, activityMappings } = useActivities();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [filters, setFilters] = useState(initFilters);
  const handleFiltersChange: ActivityFilterProps['onChange'] = (name, value) => {
    setFilters(p => ({ ...p, [name]: value }));
  };
  const filteredActivities = filterActivities(activities, filters);
  const selectedActivity = useMemo(() => {
    const selectedIds = selected.split('-');
    const selectedActivityId = selectedIds[selectedIds.length - 1];
    return activityMappings[selectedActivityId];
  }, [selected, activityMappings]);

  const allNodeIds = getAllTreeNodeIds(filteredActivities);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeId: string) => {
    setSelected(nodeId);
  };

  const handleExpandClick = () => {
    setExpanded(oldExpanded => {
      const shouldExpand = oldExpanded.length === 0;
      if (!shouldExpand) setSelected('');
      return shouldExpand ? allNodeIds : [];
    });
  };

  return (
    <>
      <Box width={400}>
        <ActivityFilter
          value={filters}
          onChange={handleFiltersChange}
        />
        <Stack sx={{ mb: 1 }} direction="row" spacing={1}>
          <Button onClick={handleExpandClick}>
            {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
          </Button>
          <ActivityAdderDialog />
        </Stack>
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
              type={filters.treeView ? 'children' : 'single'}
              key={a.id}
              activity={a}
            />
          ))}
        </TreeView>
      </Box>
      <ActivityFixedActionPanel
        activity={selectedActivity}
        onClose={() => setSelected('')}
      />
    </>
  );
}

type ActivityFixedActionPanelProps = {
  activity: Activity | undefined,
  onClose: () => void,
};

function ActivityFixedActionPanel({ activity, onClose }: ActivityFixedActionPanelProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        overflowY: 'auto',
        p: 2,
        width: 500,
      }}
    >
      <DrawerHeader />
      {activity && (
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
          <Typography variant='h5'>
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

type ActivityTreeSingleProps = {
  activity: Activity;
  parentNodeId?: string;
  type?: 'children' | 'parents' | 'single';
};

const ActivityTreeSingle = memo(function ActivityTreeSingle({
  activity, parentNodeId = '', type = 'children',
}: ActivityTreeSingleProps) {
  const prefix = parentNodeId ? (parentNodeId + '-') : '';
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
          parentNodeId={prefix + activity.id}
        />
      ))}
    </TreeItem>
  );
});
