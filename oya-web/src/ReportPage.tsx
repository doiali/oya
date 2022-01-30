import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Activity } from './apiService';
import { ActivityTotalReport, createActivityTotalReport, createDailyDataMap } from './reportUtils';
import useActivities from './useActivities';
import useIntervals from './useIntervals';
import { getDeltaStringOfRange as ts } from './utils';

export function useReport() {
  const { intervals } = useIntervals();
  const { activityMappings } = useActivities();
  const ddm = createDailyDataMap(intervals, activityMappings);
  const dda = Object.values(ddm);
  const atrm = createActivityTotalReport(dda);
  const atra = Object.values(atrm).sort((a, b) => Number(b.time) - Number(a.time));
  return { intervals, activityMappings, ddm, dda, atrm, atra };
}

export default function ReportPage() {
  const { atrm, dda, atra } = useReport();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(dda);
    // eslint-disable-next-line no-console
    console.log(atra);
  }, [atra, dda]);

  return (
    <Grid container spacing={2}>
      {atra.map((r) => (
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

type ActivityOverViewReportProps = {
  activity: Activity,
  atrm: ActivityTotalReport,
};

export function ActivityOverViewReport({ activity, atrm }: ActivityOverViewReportProps) {
  const renderRow = (name: string, value: string | number) => (
    <Typography textAlign="center" key={name}>
      {name}: <b>{value}</b>
    </Typography>
  );
  const r = atrm[activity.id];
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
