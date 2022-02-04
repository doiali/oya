import { Box, Paper, Stack, styled, Typography } from '@mui/material';
import { Treemap, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { ActivityTotalReport } from './reportUtils';
import { useReport } from './ReportPage';
import { Activity } from './apiService';
import { getDeltaStringOfRange as ts } from './utils';

type RechartTreeData = {
  name: string;
  prefix: string;
  activity?: Activity;
  size?: number;
  children?: RechartTreeData[];
};

export const generateRechartsTreeData = (atrm: ActivityTotalReport, activities: Activity[]) => {
  const total = Object.values(atrm).reduce((a, r) => a + (r?.timePure ?? 0), 0);
  const data: RechartTreeData[] = [];
  const f = (a: Activity, s: string): RechartTreeData => {
    const ss = s + ' > ' + a.name;
    const data: RechartTreeData = {
      activity: a,
      name: a.name,
      prefix: ss,
      size: atrm[a.id]?.timePure ?? 0,
    };
    if (a.childIds.length > 0) {
      data.children = a.children.filter(c => atrm[c.id]).map(c => f(c, ss));
      data.children.push({ activity: a, prefix: ss, name: '', size: atrm[a.id]?.timePure ?? 0 });
    }
    return data;
  };
  activities.filter(a => a.parentIds.length === 0 && (atrm[a.id]?.time ?? 0) / total > 0).forEach(a => {
    data.push(f(a, ''));
  });
  return data;
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

export default function TreemapReportRechart() {
  const { atrm, activities } = useReport();
  const data = generateRechartsTreeData(atrm, activities);
  return (
    <Box sx={{ width: '100%', height: 700, maxWidth: 1700 }}>
      <ResponsiveContainer>
        <Treemap
          data={data}
          isAnimationActive={false}
          nameKey="name"
          dataKey="size"
          // animationDuration={200}
        // content={<DemoTreemapItem bgColors={ColorPlatte} />}
        >
          <Tooltip
            // isAnimationActive={false}
            content={<CustomTooltip atrm={atrm} />}
          />
        </Treemap>
      </ResponsiveContainer>
    </Box>
  );
}
