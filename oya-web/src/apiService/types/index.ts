export type Activity = {
  id: number,
  name: string,
  parents: Activity[],
};

export type ActivityCreate = {
  name: string,
  parentIds: number[],
};

export type ActivityUpdate = ActivityCreate & { id: number; };

export type EntryCreate = {
  dedication?: number,
  activity_id: number,
  activity_name: string,
};

export type EntryUpdate = {
  id?: number,
  dedication?: number,
  activity_id: number,
  activity_name: string,
};

export type Entry = {
  id: number,
  interval_id: number,
  activity_name: string,
  activity: Activity,
  dedication: number,
  activity_id: number,
};

export type IntervalCreate = {
  note?: string,
  start: string,
  end: string,
  entries: EntryCreate[],
};

export type IntervalUpdate = {
  id: number,
  note?: string,
  start: string,
  end: string,
  entries?: EntryUpdate[],
};

export type Interval = {
  id: number,
  note?: string,
  start: string,
  end: string,
  entries: Entry[],
};
