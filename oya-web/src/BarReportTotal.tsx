import { Box, Paper, Stack, styled, Typography } from '@mui/material';
import {
  BarChart, Bar, TooltipProps,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ActivityTotalReport } from './reportUtils';
import { useReport } from './ReportPage';
import { Activity } from './apiService';
import { getDeltaStringOfRange as ts } from './utils';

type Data = {
  name: string;
  activity?: Activity;
  value: number;
};

export const generateData = (atrm: ActivityTotalReport, activities: Activity[]) => {
  const data: Data[] = [];
  activities.forEach(a => {
    if (a.parentIds.length !== 0) return;
    const r = atrm[a.id];
    if (r && r.time)
      data.push({
        activity: a,
        name: a.name,
        value: r.avgPerAllDays,
      });
  });
  return data.sort((a, b) => b.value - a.value);
};

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

function CustomTooltip(props: TooltipProps<number, string> & { atrm: ActivityTotalReport; }) {
  const { active, payload, atrm } = props;
  if (!active || !payload?.length) return null;
  const { payload: p } = payload[0];
  return (
    <TooltipWrapper>
      <ActivityOverViewReport prefix={p.prefix} activity={p.activity as Activity} atrm={atrm} />
    </TooltipWrapper>
  );
}

export default function BarReportTotal() {
  const { atrm, activities } = useReport();
  const data = generateData(atrm, activities);
  return (
    <Box sx={{ width: '100%', height: 700, maxWidth: 1700 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout='vertical'
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" />
          <Tooltip content={<CustomTooltip atrm={atrm} />} />
          <Legend />
          <Bar layout='vertical' dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
