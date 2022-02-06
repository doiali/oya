import { Grid, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { Activity } from '../apiService';
import { useReportContext } from './ReportProvider';
import { getDeltaStringOfRange as ts } from '../utils';

type ActivityOverviewReportProps = {
  activity: Activity,
};

export function GridOverviewReport() {
  const { atra } = useReportContext();
  return (
    <Grid container spacing={2}>
      {atra.map((r) => r && (
        <Grid key={r.activity.id} item xs={6} md={4} lg={3} xl={2}>
          <ActivityOverviewReport activity={r.activity} />
        </Grid>
      ))}
    </Grid>
  );
}

export default function ActivityOverviewReport({ activity }: ActivityOverviewReportProps) {
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
