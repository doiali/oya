import { Edit, Search } from '@mui/icons-material';
import {
  IconButton, Stack, Divider,
  TextField, InputAdornment, Collapse, Button,
} from '@mui/material';
import { Box } from '@mui/system';
import { Activity } from './apiService';
import { memo, useState } from 'react';
import ActivityAdder from './ActivityAdder';
import ActivityEditor from './ActivityEditor';
import useActivities from './useActivities';
import Widget from './Widget';

export function getActivityParentsNames(a: Activity): string {
  return a.name.toLowerCase() + ' ' + a.allParents.map((p) => p.name).join(' ');
}
const maxRows = 40;

const ActivitiesHomeWidget = memo(function ActivitiesWidget() {
  const { activities } = useActivities();
  const [searchVal, setSearchVal] = useState('');
  const [more, setMore] = useState(false);
  const searchIndex = activities.map((a) => getActivityParentsNames(a));
  const filteredActivities: Activity[] = activities.filter((a, i) => {
    return searchIndex[i].includes(searchVal.toLowerCase());
  });
  const rows = filteredActivities.length;
  return (
    <Stack sx={{ width: '100%' }} spacing={3}>
      <Widget title="Create Activity">
        <ActivityAdder />
      </Widget>
      <Widget title="Activities List">
        <TextField
          sx={{ mb: 3 }}
          variant='outlined'
          label='search'
          fullWidth
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Stack spacing={1} divider={<Divider orientation="horizontal" flexItem />}>
          {filteredActivities.slice(0, more ? undefined : maxRows).map((a) => (
            <ActivitySingle
              key={a.id}
              activity={a}
            />
          ))}
          {rows > maxRows && (
            <Button onClick={() => setMore(p => !p)}>
              {more ? 'show less' : 'show more'}
            </Button>
          )}
        </Stack>
      </Widget>
    </Stack>
  );
});

const ActivitySingle = memo(function ActivitySingle(
  { activity }: { activity: Activity; },
) {
  const [editMode, setEditMode] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{activity.id} - {activity.name}</span>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          {activity.parents.map((p) => p.name).join(', ')}
          <IconButton size="small" onClick={() => setEditMode(true)}><Edit spacing={1} /></IconButton>
        </Stack>
      </Box>
      <Collapse in={editMode} unmountOnExit mountOnEnter>
        <Box sx={{ pt: 3 }}>
          <ActivityEditor
            activity={activity}
            onClose={() => setEditMode(false)}
          />
        </Box>
      </Collapse>
    </Box>
  );
});

export default ActivitiesHomeWidget;
