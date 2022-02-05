import { Box } from '@mui/material';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityTotalReport } from './reportUtils';
import { Activity } from './apiService';
import RechartsTooltip from './RechartsTooltip';
import { useReportContext } from './ReportProvider';

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

export default function TreemapReportRechart() {
  const { atrm, activities } = useReportContext();
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
            content={<RechartsTooltip />}
          />
        </Treemap>
      </ResponsiveContainer>
    </Box>
  );
}
