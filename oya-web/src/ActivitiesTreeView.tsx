import { ChevronRight, ExpandMore, Remove } from '@mui/icons-material';
import { TreeItem, treeItemClasses, TreeView } from '@mui/lab';
import { alpha, Box, Button, Stack, styled } from '@mui/material';
import React, { memo, useState } from 'react';
import { Activity } from './apiService';
import useActivities from './useActivities';
import { ActivityAdderDialog } from './ActivityAdder';
import ActivityFilter, { ActivityFilterProps, ActivityFilters, filterActivities } from './ActivityFilter';

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

const ActivitiesTreeView = memo(function ActivitiesTreeView({
  selected, onNodeSelect,
}: ActivitiesTreeViewProps) {
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
    <Box>
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
          defaultEndIcon={<Remove sx={{ opacity: 0.4, width: 12 }} />}
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
});

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 5,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

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
    <StyledTreeItem
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
    </StyledTreeItem>
  );
});

export default ActivitiesTreeView;
