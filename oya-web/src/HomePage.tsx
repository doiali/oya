import { Box, CircularProgress, Container } from '@mui/material';
import IntervalAdder from './IntervalAdder';
import IntervalsList from './IntervalsList';
import useIntervals from './useIntervals';
import useActivities from './useActivities';
import IntervalsFilter, { useIntervalsFilter } from './IntervalsFilter';

const PageLoading = () => (
  <Box sx={{ textAlign: 'center', pt: 6 }}>
    <CircularProgress />
  </Box>
);

export default function HomePage() {
  const { intervals, loaded: loadedIntervals } = useIntervals();
  const { loaded: loadedActivities } = useActivities();
  const { filteredIntervals, ...intervalsFilterProps } = useIntervalsFilter({ intervals });

  if (!(loadedIntervals && loadedActivities)) return <PageLoading />;
  return (
    <Container maxWidth="lg">
      <IntervalAdder intervals={filteredIntervals} />
      <IntervalsFilter {...intervalsFilterProps} />
      <IntervalsList intervals={intervals} />
    </Container>
  );
}
