import React, { createContext, useMemo } from 'react';
import { Activity, Interval } from '../apiService';
import useActivities, { ActivityMappings } from '../useActivities';
import {
  ActivityTotalReportMap,
  ActivityTotalReport,
  DailyDataMap,
  DailyData,
  createDailyDataMap,
  createActivityTotalReportMap,
} from './reportUtils';
import useIntervals from '../useIntervals';
import { useOutletContext } from 'react-router';
export type ReportContext = {
  atrm: ActivityTotalReportMap;
  atra: ActivityTotalReport[];
  ddm: DailyDataMap;
  dda: DailyData[];
  intervals: Interval[];
  activities: Activity[];
  activityMappings: ActivityMappings;
};
const defaultValue: ReportContext = {
  atrm: {},
  atra: [],
  ddm: {},
  dda: [],
  intervals: [],
  activities: [],
  activityMappings: {},
};
const ReportContext = createContext<ReportContext>(defaultValue);

export function useReport() {
  const { intervals } = useIntervals();
  const { activityMappings, activities } = useActivities();
  const value = useMemo(() => {
    const ddm = createDailyDataMap(intervals, activityMappings);
    const dda = Object.values(ddm);
    const atrm = createActivityTotalReportMap(dda);
    const atra = Object.values(atrm).sort((a, b) => (
      Number(b?.time) - Number(a?.time)
    )) as ActivityTotalReport[];
    return { intervals, activityMappings, activities, ddm, dda, atrm, atra };
  }, [intervals, activities, activityMappings]);
  return value;
}

export default function ReportProvider({ children }: { children?: React.ReactNode; }) {
  const value = useReport();
  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReportContext() {
  const report = useOutletContext<ReportContext>();
  return report;
}
