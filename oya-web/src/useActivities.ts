import { useMemo } from 'react';
import useSWR from 'swr';
import { ActivityRaw, Activity, getActivities } from './apiService';

export default function useActivities() {
  const { data } = useSWR('/activities/', () => getActivities().then((res) => res.data));
  const [activityMappings, activities] = useMemo(() => {
    const o: Record<string, Activity> = {};
    const newActivities: Activity[] = [];
    if (data) {
      data.forEach((a) => {
        o[a.id] = { ...a, parents: [], children: [], allParents: [], allChildren: [] }
      })
      data.forEach((a) => {
        o[a.id].parents = a.parentIds.map(id => o[id])
        o[a.id].children = a.childIds.map(id => o[id])
        o[a.id].allParents = a.allParentIds.map(id => o[id])
        o[a.id].allChildren = a.allChildIds.map(id => o[id])
        newActivities.push(o[a.id]);
      })
    }
    return [o as Record<string, Activity | undefined>, newActivities]
  }, [data])
  return { activities, activityMappings, loaded: Boolean(data) };
}
