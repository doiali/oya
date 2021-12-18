import { CircularProgress, Grid } from '@mui/material';
import IntervalAdder from './IntervalAdder';
import IntervalsList from './IntervalsList';
import ActivitiesPanel from './ActivitiesPanel';
import useIntervals from './useIntervals';
import useActivities from './useActivities';

export default function HomePage() {
  const { data: intervals } = useIntervals();
  const { data: activities } = useActivities();

  return (
    <Grid container justifyContent="center">
      {(intervals && activities) ? (
        <>
          <Grid item xs={12} md={3}>
            <IntervalAdder intervals={intervals} activities={activities} />
          </Grid>
          <Grid item xs={12} md={6}>
            <IntervalsList intervals={intervals} activities={activities} />
          </Grid>
          <Grid item xs={12} md={3}>
            <ActivitiesPanel activities={activities} />
          </Grid>
        </>
      ) : <CircularProgress />}
    </Grid>
  );
}
