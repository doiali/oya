import { Box, Tab, Tabs } from '@mui/material';
import { Outlet, useLocation, useResolvedPath, matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import { reportRoutes } from '../App';
import { useReport } from './ReportProvider';

export default function ReportPageLayout() {
  const loc = useLocation();
  const report = useReport();
  let value: false | string = false;
  const { pathname: base } = useResolvedPath('');
  reportRoutes.forEach((r) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const m = matchPath(base + '/' + r.path, loc.pathname);
    if (m) { value = r.path; }
  });
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value}>
          {reportRoutes.map(r => (
            <Tab value={r.path} key={r.path} component={Link} to={r.to ?? r.path} label={r.label} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ py: 2 }}>
        <Outlet context={{ report }} />
      </Box>
    </Box>
  );
}
