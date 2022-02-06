import { Box } from '@mui/material';
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, PieLabelRenderProps,
} from 'recharts';
import { Activity } from '../apiService';
import RechartsTooltip from './RechartsTooltip';
import { useReportContext } from './ReportProvider';
import { generateDataRe } from './chartUtils';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props as any;
  const a = props.activity as Activity;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const radius2 = outerRadius * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const x2 = cx + radius2 * Math.cos(-midAngle * RADIAN);
  const y2 = cy + radius2 * Math.sin(-midAngle * RADIAN);

  return (
    <>
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text x={x2} y={y2} fill="#8884d8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {a.name}
      </text>
    </>
  );
};

export default function PieReportTotal() {
  const { atrm, activities } = useReportContext();
  const data = generateDataRe(atrm, activities);
  return (
    <Box sx={{ width: '100%', height: 700, maxWidth: 1700 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={1000} height={1000}>
          <Pie
            dataKey="value"
            isAnimationActive
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={300}
            fill="#8884d8"
            // label
            label={renderCustomizedLabel}
          />
          <Tooltip content={<RechartsTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
