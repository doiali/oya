import { useEffect } from 'react';
import useReport from './useReport';

export default function ReportPage() {
  const { reportsMap } = useReport();
  useEffect(() => {
    console.log(reportsMap);
  }, [reportsMap]);
  return (
    <div>
      Hello
    </div>
  );
}
