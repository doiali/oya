import useSWR from 'swr';
import { getIntervals, Interval } from './apiService';
import { useTrigger } from './utils';

const intervalsFetcher = () => getIntervals().then(res => res.data);

type useIntervalsProps = {
  onLoad?: (data: Interval[]) => void;
};

export default function useIntervals({ onLoad }: useIntervalsProps = {}) {
  const { data: { data, meta } = {} } = useSWR('/intervals/', intervalsFetcher);
  const loaded = Boolean(data);
  useTrigger(loaded, () => (data && onLoad?.(data)));
  return { intervals: data ?? [], meta, loaded };
}
