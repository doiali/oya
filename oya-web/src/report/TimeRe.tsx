import { Box } from '@mui/material';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart,
} from 'recharts';
import { useActivityContext } from '../ActivityPageLayout';
import Widget from '../Widget';
import { useDateContext } from '../DateProvider';

export default function TimeRe() {
  const { activity, report: { tDDA } } = useActivityContext();
  const { utils } = useDateContext()
  const data = tDDA.map(d => {
    return {
      name: utils.formatByString(d.date, 'MM-dd'),
      value: activity
        ? Math.round(d.report[activity?.id ?? 0]?.time ?? 0)
        : Math.round(d.totalTime),
    };
  });
  return (
    <Widget
      title={activity?.name ?? 'Total Time'}
    >
      <Box sx={{ width: '100%', height: 400, maxWidth: 1700 }}>
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
            <Tooltip labelStyle={{color: 'blue'}} />
            <Bar fill="#8884d8" dataKey="value" />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Widget>
  );
}
