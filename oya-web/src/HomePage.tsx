import { Container } from '@mui/material';
import IntervalAdder from './IntervalAdder';
import IntervalsList from './IntervalsList';
import IntervalsFilter, { useIntervalsFilter } from './IntervalsFilter';

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
