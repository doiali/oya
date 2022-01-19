import { Interval, Entry } from './apiService';

export type SingleActivityChildrenReport = {
  [id: number]: {
    id: number,
    percent: number,
    children: SingleActivityChildrenReport,
  };
};

export type SingleActivityReport = {
  id: number,
  totalTime: number,
  days: number,
  allDays: number,
  avgPerDays: number,
  avgPerAllDays: number,
  occurance: number,
  avgTimePerOccurance: number,
  children: SingleActivityChildrenReport,
};

export type ActivityTotalReport = {
  [id: number]: SingleActivityReport,
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

export type DailyReport = {
  date: Date;
  logs: SanitizedInterval[],
};

export type DailyReportsMap = Record<string, DailyReport>;

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

export const createDailyReportsMap = (intervals: Interval[]): DailyReportsMap => {
  const reportsMap: DailyReportsMap = {};
  let minString = new Date().toISOString();
  intervals.forEach(i => { if (i.start < minString) minString = i.start; });
  const start = new Date(minString);
  const end = intervals[0]?.end ? new Date(intervals[0]?.end) : new Date();
  const { startDate, days } = getRange(start, end);

  [...Array(days)].forEach((_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    reportsMap[getDateString(date)] = {
      logs: [], date,
    };
  });

  const processInterval = (interval: Interval) => {
    const sanitizedIntervals = sanitizeInterval(interval);
    sanitizedIntervals.forEach(si => {
      const dateString = getDateString(si.date);
      if (!reportsMap[dateString]) {
        reportsMap[dateString] = {
          date: si.date, logs: [],
        };
      }
      reportsMap[dateString].logs.push(si);
    });
  };

  intervals.forEach(processInterval);

  return reportsMap;
};
