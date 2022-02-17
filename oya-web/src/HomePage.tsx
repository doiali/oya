import { Container, Grid } from '@mui/material';
import IntervalAdder from './IntervalAdder';
import IntervalsList from './IntervalsList';
import IntervalsFilter, { useIntervalsFilter } from './IntervalsFilter';
import ActivitiesHomeWidget from './ActivitiesHomeWidget';

export default function HomePage() {
  const { filteredIntervals, ...intervalsFilterProps } = useIntervalsFilter();

  return (
    <Container maxWidth="lg">
      <IntervalAdder />
      <IntervalsFilter {...intervalsFilterProps} />
      <IntervalsList intervals={filteredIntervals} />
    </Container>
  );
}

export function HomePageOld() {
  const { filteredIntervals, ...intervalsFilterProps } = useIntervalsFilter();

  return (
    <Grid spacing={3} container>
      <Grid item xs={12} md={8}>
        <IntervalAdder />
        <IntervalsFilter {...intervalsFilterProps} />
        <IntervalsList intervals={filteredIntervals} />
      </Grid>
      <Grid item xs={12} md={4}>
        <ActivitiesHomeWidget />
      </Grid>
    </Grid>
  );
}
