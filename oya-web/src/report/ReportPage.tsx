import { Box, Tab, Tabs } from '@mui/material';
import { Outlet, useLocation, useResolvedPath, matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import { reportRoutes } from '../App';
import { useReport } from './ReportProvider';

export default function ReportPage() {
  const loc = useLocation();
  const report = useReport();
  let value = 0;
  reportRoutes.forEach((r, i) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const p = useResolvedPath(r.link);
    const m = matchPath(p.pathname, loc.pathname);
    if (m) { value = i; }
  });
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value}>
          {reportRoutes.map(r => (
            <Tab key={r.link} component={Link} to={r.to ?? r.link} label={r.label} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ py: 2 }}>
        <Outlet context={{ report }} />
      </Box>
    </Box>
  );
}
