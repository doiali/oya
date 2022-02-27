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

export const rangeOptions = [
  { value: 'today', label: 'Today', days: 0 },
  { value: 'lastWeek', label: 'Last week', days: 7 },
  { value: 'lastMonth', label: 'Last month', days: 30 },
  { value: 'lastYear', label: 'Last year', days: 365 },
  { value: 'allTime', label: 'All time' },
  { value: 'custom', label: 'Custom' },
] as const;

export type RangeOption = typeof rangeOptions[number];
export type RangeOptionKey = RangeOption['value'];

export type ReportContextState = {
  start: Date | null;
  end: Date | null;
  period: RangeOption;
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
  onChange<T extends keyof ReportContextState>(name: T, value: ReportContextState[T]): void;
};

export type ReportContextResults = {
  tATRM: ActivityTotalReportMap;
  tATRA: ActivityTotalReport[];
  tDDA: DailyData[];
  state: ReportContextState;
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
    period: { value: 'lastMonth', label: 'Last month', days: 30 },
  },
  onChange: () => 0,
};
const ReportContext = createContext<ReportContext>(defaultValue);

const getRangeFromRangeOption = (period: RangeOption, meta?: IntervalsMeta) => {
  let end = new Date();
  if (meta?.max)
    end = new Date(meta.max);
  end.setDate(end.getDate());
  end.setHours(0, 0, 0, 0);
  let start = new Date(end);
  if (meta?.min) {
    if (period.value === 'allTime' || period.value === 'custom')
      start = new Date(meta.min);
    else {
      start.setDate(start.getDate() - period.days);
    }
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

const getInitState = (meta: IntervalsMeta | undefined): ReportContextState => {
  const defaultOption: RangeOption = { value: 'lastMonth', label: 'Last month', days: 30 };
  const dates = getRangeFromRangeOption(defaultOption, meta);
  return { ...dates, period: defaultOption };
};

export function useReport(): ReportContext {
  const { intervals, meta: intervalsMeta } = useIntervals({
    onLoad: ({ meta }) => { setState(getInitState(meta)); },
  });
  const { activityMappings, activities } = useActivities();
  const [state, setState] = useState<ReportContextState>(() => getInitState(intervalsMeta));

  const base = useMemo<ReportContextBase>(() => {
    const onChange: ReportContext['onChange'] = (name, value) => {
      if (name === 'period') {
        const val = value as RangeOption;
        setState((prev) => ({
          ...prev,
          ...(val.value !== 'custom'
            ? getRangeFromRangeOption(val, intervalsMeta)
            : {}
          ),
          period: val,
        }));
      } else if (name === 'start' || name === 'end') {
        setState((prev) => ({
          ...prev,
          period: { value: 'custom', label: 'Custom' },
          [name]: value,
        }));
      }
    };
    const DDM = createDailyDataMap(intervals, activityMappings);
    const DDA = Object.values(DDM);
    const ATRM = createActivityTotalReportMap(DDA);
    const ATRA = Object.values(ATRM).sort((a, b) => (
      Number(b?.time) - Number(a?.time)
    )) as ActivityTotalReport[];
    return {
      intervals, intervalsMeta, activityMappings, activities,
      DDM, DDA, ATRM, ATRA, onChange,
    };
  }, [intervals, activities, activityMappings, intervalsMeta]);

  const results = useMemo<ReportContextResults>(() => {
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
      state,
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
