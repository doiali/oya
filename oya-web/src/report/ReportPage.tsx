import { Box, Tab, Tabs } from '@mui/material';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import BarTotalRechart from './BarTotalRechart';
import PieTotalRechart from './PieTotalRechart';
import ReportProvider from './ReportProvider';
import TreemapReactVis from './TreemapReactVis';
import TreemapRechart from './TreemapRechart';
import TreemapNivo from './TreemapNivo';
import { GridOverviewReport } from './ActivityOverviewReport';
import SunburstNivo from './SunburstNivo';

export const reportRoutes = [
  { link: 'cards', label: 'Cards', element: <GridOverviewReport /> },
  { link: 'bar', label: 'Bars', element: <BarTotalRechart /> },
  { link: 'pie', label: 'Pie', element: <PieTotalRechart /> },
  { link: 're-tree', label: 'Re Tree', element: <TreemapRechart /> },
  { link: 'vis-tree', label: 'Vis Tree', element: <TreemapReactVis /> },
  { link: 'nivo-tree', label: 'Nivo Tree', element: <TreemapNivo /> },
  { link: 'sunburst', label: 'Nivo Sunburst', element: <SunburstNivo /> },
];

function ReportPageLayout() {
  const loc = useLocation();
  const paths = loc.pathname.split('/');
  const path = paths[paths.length - 1];
  const allowed = reportRoutes.map(r => r.link);

  return (
    <ReportProvider>
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={allowed.indexOf(path)}>
            {reportRoutes.map(r => (
              <Tab key={r.link} component={Link} to={r.link} label={r.label} />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ py: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </ReportProvider>
  );
}

export default function ReportPage() {
  return (
    <Routes>
      <Route path='/' element={<ReportPageLayout />}>
        {reportRoutes.map(r => <Route key={r.link} path={r.link} element={r.element} />)}
        <Route path="*" element="404 not found" />
      </Route>
    </Routes>
  );
}
