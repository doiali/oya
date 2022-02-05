import React, { createContext, useContext, useMemo } from 'react';
import { Activity, Interval } from '../apiService';
import useActivities, { ActivityMappings } from '../useActivities';
import {
  ActivityTotalReport,
  ActivityTotalReportSingle,
  DailyDataMap,
  DailyData,
  createDailyDataMap,
  createActivityTotalReport,
} from './reportUtils';
import useIntervals from '../useIntervals';
export type ReportContext = {
  atrm: ActivityTotalReport;
  atra: ActivityTotalReportSingle[];
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

export default function ReportProvider({ children }: { children?: React.ReactNode; }) {
  const { intervals } = useIntervals();
  const { activityMappings, activities } = useActivities();
  const value = useMemo(() => {
    const ddm = createDailyDataMap(intervals, activityMappings);
    const dda = Object.values(ddm);
    const atrm = createActivityTotalReport(dda);
    const atra = Object.values(atrm).sort((a, b) => (
      Number(b?.time) - Number(a?.time)
    )) as ActivityTotalReportSingle[];
    return { intervals, activityMappings, activities, ddm, dda, atrm, atra };
  }, [intervals, activities, activityMappings]);
  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReportContext() {
  const report = useContext(ReportContext);
  return report;
}
