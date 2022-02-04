import { Box, Grid, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { Activity } from './apiService';
import { ActivityTotalReport, createActivityTotalReport, createDailyDataMap } from './reportUtils';
import TreemapReportReactVis from './TreemapReportReactVis';
import TreemapReportRechart from './TreemapReportRechart';
import useActivities from './useActivities';
import useIntervals from './useIntervals';
import { getDeltaStringOfRange as ts } from './utils';

export function useReport() {
  const { intervals } = useIntervals();
  const { activityMappings, activities } = useActivities();
  const ddm = createDailyDataMap(intervals, activityMappings);
  const dda = Object.values(ddm);
  const atrm = createActivityTotalReport(dda);
  const atra = Object.values(atrm).sort((a, b) => Number(b?.time) - Number(a?.time));
  return { intervals, activityMappings, activities, ddm, dda, atrm, atra };
}

const reportRoutes = [
  { link: 'cards', label: 'cards', element: <GripOverviewReport /> },
  { link: 'vis-tree', label: 'vis tree', element: <TreemapReportReactVis /> },
  { link: 're-tree', label: 'recharts tree', element: <TreemapReportRechart /> },
];
export default function ReportPage() {
  const { dda, atra } = useReport();
  const loc = useLocation();
  const paths = loc.pathname.split('/');
  const path = paths[paths.length - 1];
  const allowed = reportRoutes.map(r => r.link);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(dda);
    // eslint-disable-next-line no-console
    console.log(atra);
  }, [atra, dda]);

  if (!allowed.includes(path)) return null;

  return (
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
  );
}

type ActivityOverViewReportProps = {
  activity: Activity,
  atrm: ActivityTotalReport,
};

function GripOverviewReport() {
  const { atrm, atra } = useReport();
  return (
    <Grid container spacing={2}>
      {atra.map((r) => r && (
        <Grid key={r.activity.id} item xs={6} md={4} lg={3} xl={2}>
          <ActivityOverViewReport
            activity={r.activity}
            atrm={atrm}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export function ActivityOverViewReport({ activity, atrm }: ActivityOverViewReportProps) {
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
