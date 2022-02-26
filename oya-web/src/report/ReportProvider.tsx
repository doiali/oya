import React, { createContext, useMemo, useState } from 'react';
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

export type ReportContextState = {
  startDate: Date | null;
  endDate: Date | null;
};

export type ReportContext = {
  ATRM: ActivityTotalReportMap;
  ATRA: ActivityTotalReport[];
  DDM: DailyDataMap;
  DDA: DailyData[];
  intervals: Interval[];
  activities: Activity[];
  activityMappings: ActivityMappings;
  state: ReportContextState;
  onChange<T extends keyof ReportContextState>(name: T, value: ReportContextState[T]): void;
};

const defaultValue: ReportContext = {
  ATRM: {},
  ATRA: [],
  DDM: {},
  DDA: [],
  intervals: [],
  activities: [],
  activityMappings: {},
  state: {
    startDate: null,
    endDate: null,
  },
  onChange: () => 0,
};
const ReportContext = createContext<ReportContext>(defaultValue);

export function useReport(): ReportContext {
  const { intervals } = useIntervals();
  const { activityMappings, activities } = useActivities();
  const [state, setState] = useState<ReportContextState>({
    startDate: null,
    endDate: null,
  });
  const value = useMemo<ReportContext>(() => {
    const onChange: ReportContext['onChange'] = (name, value) => {
      setState((prev) => ({ ...prev, [name]: value }));
    };
    const DDM = createDailyDataMap(intervals, activityMappings);
    const DDA = Object.values(DDM);
    const ATRM = createActivityTotalReportMap(DDA);
    const ATRA = Object.values(ATRM).sort((a, b) => (
      Number(b?.time) - Number(a?.time)
    )) as ActivityTotalReport[];
    return {
      intervals, activityMappings,
      activities, DDM, DDA, ATRM,
      ATRA, state, onChange,
    };
  }, [intervals, activities, activityMappings, state]);
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
