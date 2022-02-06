import { Box } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import RechartsTooltip from './RechartsTooltip';
import { useReportContext } from './ReportProvider';
import { generateDataRe } from './chartUtils';

export default function BarTotalRechart() {
  const { atrm, activities } = useReportContext();
  const data = generateDataRe(atrm, activities);
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
          <Tooltip content={<RechartsTooltip />} />
          <Legend />
          <Bar layout='vertical' dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
