import { alpha, Box, Button, styled, Typography } from '@mui/material';
import { useState } from 'react';
import { useActivityContext } from '../ActivityPageLayout';
import { localeUtils as u } from '../DateAdapter';
import IntervalsList from '../IntervalsList';
import PieIcon from './PieIcon';

const Indicator = styled(PieIcon)(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',
}));

export default function ActivityCalender() {
  const { activity, report: { DDA, intervals } } = useActivityContext();
  const getValue = (day: Date) => {
    if (!activity) return 0;
    const dm = DDA.find(dm => u.isSameDay(dm.date, day));
    const report = dm?.report[activity.id];
    return report?.time ?? 0;
  };
  const [date, setDate] = useState<Date | null>(null);
  const now = u.date();
  const [selectedMonth, setSelectedMonth] = useState(u.startOfMonth(now));
  const weekArray = u.getWeekArray(selectedMonth);
  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Button onClick={() => setSelectedMonth(u.getPreviousMonth(selectedMonth))}>
          prev month
        </Button>
        <Typography>
          {u.format(selectedMonth, 'monthAndYear')}
        </Typography>
        <Button onClick={() => setSelectedMonth(u.getNextMonth(selectedMonth))}>
          next month
        </Button>
      </Box>
      <Box display="flex">
        {weekArray[0].map((d, i) => (
          <Box
            key={d.toISOString()}
            m={1}
            width={300}
            height={80}
            p={1}
            textAlign="center"
          >
            <span className='desktop-only'>
              {u.format(d, 'weekday')}
            </span>
            <span className='mobile-only'>
              {u.getWeekdays()[i]}
            </span>
          </Box>
        ))}
      </Box>
      {weekArray.map((a) => {
        return (
          <Box key={a[0].toISOString()} display="flex">
            {a.map(d => (
              <Box
                onClick={() => setDate(d)}
                key={d.toISOString()}
                sx={theme => ({
                  opacity: u.isSameMonth(d, selectedMonth) ? 1 : 0.5,
                  bgcolor: u.isSameDay(d, now) ? alpha(theme.palette.primary.main, 0.1) : undefined,
                  p: 1,
                  m: 1,
                  width: 300,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                })}
              >
                <Indicator time={getValue(d)} />
                {u.format(d, 'dayOfMonth')}
              </Box>
            ))}
          </Box>
        );
      })}
      <Box>
        {date && (
          <IntervalsList
            intervals={intervals.filter(i => (
              u.isWithinRange(new Date(i.start), [date, u.addDays(date, 1)]) ||
              u.isWithinRange(new Date(i.end), [date, u.addDays(date, 1)])
            ))}
            highLights={activity ? [activity.id] : undefined}
          />
        )}
      </Box>
    </Box>
  );
}
