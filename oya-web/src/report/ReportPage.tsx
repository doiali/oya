import { Box, Grid, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { Activity } from '../apiService';
import BarTotalRechart from './BarTotalRechart';
import PieTotalRechart from './PieTotalRechart';
import ReportProvider, { useReportContext } from './ReportProvider';
import TreemapReactVis from './TreemapReactVis';
import TreemapRechart from './TreemapRechart';
import { getDeltaStringOfRange as ts } from '../utils';
import TreemapNivo from './TreemapNivo';

const reportRoutes = [
  { link: 'cards', label: 'cards', element: <GripOverviewReport /> },
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

type ActivityOverViewReportProps = {
  activity: Activity,
};

function GripOverviewReport() {
  const { atra } = useReportContext();
  return (
    <Grid container spacing={2}>
      {atra.map((r) => r && (
        <Grid key={r.activity.id} item xs={6} md={4} lg={3} xl={2}>
          <ActivityOverViewReport activity={r.activity} />
        </Grid>
      ))}
    </Grid>
  );
}

export function ActivityOverViewReport({ activity }: ActivityOverViewReportProps) {
  const { atrm } = useReportContext();
  const renderRow = (name: string, value: string | number) => (
    <Typography textAlign="center" key={name}>
      {name}: <b>{value}</b>
    </Typography>
  );
  const r = atrm[activity.id];
  if (!r) return null;
  return (
    <Paper sx={{ p: 2, height: '100%', flexShrink: 0 }}>
      <Typography gutterBottom variant='h5' textAlign="center">{activity.name}</Typography>
      <Stack>
        {renderRow('days', `${r.days} of ${r.allDays}`)}
        {renderRow('total time', ts(r.time))}
        {renderRow('avg per all days', ts(r.avgPerAllDays))}
        {renderRow('avg per days', ts(r.avgPerDays))}
        {renderRow('occurance', r.occurance.toString())}
      </Stack>
    </Paper>
  );
}
