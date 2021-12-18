import useSWR from 'swr';
import { getActivities } from './apiService';

export default function useActivities() {
  const { data: { data } = {} } = useSWR('/activities/', getActivities);
  return { data };
}
