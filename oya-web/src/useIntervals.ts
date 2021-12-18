import useSWR from 'swr';
import { getIntervals } from './apiService';

export default function useIntervals() {
  const { data: { data } = {} } = useSWR('/intervals/', getIntervals);
  return { data };
}
