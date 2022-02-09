import { Box, Tab, Tabs } from '@mui/material';
import { Outlet, useLocation, useResolvedPath, matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import { reportRoutes } from '../App';
import { useReport } from './ReportProvider';

export default function ReportPageLayout() {
  const loc = useLocation();
  const report = useReport();
  const { pathname: base } = useResolvedPath('');

  const value: false | string = reportRoutes.find(r => (
    r.path !== '*' && !r.hideLink && Boolean(matchPath(base + '/' + r.path, loc.pathname))
  ))?.path ?? false;

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value}>
          {reportRoutes.filter(r => r.path !== '*' && !r.hideLink).map(r => (
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
