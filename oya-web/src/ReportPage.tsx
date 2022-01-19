import { useEffect } from 'react';
import { createDailyReportsMap } from './reportUtils';
import useIntervals from './useIntervals';

export default function ReportPage() {
  const { intervals } = useIntervals();
  useEffect(() => {
    console.log(createDailyReportsMap(intervals));
  }, [intervals]);
  return (
    <div>
      Hello
    </div>
  );
}
