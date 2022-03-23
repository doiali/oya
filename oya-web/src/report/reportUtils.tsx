import { Interval, Activity } from '../apiService';
import { ActivityMap } from '../useActivities';

export type SanitizedInterval = {
  id: number,
  line: number,
  date: Date,
  start: number, // ms
  end: number, // ms
  delta: number, // minutes
  percent: number, // percent [0,1]
  entries: {
    activity_id: number,
    time: number, // minutes
  }[];
  note?: string,
};

export type ActivityReportBase = {
  activity: Activity,
  time: number,
  timePure: number,
  occurance: number,
  occurancePure: number,
};

export type ActivityReportAnalysis = {
  avgPerDays: number,
  avgPerAllDays: number,
  occurancePerDays: number,
  occurancePerAllDays: number,
  avgTimePerOccurance: number,
  avgPerDaysPure: number,
  avgPerAllDaysPure: number,
  occurancePerDaysPure: number,
  occurancePerAllDaysPure: number,
  avgTimePerOccurancePure: number,
};

export type ActivityTotalReport = {
  days: number,
  allDays: number,
} & ActivityReportBase & ActivityReportAnalysis;

export type ActivityTotalReportMap = {
  [id: number]: ActivityTotalReport | undefined,
};

export type DailyData = {
  date: Date;
  logs: SanitizedInterval[],
  report: Record<number, ActivityReportBase>;
  totalTime: number;
};

export type DailyDataMap = Record<string, DailyData>;

export const getDateString = (x: Date) => (
  (x.getFullYear()).toString() + '-' +
  (x.getMonth() + 1).toString().padStart(2, '0') + '-' +
  (x.getDate()).toString().padStart(2, '0')
);

/** @returns daytime in micro seconds */
export const getDayTime = (x: Date) => {
  const floor = new Date(x);
  floor.setHours(0, 0, 0, 0);
  return (x.getTime() - floor.getTime());
};

/** @returns timeDelta in micro seconds */
export const getTimeDelta = (x: Date, base: Date) => (
  (x.getTime() - base.getTime())
);

/** micro seconds */
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
  const days = Math.round((endDate.getTime() - startDate.getTime()) / (60000 * 60 * 24) + 1);
  return { startTime, startDate, endTime, endDate, days };
};

export const sanitizeInterval = (interval: Interval): SanitizedInterval[] => {
  const [startOfInterval, endOfInterval] = [new Date(interval.start), new Date(interval.end)];
  const {
    startTime, startDate, endTime, days,
  } = getRange(startOfInterval, endOfInterval);

  return [...Array(days)].map((_, i) => {
    let start = startTime;
    let end = endTime;
    if (i > 0)
      start = 0;
    if (i < days - 1)
      end = 60000 * 60 * 24;
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const percent = (end - start) / (getTimeDelta(endOfInterval, startOfInterval));
    const delta = (end - start) / 60000;
    const entries = interval.entries.map(e => ({
      activity_id: e.activity_id,
      time: e.time ? e.time * percent / 60 : delta,
    }));
    return {
      start, end, delta, percent, date,
      id: interval.id, line: i + 1, entries, note: interval.note,
    };
  });
};

export const createDailyDataMap = (
  intervals: Interval[], am: ActivityMap,
): DailyDataMap => {
  const dailyDataMap: DailyDataMap = {};
  let minDate = new Date();
  intervals.forEach(i => { if (new Date(i.start) < minDate) minDate = new Date(i.start); });
  const start = new Date(minDate);
  const end = intervals[0]?.end ? new Date(intervals[0]?.end) : new Date();
  const { startDate, days } = getRange(start, end);

  [...Array(days)].forEach((_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dailyDataMap[getDateString(date)] = {
      logs: [], date, report: {}, totalTime: 0,
    };
  });

  const processInterval = (interval: Interval) => {
    const sanitizedIntervals = sanitizeInterval(interval);
    sanitizedIntervals.forEach(si => {
      const dateString = getDateString(si.date);
      if (!dailyDataMap[dateString]) {
        dailyDataMap[dateString] = {
          date: si.date, logs: [], report: {}, totalTime: 0,
        };
      }
      const { entries } = si;
      const dailyData = dailyDataMap[dateString];
      const { report } = dailyData;
      entries.forEach(e => {
        const a = am.get(e.activity_id);
        const t = e.time;
        a?.allParents.forEach(p => {
          const { id } = p;
          if (!report[id]) {
            report[id] = {
              time: t, occurance: 1, activity: p,
              occurancePure: id === a.id ? 1 : 0,
              timePure: id === a.id ? t : 0,
            };
          } else {
            report[id].occurance += 1;
            report[id].time += t;
            if (id === a.id) {
              report[id].timePure += t;
              report[id].occurancePure += 1;
            }
          }
        });
      });
      dailyData.totalTime = Object.values(report).reduce((a, r) => a + r.timePure, 0);
      dailyData.logs.push(si);
    });
  };

  intervals.forEach(processInterval);

  return dailyDataMap;
};

export const createActivityTotalReportMap = (dda: DailyData[]): ActivityTotalReportMap => {
  const atr: ActivityTotalReportMap = {};
  const allDays = dda.length;
  dda.forEach(({ report }) => {
    Object.values(report).forEach((r) => {
      const id = r.activity.id;
      if (!atr[id]) {
        atr[id] = {
          activity: r.activity,
          time: r.time,
          timePure: r.timePure,
          days: 1,
          occurance: r.occurance,
          occurancePure: r.occurancePure,
          allDays,
          avgPerDays: 0,
          avgPerAllDays: 0,
          occurancePerDays: 0,
          occurancePerAllDays: 0,
          avgTimePerOccurance: 0,
          avgPerDaysPure: 0,
          avgPerAllDaysPure: 0,
          occurancePerDaysPure: 0,
          occurancePerAllDaysPure: 0,
          avgTimePerOccurancePure: 0,
        };
      } else {
        const report = atr[id];
        if (report) {
          report.time += r.time;
          report.timePure += r.timePure;
          report.days += 1;
          report.occurance += r.occurance;
          report.occurancePure += r.occurancePure;
        }
      }
    });
  });
  Object.values(atr).forEach(a => {
    const atrs = a;
    if (atrs)
      Object.assign(atrs, {
        avgPerDays: atrs.time / atrs.days,
        avgPerAllDays: atrs.time / atrs.allDays,
        occurancePerDays: atrs.occurance / atrs.days,
        occurancePerAllDays: atrs.occurance / atrs.allDays,
        avgTimePerOccurance: atrs.time / atrs.occurance,
        avgPerDaysPure: atrs.timePure / atrs.days,
        avgPerAllDaysPure: atrs.timePure / atrs.allDays,
        occurancePerDaysPure: atrs.occurancePure / atrs.days,
        occurancePerAllDaysPure: atrs.occurancePure / atrs.allDays,
        avgTimePerOccurancePure: atrs.timePure / atrs.occurancePure,
      });
  });
  return atr;
};
