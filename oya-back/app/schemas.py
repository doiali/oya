from typing import List, Optional, ForwardRef

from pydantic import BaseModel
import datetime

Activity = ForwardRef('Activity')
Interval = ForwardRef('Interval')


class ActivityCreate(BaseModel):
    name: str
    parentIds: Optional[List[int]]
    childIds: Optional[List[int]]


class ActivityUpdate(BaseModel):
    name: Optional[str]
    parentIds: Optional[List[int]]
    childIds: Optional[List[int]]


class Activity(BaseModel):
    id: int
    name: str
    parents: List[Activity] = []

    # children: List[Activity] = []
    # associations: List[Association] = []
    # childIds: List[int] = []
    # allChildIds: List[int] = []
    # allChildren: List[Activity] = []
    # parentIds: List[int] = []
    # allParentIds: List[int] = []
    # allParents: List[Activity] = []

    class Config:
        orm_mode = True


class EntryBase(BaseModel):
    note: Optional[str]
    dedication: Optional[float] = 100


class EntryCreate(EntryBase):
    activity_id: int


class EntryUpdate(EntryCreate):
    interval_id: int


class IntervalEntryUpdate(EntryCreate):
    id: Optional[int]


class Entry(EntryCreate):
    id: int
    interval_id: int
    activity_name: str
    activity: Activity

    class Config:
        orm_mode = True


class IntervalBase(BaseModel):
    start: str
    end: str
    note: Optional[str]


class IntervalCreate(IntervalBase):
    entries: Optional[List[EntryCreate]]


class IntervalUpdate(IntervalBase):
    entries: Optional[List[IntervalEntryUpdate]]


class Interval(IntervalBase):
    id: int
    entries: List[Entry]

    class Config:
        orm_mode = True


Activity.update_forward_refs()
Interval.update_forward_refs()
