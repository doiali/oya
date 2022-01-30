import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import { getIntervals, Interval } from './apiService';

const intervalsFetcher = () => getIntervals().then(res => res.data);

type useIntervalsProps = {
  onLoad?: (data: Interval[]) => void;
};

export default function useIntervals({ onLoad }: useIntervalsProps = {}) {
  const { data } = useSWR('/intervals/', intervalsFetcher);
  const loaded = Boolean(data);
  const prevLoaded = useRef(loaded);
  useEffect(() => {
    if (loaded && data) {
      if (!prevLoaded.current) {
        prevLoaded.current = loaded;
        onLoad?.(data);
      }
    }
  }, [data, loaded, onLoad]);
  return { intervals: data ?? [], loaded };
}
