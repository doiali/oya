import { Interval, Entry, Activity } from './apiService';
import { ActivityMappings } from './useActivities';

export type ActivityChildrenReport = {
  [id: number]: {
    activity: Activity,
    percent: number,
    children: ActivityChildrenReport,
  };
};

export type ActivityTotalReportSingle = {
  activity: Activity,
  totalTime: number,
  days: number,
  allDays: number,
  avgPerDays: number,
  avgPerAllDays: number,
  occurance: number,
  avgTimePerOccurance: number,
  children: ActivityChildrenReport,
};

export type ActivityTotalReport = {
  [id: number]: ActivityTotalReportSingle,
};

export type SanitizedInterval = {
  id: number,
  l: number,
  date: Date,
  s: number,
  e: number,
  d: number,
  p: number,
  entries: Entry[];
  note?: string,
};

export type ActivityDailyReport = {
  name: string,
  activity: Activity,
  occurance: number,
  time: number,
  pureOccurance: number,
  pureTime: number,
};

export type DailyData = {
  date: Date;
  logs: SanitizedInterval[],
  report: Record<number, ActivityDailyReport>;
};

export type DailyDataMap = Record<string, DailyData>;

export const getDateString = (x: Date) => (
  (x.getFullYear()).toString() + '-' +
  (x.getMonth() + 1).toString().padStart(2, '0') + '-' +
  (x.getDate()).toString().padStart(2, '0')
);

export const getDayTime = (x: Date) => {
  const floor = new Date(x);
  floor.setHours(0, 0, 0, 0);
  return (x.getTime() - floor.getTime());
};

export const getTimeDelta = (x: Date, base: Date) => (
  (x.getTime() - base.getTime())
);

export const getRange = (start: Date, end: Date) => {
  const startDate = new Date(start);
  const startTime = getDayTime(startDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  let endTime = getDayTime(endDate);
  if (endTime < 1) {
    endTime = endTime + 60000 * 60 * 24;
    endDate.setDate(endDate.getDate() - 1);
  }
  endDate.setHours(0, 0, 0, 0);
  const days = (endDate.getTime() - startDate.getTime()) / (60000 * 60 * 24) + 1;
  return { startTime, startDate, endTime, endDate, days };
};

export const sanitizeInterval = (interval: Interval): SanitizedInterval[] => {
  const [start, end] = [new Date(interval.start), new Date(interval.end)];
  const {
    startTime, startDate, endTime, days,
  } = getRange(start, end);

  return [...Array(days)].map((_, i) => {
    let s = startTime;
    let e = endTime;
    if (i > 0)
      s = 0;
    if (i < days - 1)
      e = 60000 * 60 * 24;
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      s, e, d: (e - s) / 60000, p: (e - s) / (getTimeDelta(end, start)), date,
      id: interval.id, l: i + 1, entries: interval.entries, note: interval.note,
    };
  });
};

export const createDailyDataMap = (
  intervals: Interval[], am: ActivityMappings,
): DailyDataMap => {
  const dailyDataMap: DailyDataMap = {};
  let minString = new Date().toISOString();
  intervals.forEach(i => { if (i.start < minString) minString = i.start; });
  const start = new Date(minString);
  const end = intervals[0]?.end ? new Date(intervals[0]?.end) : new Date();
  const { startDate, days } = getRange(start, end);

  [...Array(days)].forEach((_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dailyDataMap[getDateString(date)] = {
      logs: [], date, report: {},
    };
  });

  const processInterval = (interval: Interval) => {
    const sanitizedIntervals = sanitizeInterval(interval);
    sanitizedIntervals.forEach(si => {
      const dateString = getDateString(si.date);
      if (!dailyDataMap[dateString]) {
        dailyDataMap[dateString] = {
          date: si.date, logs: [], report: {},
        };
      }
      const { entries } = si;
      const dailyData = dailyDataMap[dateString];
      const { report } = dailyData;
      entries.forEach(e => {
        const a = am[e.activity_id];
        const t = e.time ? e.time / 60 : si.d;
        a?.allParents.forEach(p => {
          const { id } = p;
          if (!report[id]) {
            report[id] = {
              name: p.name, time: t, occurance: 1, activity: p,
              pureOccurance: id === a.id ? 1 : 0,
              pureTime: id === a.id ? t : 0,
            };
          } else {
            report[id].occurance += 1;
            report[id].time += t;
            if (id === a.id) {
              report[id].pureTime += t;
              report[id].pureOccurance += 1;
            }
          }
        });
      });
      dailyData.logs.push(si);
    });
  };

  intervals.forEach(processInterval);

  return dailyDataMap;
};

export const createActivityTotalReport = (ddm: DailyDataMap): ActivityTotalReport => {
  const atr: ActivityTotalReport = {};
  const ddmValues = Object.values(ddm);
  const allDays = ddmValues.length;
  ddmValues.forEach(({ report }) => {
    Object.values(report).forEach((r) => {
      const id = r.activity.id;
      if (!atr[id]) {
        atr[id] = {
          activity: r.activity,
          totalTime: r.time,
          days: 1,
          occurance: r.occurance,
          allDays,
          avgPerDays: 0,
          avgPerAllDays: 0,
          avgTimePerOccurance: 0,
          children: {},
        };
      } else {
        atr[id].totalTime += r.time;
        atr[id].days += 1;
        atr[id].occurance += r.occurance;
      }
    });
  });
  Object.values(atr).forEach(a => {
    const atrs = a;
    atrs.avgPerDays = atrs.totalTime / atrs.days;
    atrs.avgPerAllDays = atrs.totalTime / atrs.allDays;
    atrs.avgTimePerOccurance = atrs.totalTime / atrs.occurance;
  });
  return atr;
};
