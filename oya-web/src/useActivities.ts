import { useMemo } from 'react';
import useSWR from 'swr';
import { Activity, getActivities, ActivityRaw } from './apiService';

const activitiesFetcher = () => getActivities().then((res) => res.data);
export type ActivityMap = Map<number, Activity>;

export default function useActivities() {
  const { data } = useSWR('/activities/', activitiesFetcher);
  const activityMap = useMemo(() => createActivityMap(data), [data]);
  return useMemo(() => ({
    activityMap,
    activities: Array.from(activityMap.values()),
    data,
    loaded: Boolean(data),
  }), [activityMap, data]);
}

export const createActivityMap = (data: ActivityRaw[] | undefined): ActivityMap => {
  const activityMap: ActivityMap = new Map();
  const newActivities: Activity[] = [];
  if (data) {
    data.forEach((a) => {
      activityMap.set(a.id, { ...a, parents: [], children: [], allParents: [], allChildren: [] });
    });
    activityMap.forEach((current) => {
      Object.assign(current, {
        parents: current.parentIds.map(id => activityMap.get(id) as Activity),
        children: current.childIds.map(id => activityMap.get(id) as Activity),
        allParents: current.allParentIds.map(id => activityMap.get(id) as Activity),
        allChildren: current.allChildIds.map(id => activityMap.get(id) as Activity),
      });
      newActivities.push(current);
    });
  }
  return activityMap;
};
