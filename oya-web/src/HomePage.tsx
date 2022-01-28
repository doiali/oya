import { CircularProgress, Grid } from '@mui/material';
import IntervalAdder from './IntervalAdder';
import IntervalsList from './IntervalsList';
import ActivitiesHomeWidget from './ActivitiesHomeWidget';
import useIntervals from './useIntervals';
import useActivities from './useActivities';

export default function HomePage() {
  const { intervals, loaded: loadedIntervals } = useIntervals();
  const { loaded: loadedActivities } = useActivities();

  return (
    <Grid spacing={2} container justifyContent="center">
      {(loadedIntervals && loadedActivities) ? (
        <>
          <Grid item xs={12} md={8}>
            <IntervalAdder intervals={intervals} />
            <IntervalsList intervals={intervals} />
          </Grid>
          <Grid item xs={12} md={4}>
            <ActivitiesHomeWidget />
          </Grid>
        </>
      ) : <CircularProgress />}
    </Grid>
  );
}
