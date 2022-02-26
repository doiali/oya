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
  ATRM: ActivityTotalReportMap;
  ATRA: ActivityTotalReport[];
  DDM: DailyDataMap;
  DDA: DailyData[];
  intervals: Interval[];
  activities: Activity[];
  activityMappings: ActivityMappings;
};

const defaultValue: ReportContext = {
  ATRM: {},
  ATRA: [],
  DDM: {},
  DDA: [],
  intervals: [],
  activities: [],
  activityMappings: {},
};
const ReportContext = createContext<ReportContext>(defaultValue);

export function useReport() {
  const { intervals } = useIntervals();
  const { activityMappings, activities } = useActivities();
  const value = useMemo(() => {
    const DDM = createDailyDataMap(intervals, activityMappings);
    const DDA = Object.values(DDM);
    const ATRM = createActivityTotalReportMap(DDA);
    const ATRA = Object.values(ATRM).sort((a, b) => (
      Number(b?.time) - Number(a?.time)
    )) as ActivityTotalReport[];
    return { intervals, activityMappings, activities, DDM, DDA, ATRM, ATRA };
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
  const { report } = useOutletContext<{ report: ReportContext; }>();
  return report;
}
