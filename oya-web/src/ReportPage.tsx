import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Activity } from './apiService';
import { ActivityTotalReport, ActivityTotalReportSingle, createActivityTotalReport, createDailyDataMap } from './reportUtils';
import useActivities from './useActivities';
import useIntervals from './useIntervals';
import { getDeltaStringOfRange as ts } from './utils';

export default function ReportPage() {
  const { intervals } = useIntervals();
  const { activityMappings } = useActivities();
  const ddm = createDailyDataMap(intervals, activityMappings);
  const dda = Object.values(ddm);
  const atr = createActivityTotalReport(dda);
  const atrValues = Object.values(atr).sort((a, b) => Number(b.time) - Number(a.time));

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(dda);
    // eslint-disable-next-line no-console
    console.log(atrValues);
  }, [atrValues, dda]);

  return (
    <Grid container spacing={2}>
      {atrValues.map((r) => (
        <Grid key={r.activity.id} item xs={6} md={4} lg={3} xl={2}>
          <ActivityOverViewReport
            activity={r.activity}
            atr={atr}
          />
        </Grid>
      ))}
    </Grid>
  );
}

type ActivityOverViewReportProps = {
  activity: Activity,
  atr: ActivityTotalReport,
};
export type { ActivityTotalReportSingle };
export function ActivityOverViewReport({ activity, atr }: ActivityOverViewReportProps) {
  const renderRow = (name: string, value: string | number) => (
    <Typography textAlign="center" key={name}>
      {name}: <b>{value}</b>
    </Typography>
  );
  const r = atr[activity.id];
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
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
