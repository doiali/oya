import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { TreeItem, TreeView } from '@mui/lab';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import React, { memo, useMemo, useState } from 'react';
import { Activity } from './apiService';
import ActivityEditor from './ActivityEditor';
import useActivities from './useActivities';
import { ActivityAdderDialog } from './ActivityAdder';
import ActivityFilter, { ActivityFilterProps, ActivityFilters, filterActivities } from './ActivityFilter';

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

type ActivitiesTreeViewProps = {
  selected: string;
  onNodeSelect(nodeId: string): void;
};

function ActivitiesTreeView({ selected, onNodeSelect }: ActivitiesTreeViewProps) {
  const { activities } = useActivities();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [filters, setFilters] = useState(initFilters);
  const handleFiltersChange: ActivityFilterProps['onChange'] = (name, value) => {
    setFilters(p => ({ ...p, [name]: value }));
  };
  const filteredActivities = filterActivities(activities, filters);

  const allNodeIds = getAllTreeNodeIds(filteredActivities);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeId: string) => {
    onNodeSelect(nodeId);
  };

  const handleExpandClick = () => {
    setExpanded(oldExpanded => {
      const shouldExpand = oldExpanded.length === 0;
      if (!shouldExpand) onNodeSelect('');
      return shouldExpand ? allNodeIds : [];
    });
  };

  return (
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
      <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
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
