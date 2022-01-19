import { Interval, Entry } from './apiService';
import useActivities from './useActivities';
import useIntervals from './useIntervals';

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
  entries: Entry[];
  note?: string,
};

export const dateString = (x: Date) => (
  (x.getFullYear()).toString() + '-' +
  (x.getMonth() + 1).toString().padStart(2, '0') + '-' +
  (x.getDate() + 1).toString().padStart(2, '0')
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
  const days = (endDate.getTime() - startDate.getTime()) / 60000 * 60 * 24 + 1;
  return { startTime, startDate, endTime, endDate, days };
};

export const sanitizeInterval = (interval: Interval): SanitizedInterval[] => {
  const {
    startTime, startDate, endTime, days,
  } = getRange(new Date(interval.start), new Date(interval.end));

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
      s, e, d: (e - s) / 60000, date,
      id: interval.id, l: i + 1, entries: interval.entries, note: interval.note,
    };
  });
};

export default function useReport() {
  const { activityMappings, loaded: loadedActivities } = useActivities();
  const { intervals, loaded: loadedIntervals } = useIntervals();
}
