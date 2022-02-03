import { Box } from '@mui/material';
import { Treemap, Tooltip } from 'recharts';
import { ActivityTotalReport } from './reportUtils';
import { useReport } from './ReportPage';
import { Activity } from './apiService';

type RechartTreeData = {
  name: string;
  activity?: Activity;
  size?: number;
  children?: RechartTreeData[];
};

export const generateRechartsTreeData = (atrm: ActivityTotalReport, activities: Activity[]) => {
  const total = Object.values(atrm).reduce((a, r) => a + (r?.timePure ?? 0), 0);
  const data: RechartTreeData[] = [];
  const f = (a: Activity, o = 1): RechartTreeData => {
    const time = atrm[a.id]?.time ?? 0;
    const data: RechartTreeData = {
      activity: a,
      name: (time / total > 0.0) ? a.name : '',
      size: atrm[a.id]?.timePure ?? 0,
    };
    // data.size = atrm[a.id]?.timePure ?? 0;
    if (a.childIds.length > 0) {
      data.children = a.children.filter(a => atrm[a.id]).map(a => f(a, o / 1.2));
    }
    return data;
  };
  activities.filter(a => a.parentIds.length === 0 && (atrm[a.id]?.time ?? 0) / total > 0).forEach(a => {
    data.push(f(a, 1));
  });
  return data;
};

export default function TreemapReportRechart() {
  const { atrm, activities } = useReport();
  const data = generateRechartsTreeData(atrm, activities);
  return (
    <Box>
      <Treemap
        width={1500}
        height={800}
        data={data}
        isAnimationActive={false}
        nameKey="name"
        dataKey="size"
        // content={<DemoTreemapItem bgColors={ColorPlatte} />}
      >
        <Tooltip />
      </Treemap>
    </Box>
  );
}
