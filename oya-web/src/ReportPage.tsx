import { useEffect } from 'react';
import { createDailyDataMap } from './reportUtils';
import useIntervals from './useIntervals';

export default function ReportPage() {
  const { intervals } = useIntervals();
  useEffect(() => {
    console.log(createDailyDataMap(intervals));
  }, [intervals]);
  return (
    <div>
      Hello
    </div>
  );
}
