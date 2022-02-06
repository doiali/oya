import { Box, Typography } from '@mui/material';
import {
  Brush, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart,
} from 'recharts';
import { useReportContext } from './ReportProvider';
import { format } from 'date-fns-jalali';
import { Activity } from '../apiService';

export default function TimeRe({ activity }: { activity?: Activity; }) {
  const { dda } = useReportContext();
  const data = dda.map(d => {
    return {
      name: format(d.date, 'MM/dd'),
      value: activity
        ? Math.round(d.report[activity?.id ?? 0]?.time ?? 0)
        : Math.round(d.totalTime),
    };
  });
  return (
    <Box sx={{ width: '100%', height: 600, maxWidth: 1700 }}>
      <Typography align='center' variant='h5'>{activity?.name ?? 'Total Time'}</Typography>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          width={500}
          height={200}
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar fill="#8884d8" dataKey="value" />
          <Brush />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
