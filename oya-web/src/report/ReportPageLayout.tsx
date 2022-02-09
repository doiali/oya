import { Box } from '@mui/material';
import { Outlet } from 'react-router';
import { reportRoutes } from '../App';
import TabsNav from '../TabsNav';
import { useReport } from './ReportProvider';

export default function ReportPageLayout() {
  const report = useReport();

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabsNav routes={reportRoutes} />
      </Box>
      <Box sx={{ py: 2 }}>
        <Outlet context={{ report }} />
      </Box>
    </Box>
  );
}
