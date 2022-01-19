export type Activity = {
  id: number,
  name: string,
  parents: Activity[],
  parentIds: number[],
  childIds: number[],
  allParentIds: number[],
  allChildIds: number[],
};

export type Activity2 = {
  id: number,
  name: string,
  parents: Activity[],
  children: Activity[],
  parentIds: number[],
  childIds: number[],
  allParents: Activity[],
  allChildren: Activity[],
  allParentIds: number[],
  allChildIds: number[],
};

export type ActivitySelect = {
  id: number,
  name: string,
}

export type ActivityCreate = {
  name: string,
  parentIds: number[],
};

export type ActivityUpdate = ActivityCreate & { id: number; };

export type EntryCreate = {
  activity: ActivitySelect,
};

export type EntryUpdate = {
  activity: ActivitySelect,
};

export type Entry = {
  activity: Activity,
};

export type IntervalBase = {
  start: string,
  end: string,
  note?: string,
}

export type IntervalCreate = IntervalBase & {
  entries: EntryCreate[],
};

export type IntervalUpdate = IntervalBase & {
  id: number,
  entries?: EntryUpdate[],
};

export type Interval = IntervalBase & {
  id: number,
  entries: Entry[],
};
