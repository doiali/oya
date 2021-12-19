import axios from 'axios';
import { Activity, ActivityUpdate, ActivityCreate, Interval, IntervalCreate, IntervalUpdate } from './types';
export * from './types';

const session = axios.create();

session.defaults.baseURL = 'http://localhost:8000/';
session.defaults.headers.post['Content-Type'] = 'application/json';
session.defaults.timeout = 10000;

export { session };

export const getActivities = () => (
  session.get<Activity[]>('/activities/')
);

export const editActivity = ({ id, ...rest }: ActivityUpdate) => (
  session.put<Activity>(`/activities/${id}/`, rest)
);

export const createActivity = (data: ActivityCreate) => (
  session.post<Activity>('/activities/', data)
);

export const deleteActivity = (id: number) => (
  session.delete<null>(`/activities/${id}/`)
);

export const getIntervals = () => (
  session.get<Interval[]>('/intervals/')
);

export const addInterval = (data: IntervalCreate) => (
  session.post<Interval>('/intervals/', data)
);

export const updateInterval = (data: IntervalUpdate) => (
  session.put<Interval>(`/intervals/${data.id}`, data)
);

export const deleteInterval = (id: number) => (
  session.delete<null>(`/intervals/${id}`)
);
