import { Box, styled } from '@mui/material';
import { Treemap, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { ActivityTotalReport } from './reportUtils';
import { ActivityOverViewReport, useReport } from './ReportPage';
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

const TooltipWrapper = styled('div')(() => ({
  opacity: 0.75,
}));

function CustomTooltip(props: TooltipProps<number, string> & { atrm: ActivityTotalReport; }) {
  const { active, payload, atrm } = props;
  if (!active || !payload?.length) return null;
  const { payload: p } = payload[0];
  return (
    <TooltipWrapper>
      <ActivityOverViewReport activity={p.activity as Activity} atrm={atrm} />
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
          isAnimationActive
          nameKey="name"
          dataKey="size"
          animationDuration={500}
        // content={<DemoTreemapItem bgColors={ColorPlatte} />}
        >
          <Tooltip
            content={<CustomTooltip atrm={atrm} />}
          />
        </Treemap>
      </ResponsiveContainer>
    </Box>
  );
}
