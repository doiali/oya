import useSWR from 'swr';
import { getIntervals } from './apiService';

const intervalsFetcher = () => getIntervals().then(res => res.data);

export default function useIntervals() {
  const { data } = useSWR('/intervals/', intervalsFetcher);
  const loaded = Boolean(data);
  return { intervals: data ?? [], loaded };
}
