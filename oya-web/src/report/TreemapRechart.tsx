import { Box } from '@mui/material';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import RechartsTooltip from './RechartsTooltip';
import { useReportContext } from './ReportProvider';
import { generateTreeDataRe } from './chartUtils';

export default function TreemapRechart() {
  const { ATRM: atrm, activities } = useReportContext();
  const data = generateTreeDataRe(atrm, activities);
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
