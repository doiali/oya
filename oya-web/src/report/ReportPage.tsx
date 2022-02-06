import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import BarTotalRechart from './BarTotalRechart';
import PieTotalRechart from './PieTotalRechart';
import ReportProvider from './ReportProvider';
import TreemapReactVis from './TreemapReactVis';
import TreemapRechart from './TreemapRechart';
import TreemapNivo from './TreemapNivo';
import { GridOverviewReport } from './ActivityOverviewReport';

const reportRoutes = [
  { link: 'cards', label: 'cards', element: <GridOverviewReport /> },
  { link: 'bar', label: 'bars', element: <BarTotalRechart /> },
  { link: 'pie', label: 'pie', element: <PieTotalRechart /> },
  { link: 'vis-tree', label: 'vis tree', element: <TreemapReactVis /> },
  { link: 're-tree', label: 'recharts tree', element: <TreemapRechart /> },
  { link: 'nivo-tree', label: 'nivo tree', element: <TreemapNivo /> },
];

export default function ReportPage() {
  const loc = useLocation();
  const paths = loc.pathname.split('/');
  const path = paths[paths.length - 1];
  const allowed = reportRoutes.map(r => r.link);

  if (!allowed.includes(path)) return null;

  return (
    <ReportProvider>
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={allowed.indexOf(path)} aria-label="basic tabs example">
            {reportRoutes.map(r => <Tab key={r.link} component={Link} to={r.link} label={r.label} />)}
          </Tabs>
        </Box>
        <Box sx={{ py: 2 }}>
          <Routes>
            {reportRoutes.map(r => <Route key={r.link} path={r.link} element={r.element} />)}
          </Routes>
        </Box>
      </Box>
    </ReportProvider>
  );
}
