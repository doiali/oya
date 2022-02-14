export type ActivityRaw = {
  id: number,
  name: string,
  is_suspended: boolean,
  parentIds: number[],
  childIds: number[],
  allParentIds: number[],
  allChildIds: number[],
};

export type Activity = ActivityRaw & {
  parents: Activity[],
  children: Activity[],
  allParents: Activity[],
  allChildren: Activity[],
};

export type ActivityCreate = {
  name: string,
  is_suspended: boolean,
  parentIds: number[],
  childIds: number[],
};

export type ActivityUpdate = ActivityCreate & { id: number; };

export type Entry = {
  activity_id: number,
  time?: number,
  note?: string,
};

export type IntervalBase = {
  start: string,
  end: string,
  note?: string,
};

export type IntervalCreate = IntervalBase & {
  entries: Entry[],
};

export type Interval = IntervalBase & {
  id: number,
  entries: Entry[],
};

export type UserBase = {
  username: string,
  firstname?: string,
  lastname?: string,
  email?: string,
  superuser?: boolean,
};

export type Token = {
  access_token: string,
  token_type: string,
};

export type User = UserBase & {
  id: number;
};
