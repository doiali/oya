import { Paper, Stack, styled, Typography } from '@mui/material';
import { TooltipProps } from 'recharts';
import { ActivityTotalReport } from './reportUtils';
import { Activity } from './apiService';
import { getDeltaStringOfRange as ts } from './utils';

const TooltipWrapper = styled('div')(() => ({
  opacity: 0.75,
}));

type ActivityOverViewReportProps = {
  activity: Activity,
  atrm: ActivityTotalReport,
  prefix?: string,
};

export function ActivityOverViewReport({ activity, atrm, prefix }: ActivityOverViewReportProps) {
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
        {prefix && (
          <Typography textAlign="center">
            {prefix}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function RechartsTooltip(props: TooltipProps<number, string> & { atrm: ActivityTotalReport; }) {
  const { active, payload, atrm } = props;
  if (!active || !payload?.length) return null;
  const { payload: p } = payload[0];
  return (
    <TooltipWrapper>
      <ActivityOverViewReport prefix={p.prefix} activity={p.activity as Activity} atrm={atrm} />
    </TooltipWrapper>
  );
}
