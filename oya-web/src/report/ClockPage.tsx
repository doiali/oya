import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useActivityContext } from '../ActivityPageLayout';
import { useDateContext } from '../DateProvider';
import { getDeltaStringOfRange } from '../utils';
import Widget from '../Widget';
import ClockIcon, { ClockIconProps } from './ClockIcon';

export default function ClockPage() {
  const { utils: u } = useDateContext();
  const now = u.date() || new Date();
  const [week, setWeek] = useState(u.startOfWeek(now));
  const { activity, report: { DDA } } = useActivityContext();
  let totalTime = 0;
  let days = 0;
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
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
            const time = activity && r?.report[activity?.id]?.time;
            totalTime += time ?? 0;
            if (time) days += 1;
            return (
              <Grid item key={day.toISOString()}>
                <ClockIcon
                  data={data}
                  renderText={({ x, y }) => (
                    <>
                      <text x={x} y={y - 75}>{u.formatByString(day, 'EEEE, d-M')}</text>
                      {time && <text x={x} y={y + 75}>{getDeltaStringOfRange(time)}</text>}
                    </>
                  )}
                />
              </Grid>
            );
          })}
          <Stack sx={{ alignItems: 'center', justifyContent: 'center', width: 250 }}>
            <span>totolTime: {getDeltaStringOfRange(totalTime)}</span>
            <span>days: {days} of 7</span>
            <span>average per days: {getDeltaStringOfRange(days ? totalTime / days : 0)}</span>
            <span>average per all days: {getDeltaStringOfRange(totalTime / 7)}</span>
          </Stack>
        </Box>
      </Widget>
    </Box>
  );
}
