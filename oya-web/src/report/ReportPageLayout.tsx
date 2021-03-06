import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router';
import { reportRoutes } from '../MainRouter';
import TabsNav from '../TabsNav';
import RangeSelector from './RangeSelector';
import { useReport } from './ReportProvider';

export default function ReportPageLayout() {
  const report = useReport();

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <RangeSelector
        sx={{ mb: 2 }}
        state={report.state}
        onChange={report.onChange}
      />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabsNav routes={reportRoutes} />
      </Box>
      <Box sx={{ py: 2 }}>
        <Outlet context={{ report }} />
      </Box>
    </Container>
  );
}
