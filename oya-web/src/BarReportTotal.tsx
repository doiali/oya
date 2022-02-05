import { Box } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ActivityTotalReport } from './reportUtils';
import { Activity } from './apiService';
import RechartsTooltip from './RechartsTooltip';
import { useReportContext } from './ReportProvider';

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

export default function BarReportTotal() {
  const { atrm, activities } = useReportContext();
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
          <Tooltip content={<RechartsTooltip />} />
          <Legend />
          <Bar layout='vertical' dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
