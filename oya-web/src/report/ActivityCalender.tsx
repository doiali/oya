import { alpha, Box, Button, MenuItem, Select, styled, Typography } from '@mui/material';
import { useState } from 'react';
import { useActivityContext } from '../ActivityPageLayout';
import { useDateContext } from '../DateProvider';
import IntervalsList from '../IntervalsList';
import Widget from '../Widget';
import PieIcon from './PieIcon';

const Indicator = styled(PieIcon)(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',
}));

const scales = [
  { label: '12h', value: 1 },
  { label: '6h', value: 2 },
  { label: '4h', value: 3 },
  { label: '3h', value: 4 },
  { label: '2h', value: 6 },
  { label: '1h', value: 12 },
] as const;

export default function ActivityCalender() {
  const { activity, report: { DDA, intervals } } = useActivityContext();
  const { utils: u } = useDateContext();
  const getValue = (day: Date) => {
    if (!activity) return 0;
    const dm = DDA.find(dm => u.isSameDay(dm.date, day));
    const report = dm?.report[activity.id];
    return report?.time ?? 0;
  };
  const [date, setDate] = useState<Date | null>(null);
  const now = u.date() || new Date();
  const [selectedMonth, setSelectedMonth] = useState(u.startOfMonth(now));
  const [scale, setScale] = useState<typeof scales[number]['value']>(6);
  const weekArray = u.getWeekArray(selectedMonth);
  return (
    <Box>
      <Widget
        sx={{ mb: 3 }}
        title={(
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Activity Calender: {activity?.name}</span>
            <Select
              value={scale}
              onChange={(e) => setScale(e.target.value as typeof scales[number]['value'])}
              sx={{ minWidth: 80 }}
            >
              {scales.map(({ value, label }) => (
                <MenuItem value={value} key={value}>{label}</MenuItem>
              ))}
            </Select>
          </Box>
        )}
      >
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
                  <Indicator time={getValue(d) * scale} />
                  {u.format(d, 'dayOfMonth')}
                </Box>
              ))}
            </Box>
          );
        })}
      </Widget>

      <Box>
        {date && (
          <IntervalsList
            intervals={intervals.filter(i => (
              (new Date(i.start) <= u.addDays(date, 1) && new Date(i.end) >= date)
            ))}
            highLights={activity ? [activity.id] : undefined}
          />
        )}
      </Box>
    </Box>
  );
}
