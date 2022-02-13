import axios from 'axios';
import { ActivityRaw, ActivityUpdate, ActivityCreate, Interval, IntervalCreate, User } from './types';
export * from './types';

const session = axios.create();

session.defaults.baseURL = 'http://localhost:8000/';
session.defaults.headers.post['Content-Type'] = 'application/json';
session.defaults.timeout = 10000;

export { session };

export const getActivities = () => (
  session.get<ActivityRaw[]>('/activities/')
);

export const editActivity = ({ id, ...rest }: ActivityUpdate) => (
  session.put<ActivityRaw>(`/activities/${id}/`, rest)
);

export const createActivity = (data: ActivityCreate) => (
  session.post<ActivityRaw>('/activities/', data)
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

export const updateInterval = (data: Interval) => (
  session.put<Interval>(`/intervals/${data.id}`, data)
);

export const deleteInterval = (id: number) => (
  session.delete<null>(`/intervals/${id}`)
);

export const getCurrentUser = () => (
  session.get<User>('/users/me')
);
