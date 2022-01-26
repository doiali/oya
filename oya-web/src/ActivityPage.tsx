import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { TreeItem, TreeView } from '@mui/lab';
import { Grid } from '@mui/material';
import { Activity } from './apiService';
import useActivities from './useActivities';

export default function ActivityPage() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={7}>
        <ActivityTree />
      </Grid>
    </Grid>
  );
}

function ActivityTree() {
  const { activities } = useActivities();
  return (
    <TreeView
      defaultCollapseIcon={<ExpandMore />}
      defaultExpandIcon={<ChevronRight />}
    >
      {activities.filter(a => a.parentIds.length === 0).map((a, i) => (
        <ActivityTreeSingle
          index={i + 1}
          key={a.id}
          rendererId={0}
          activity={a}
        />
      ))}
    </TreeView>
  );
}

type ActivityTreeSingleProps = {
  activity: Activity;
  rendererId: number;
  type?: 'children' | 'parents';
  index?: number;
};

function ActivityTreeSingle({ activity, rendererId, type = 'children', index }: ActivityTreeSingleProps) {
  return (
    <TreeItem
      nodeId={rendererId.toString + '-' + activity.id}
      label={(index ? (index.toString().padStart(3, '') + ' - ') : '') + activity.name}
    >
      {activity[type].map((c, i) => (
        <ActivityTreeSingle
          type={type}
          index={i + 1}
          key={c.id}
          activity={c}
          rendererId={activity.id}
        />
      ))}
    </TreeItem>
  );
}
