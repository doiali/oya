import { useEffect } from 'react';
import { createDailyDataMap } from './reportUtils';
import useActivities from './useActivities';
import useIntervals from './useIntervals';

export default function ReportPage() {
  const { intervals } = useIntervals();
  const { activityMappings } = useActivities();
  useEffect(() => {
    console.log(createDailyDataMap(intervals, activityMappings));
  }, [intervals, activityMappings]);
  return (
    <div>
      Hello
    </div>
  );
}
