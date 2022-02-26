import { Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import { Activity } from '../apiService';
import { useReportContext } from './ReportProvider';
import { getDeltaStringOfRange as ts } from '../utils';
import Widget from '../Widget';

type ActivityOverviewReportProps = {
  activity: Activity,
};

export function GridOverviewReport() {
  const { tATRA } = useReportContext();
  return (
    <Grid container spacing={2}>
      {tATRA.map((r) => r && (
        <Grid key={r.activity.id} item xs={6} md={4} lg={3} xl={2}>
          <ActivityOverviewReport activity={r.activity} />
        </Grid>
      ))}
    </Grid>
  );
}

export default function ActivityOverviewReport({ activity }: ActivityOverviewReportProps) {
  const { tATRM } = useReportContext();
  const renderRow = (name: string, value: string | number) => (
    <Typography key={name}>
      {name}: <b>{value}</b>
    </Typography>
  );
  const r = tATRM[activity.id];
  if (!r) return null;
  return (
    <Widget title={'Overview report: ' + activity.name}>
      <Stack>
        {renderRow('days', `${r.days} of ${r.allDays}`)}
        {renderRow('total time', ts(r.time))}
        {renderRow('avg per all days', ts(r.avgPerAllDays))}
        {renderRow('avg per days', ts(r.avgPerDays))}
        {renderRow('occurance', r.occurance.toString())}
      </Stack>
    </Widget>
  );
}
