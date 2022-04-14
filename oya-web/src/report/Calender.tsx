import { Box, Tooltip } from '@mui/material';
import AdapterJalali from '@date-io/date-fns-jalali';
import React, { Fragment, useState } from 'react';
import { useActivityContext } from '../ActivityPageLayout';
import IntervalsList from '../IntervalsList';

const utils = new AdapterJalali();
const colors = [
  '#eeeeee',
  '#aaeeaa',
  '#55ee55',
  '#00ee00',
];
const getColor = (d: number) => {
  if (!d) return colors[0];
  if (d < 60) return colors[1];
  if (d < 180) return colors[2];
  return colors[3];
};

const getStart = () => {
  let s = new Date();
  const m = utils.getMonth(s);
  s = utils.addMonths(s, -m);
  s = utils.startOfMonth(s);
  return s;
};

const getWeeks = (start: Date) => {
  let current = new Date(start);
  const end = utils.addMonths(start, 12);
  const weeks: (Date[])[] = [];
  while (current < end) {
    const m = utils.getMonth(current);
    if (m === 0) {
      weeks.push(...utils.getWeekArray(current));
    } else {
      if (utils.isSameMonth(weeks[weeks.length - 1][6], current))
        weeks.push(...utils.getWeekArray(current).slice(1));
      else weeks.push(...utils.getWeekArray(current));
    }
    current = utils.addMonths(current, 1);
  }
  return weeks;
};

export default function Calender() {
  const { activity, report: { tDDA, intervals } } = useActivityContext();
  const start = getStart();
  const weeks = getWeeks(start);
  const [date, setDate] = useState<Date | null>(null);

  const getValue = (day: Date) => {
    if (!activity) return 0;
    const dm = tDDA.find(dm => utils.isSameDay(dm.date, day));
    const report = dm?.report[activity.id];
    return report?.time ?? 0;
  };
  let month = 0;
  return (
    <Box>
      <svg width={950} height={200}>
        <g transform="translate(10,25)">
          {weeks.map((week, i) => (
            <g key={i} transform={`translate(${i * 16},0)`}>
              {week.map((d, index) => ((i > 0 && i < 52) || utils.isSameYear(d, start)) && (
                <Fragment key={index}>
                  {
                    week.find(d => {
                      const ok = utils.getMonth(d) === month;
                      if (ok) month += 1;
                      return ok;
                    }) && (
                      <>
                        <line x1={i - 3} x2={i - 3} y1={-30} y2={-5} stroke="#aaaaaa" strokeWidth={1} />
                        <text x={i + 3} y={-10}>
                          {utils.formatByString(utils.addMonths(start, month - 1), 'MMMM')}
                        </text>
                      </>
                    )
                  }
                  <Tooltip
                    PopperProps={{
                      style: { pointerEvents: 'none' },
                    }}
                    enterDelay={0}
                    title={getValue(d).toFixed(0) + ' ... ' + utils.formatByString(d, 'yyyy-MM-dd EEE')}
                  >
                    <rect
                      // data-date={d.toISOString()}
                      onClick={() => setDate(d)}
                      fill={getColor(getValue(d))}
                      width={11}
                      height={11}
                      x={i}
                      y={index * 15}
                    />
                  </Tooltip>
                </Fragment>
              ))}
            </g>
          ))}
          <g>
            {colors.map((c, i) => (
              <rect
                fill={c}
                key={i}
                width={11}
                height={11}
                x={i * 16}
                y={120}
              />
            ))}
          </g>
        </g>
      </svg>
      <Box>
        {date && (
          <IntervalsList
            intervals={intervals.filter(i => (
              (new Date(i.start) <= utils.addDays(date, 1) && new Date(i.end) >= date)
            ))}
            highLights={activity ? [activity.id] : undefined}
          />
        )}
      </Box>
    </Box>
  );
}
