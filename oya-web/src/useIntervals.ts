import useSWR from 'swr';
import { getIntervals, IntervalsReponse } from './apiService';
import { useTrigger } from './utils';

const intervalsFetcher = () => getIntervals().then(res => res.data);

type useIntervalsProps = {
  onLoad?: (res: IntervalsReponse) => void;
};

export default function useIntervals({ onLoad }: useIntervalsProps = {}) {
  const { data: { data, meta } = {} } = useSWR('/intervals/', intervalsFetcher);
  const loaded = Boolean(data);
  useTrigger(loaded, () => (data && meta && onLoad?.({ data, meta })));
  return { intervals: data ?? [], meta, loaded };
}
