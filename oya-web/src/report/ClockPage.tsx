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
            const time = l.entries.find(e => e.activity_id === activity?.id)?.time ?? 0;
            if (!time) return;
            const a1 = l.start * Math.PI / 3600000 / 6;
            const a2 = l.end * Math.PI / 3600000 / 6;
            const a2r = (l.start + time * 60000) * Math.PI / 3600000 / 6;
            if (time < l.delta)
              data.push({ a1, a2, isLight: true });
            data.push({ a1, a2: a2r });
          });
          return (
            <ClockIcon data={data} key={day.toISOString()} />
          );
        })}
      </Widget>
    </Box>
  );
}
