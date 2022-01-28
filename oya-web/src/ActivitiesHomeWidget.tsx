import { Edit, Search } from '@mui/icons-material';
import { IconButton, Stack, Divider, TextField, InputAdornment, Collapse, useTheme, emphasize, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Activity } from './apiService';
import { memo, useState } from 'react';
import ActivityAdder from './ActivityAdder';
import ActivityEditor from './ActivityEditor';
import useActivities from './useActivities';

export function getActivityParentsNames(a: Activity): string {
  return a.name.toLowerCase() + ' ' + a.parents.map((p) => getActivityParentsNames(p)).join(' ');
}

const ActivitiesHomeWidget = memo(function ActivitiesWidget() {
  const { activities } = useActivities();
  const [searchVal, setSearchVal] = useState('');
  const theme = useTheme();
  const searchIndex = activities.map((a) => getActivityParentsNames(a));
  const filteredActivities: Activity[] = activities.filter((a, i) => {
    return searchIndex[i].includes(searchVal.toLowerCase());
  });
  return (
    <Box sx={{ p: 2, backgroundColor: emphasize(theme.palette.background.paper, 0.05) }} component="section">
      <Typography variant='h5'>
        Create Activity
      </Typography>
      <ActivityAdder />
      <Typography mb={1} variant='h5'>
        Activities List
      </Typography>
      <TextField
        sx={{ mb: 2 }}
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
        {filteredActivities.map((a) => (
          <ActivitySingle
            key={a.id}
            activity={a}
          />
        ))}
      </Stack>
    </Box>
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
        <ActivityEditor
          activity={activity}
          onClose={() => setEditMode(false)}
        />
      </Collapse>
    </Box>
  );
});

export default ActivitiesHomeWidget;
