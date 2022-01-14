export type Activity = {
  id: number,
  name: string,
  parents: Activity[],
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
