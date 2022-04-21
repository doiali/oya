import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useActivityContext } from '../ActivityPageLayout';
import { useDateContext } from '../DateProvider';
import Widget from '../Widget';
import ClockIcon, { ClockIconProps } from './ClockIcon';

export default function ClockPage() {
  const { utils: u } = useDateContext();
  const now = u.date() || new Date();
  const [week, setWeek] = useState(u.startOfWeek(now));
  const { activity, report: { DDA } } = useActivityContext();
  return (
    <Box>
      <Widget title="clocks">
        <Box display="flex" justifyContent="space-between">
          <Button onClick={() => setWeek(u.addWeeks(week, -1))}>
            prev week
          </Button>
          <Typography>
            {u.formatByString(week, 'yyyy-MM-dd')} to {u.formatByString(u.addDays(week, 6), 'yyyy-MM-dd')}
          </Typography>
          <Button onClick={() => setWeek(u.addWeeks(week, 1))}>
            next week
          </Button>
        </Box>
        {[...Array(7)].map((v, i) => {
          const day = u.addDays(week, i);
          const r = DDA.find(r => u.isSameDay(r.date, day));
          const data: ClockIconProps['data'] = [];
          r?.logs.forEach(l => {
            let time = l.entries.reduce((a, e) => {
              return activity?.allChildIds.includes(e.activity_id) ? a + e.time : a;
            }, 0);
            if (!time) return;
            if (time > l.delta) time = l.delta;
            const a1 = l.start * Math.PI / 3600000 / 6;
            const a2 = l.end * Math.PI / 3600000 / 6;
            const a2r = (l.start + time * 60000) * Math.PI / 3600000 / 6;
            if (time < l.delta) {
              data.push({ a1, a2, isLight: true });
            }
            data.push({ a1, a2: a2r });
          });
          return (
            <ClockIcon
              data={data}
              key={day.toISOString()}
              text={u.format(day, 'weekday')}
            />
          );
        })}
      </Widget>
    </Box>
  );
}
