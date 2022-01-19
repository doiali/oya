import { useEffect } from 'react';
import { createActivityTotalReport, createDailyDataMap } from './reportUtils';
import useActivities from './useActivities';
import useIntervals from './useIntervals';

export default function ReportPage() {
  const { intervals } = useIntervals();
  const { activityMappings } = useActivities();
  useEffect(() => {
    const ddm = createDailyDataMap(intervals, activityMappings);
    const atr = createActivityTotalReport(ddm);
    console.log(ddm);
    const atrValues = Object.values(atr).map(a => ({
      n: a.activity.name, t: Math.round(a.totalTime / 60), ...a,
    }));
    atrValues.sort((a, b) => Number(b.t) - Number(a.t));
    console.log(atrValues);
  }, [intervals, activityMappings]);
  return (
    <div>
      Hello
    </div>
  );
}
