import { ChevronRight, ExpandMore, Search } from '@mui/icons-material';
import { TreeItem, TreeView } from '@mui/lab';
import { Box, Button, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Activity } from './apiService';
import ActivityEditor from './ActivityEditor';
import useActivities from './useActivities';
import { ActivityAdderDialog } from './ActivityAdder';
import { DrawerHeader } from './Layout';

export default function ActivityPage() {
  return (
    <ActivitiesTreeView />
  );
}

// type ActivityViewProps = {
//   activities?: Activity[];
// };

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

function ActivitiesTreeView() {
  const { activityMappings } = useActivities();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [filters, setFilters] = useState(initFilters);
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
          onChange={(a, f) => {
            setFilteredActivities(a);
            setFilters(f);
          }}
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

const initFilters = {
  searchVal: '',
  treeView: true,
  hideSubActivities: true,
  orderBychildrenLength: true,
  order: 'name' as 'id' | 'name',
  orderType: 'asc' as 'desc' | 'asc',
};

type ActivityFilters = typeof initFilters;

const filterActivities = (activities: Activity[], filters: ActivityFilters): Activity[] => {
  const { searchVal, treeView, hideSubActivities, order, orderType, orderBychildrenLength } = filters;
  const matches = (a: Activity) => a.name.trim().toLowerCase().includes(searchVal.toLowerCase().trim());
  const fA = [...activities].filter(a => {
    if (treeView && hideSubActivities && a.parents.length > 0) return false;
    if (!searchVal) return true;
    if (treeView) {
      if (
        a.allChildren.some(matches) ||
        (!hideSubActivities && a.allParents.some(matches))
      ) return true;
    } else {
      if (a.allParents.some(matches)) return true;
    }
    return false;
  });
  // if (treeView && hideSubActivities) fA = fA.filter(a => a.parents.length === 0);
  // if (searchVal) {
  //   const matches = (a: Activity) => a.name.trim().toLowerCase().includes(searchVal.toLowerCase().trim());
  //   if (treeView) {
  //     fA = fA.filter(a => (
  //       a.allChildren.some(matches) ||
  //       (!hideSubActivities && a.allParents.some(matches))
  //     ));
  //   } else {
  //     fA = fA.filter(a => a.allChildren.some(matches));
  //   }
  // }
  fA.sort((a, b) => {
    if (orderBychildrenLength) {
      const la = a.allChildIds.length;
      const lb = b.allChildIds.length;
      if (la !== lb) return lb - la;
    }
    let diff = 0;
    if (a[order] < b[order]) diff = 1;
    if (a[order] > b[order]) diff = -1;
    return orderType === 'desc' ? diff : - diff;
  });
  return fA;
};

type ActivityFilterProps = {
  onChange?: (filteredActivities: Activity[], filters: ActivityFilters) => void;
};

function ActivityFilter({ onChange }: ActivityFilterProps) {
  const { activities } = useActivities();
  const [state, setState] = useState(initFilters);

  const ref = useRef(onChange);
  ref.current = onChange;
  useEffect(() => {
    ref.current?.(filterActivities(activities, state), state);
  }, [state, activities]);

  return (
    <Box>
      <TextField
        sx={{ mb: 2 }}
        variant='outlined'
        label='search'
        fullWidth
        value={state.searchVal}
        onChange={({ target: { value } }) => setState(p => ({ ...p, searchVal: value }))}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Search />
            </InputAdornment>
          ),
        }}
      />
    </Box>
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
