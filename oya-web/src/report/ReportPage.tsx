import { Box, Tab, Tabs } from '@mui/material';
import { Outlet, Route, Routes, useLocation, useResolvedPath, matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import BarTotalRechart from './BarTotalRechart';
import PieTotalRechart from './PieTotalRechart';
import { useReport } from './ReportProvider';
import TreemapReactVis from './TreemapReactVis';
import TreemapRechart from './TreemapRechart';
import TreemapNivo from './TreemapNivo';
import { GridOverviewReport } from './ActivityOverviewReport';
import SunburstNivo from './SunburstNivo';
import ActivityPage from '../ActivityPage';

export const reportRoutes = [
  { link: 'cards', label: 'Cards', element: <GridOverviewReport /> },
  { link: 'bar', label: 'Bars', element: <BarTotalRechart /> },
  { link: 'pie', label: 'Pie', element: <PieTotalRechart /> },
  { link: 're-tree', label: 'Re Tree', element: <TreemapRechart /> },
  { link: 'time-re/*', to: 'time-re', label: 'Re Time', element: <ActivityPage /> },
  { link: 'vis-tree', label: 'Vis Tree', element: <TreemapReactVis /> },
  { link: 'nivo-tree', label: 'Nivo Tree', element: <TreemapNivo /> },
  { link: 'sunburst', label: 'Nivo Sunburst', element: <SunburstNivo /> },
];

function ReportPageLayout() {
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
