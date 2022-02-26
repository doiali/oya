import React, { createContext, useMemo, useState } from 'react';
import { Activity, Interval, IntervalsMeta } from '../apiService';
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
  start: Date | null;
  end: Date | null;
};

export type ReportContextBase = {
  intervals: Interval[];
  activities: Activity[];
  activityMappings: ActivityMappings;
  intervalsMeta?: IntervalsMeta;
  ATRM: ActivityTotalReportMap;
  ATRA: ActivityTotalReport[];
  DDM: DailyDataMap;
  DDA: DailyData[];
};

export type ReportContextResults = {
  tATRM: ActivityTotalReportMap;
  tATRA: ActivityTotalReport[];
  tDDA: DailyData[];
  state: ReportContextState;
  onChange<T extends keyof ReportContextState>(name: T, value: ReportContextState[T]): void;
};

export type ReportContext = ReportContextBase & ReportContextResults;

const defaultValue: ReportContext = {
  ATRM: {},
  ATRA: [],
  DDM: {},
  DDA: [],
  tATRM: {},
  tATRA: [],
  tDDA: [],
  intervals: [],
  activities: [],
  activityMappings: {},
  state: {
    start: null,
    end: null,
  },
  onChange: () => 0,
};
const ReportContext = createContext<ReportContext>(defaultValue);

const getInitState = (meta: IntervalsMeta | undefined) => {
  let start = new Date(0);
  if (meta?.min)
    start = new Date(meta.min);
  start.setHours(0, 0, 0, 0);
  let end = new Date();
  if (meta?.max)
    end = new Date(meta.max);
  end.setDate(end.getDate() + 1);
  end.setHours(0, 0, 0, 0);
  return { start, end };
};

export function useReport(): ReportContext {
  const { intervals, meta: intervalsMeta } = useIntervals({
    onLoad: ({ meta }) => { setState(getInitState(meta)); },
  });
  const { activityMappings, activities } = useActivities();
  const [state, setState] = useState<ReportContextState>(() => getInitState(intervalsMeta));

  const base = useMemo<ReportContextBase>(() => {
    const DDM = createDailyDataMap(intervals, activityMappings);
    const DDA = Object.values(DDM);
    const ATRM = createActivityTotalReportMap(DDA);
    const ATRA = Object.values(ATRM).sort((a, b) => (
      Number(b?.time) - Number(a?.time)
    )) as ActivityTotalReport[];
    return {
      intervals, intervalsMeta, activityMappings, activities,
      DDM, DDA, ATRM, ATRA,
    };
  }, [intervals, activities, activityMappings, intervalsMeta]);

  const results = useMemo<ReportContextResults>(() => {
    const onChange: ReportContext['onChange'] = (name, value) => {
      setState((prev) => ({ ...prev, [name]: value }));
    };
    const tDDA = base.DDA.filter(({ date }) => {
      if (!base.intervalsMeta) return true;
      if (
        !state.end || !state.start ||
        isNaN(state.end.getTime()) || isNaN(state.start.getTime()) ||
        (date <= state.end && date >= state.start)
      ) {
        return true;
      }
      return false;
    });
    const tATRM = createActivityTotalReportMap(tDDA);
    const tATRA = Object.values(tATRM).sort((a, b) => (
      Number(b?.time) - Number(a?.time)
    )) as ActivityTotalReport[];
    return {
      tDDA, tATRM, tATRA,
      state, onChange,
    };
  }, [base.intervalsMeta, base.DDA, state]);

  const value = useMemo<ReportContext>(() => {
    return { ...base, ...results };
  }, [base, results]);
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
