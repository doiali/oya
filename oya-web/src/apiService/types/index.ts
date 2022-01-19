export type ActivityRaw = {
  id: number,
  name: string,
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
  parentIds: number[],
};

export type ActivityUpdate = ActivityCreate & { id: number; };

export type Entry = {
  activity_id: number,
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
