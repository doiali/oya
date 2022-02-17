import { Container, Grid } from '@mui/material';
import IntervalAdder from './IntervalAdder';
import IntervalsList from './IntervalsList';
import IntervalsFilter, { useIntervalsFilter } from './IntervalsFilter';
import ActivitiesHomeWidget from './ActivitiesHomeWidget';

export default function HomePage() {
  const { filteredIntervals, ...intervalsFilterProps } = useIntervalsFilter();

  return (
    <Container maxWidth="xl">
      <IntervalAdder />
      <IntervalsFilter {...intervalsFilterProps} />
      <IntervalsList intervals={filteredIntervals} />
    </Container>
  );
}

export function HomePageOld() {
  const { filteredIntervals, ...intervalsFilterProps } = useIntervalsFilter();

  return (
    <Container maxWidth="xl">
      <Grid spacing={3} container>
        <Grid item xs={12} xl={8}>
          <IntervalAdder />
          <IntervalsFilter {...intervalsFilterProps} />
          <IntervalsList intervals={filteredIntervals} />
        </Grid>
        <Grid item xl={4} sx={{ display: { xs: 'none', xl: 'flex' } }}>
          <ActivitiesHomeWidget />
        </Grid>
      </Grid>
    </Container>
  );
}
