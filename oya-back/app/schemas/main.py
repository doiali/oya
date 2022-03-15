import datetime
from typing import List, Optional, ForwardRef, Dict

from pydantic import BaseModel


Activity = ForwardRef("Activity")
Interval = ForwardRef("Interval")


class ActivityCreate(BaseModel):
    name: str
    is_suspended: Optional[bool] = False
    parentIds: Optional[List[int]]
    childIds: Optional[List[int]]


class ActivityUpdate(BaseModel):
    name: Optional[str]
    is_suspended: Optional[bool] = False
    parentIds: Optional[List[int]]
    childIds: Optional[List[int]]


class ActivityBase(BaseModel):
    id: int
    name: str
    is_suspended: bool

    class Config:
        orm_mode = True


class Activity(ActivityBase):

    # parents: List[Activity] = []
    # children: List[Activity] = []
    # associations: List[Association] = []
    parentIds: List[int] = []
    childIds: List[int] = []
    allParentIds: List[int] = []
    allChildIds: List[int] = []
    # allChildren: List[Activity] = []
    # allParents: List[Activity] = []


class EntryCreate(BaseModel):
    note: Optional[str]
    time: Optional[datetime.timedelta]
    activity_id: int


class Entry(BaseModel):
    note: Optional[str]
    time: Optional[datetime.timedelta]
    activity_id: int

    class Config:
        orm_mode = True


class IntervalsMeta(BaseModel):
    min: datetime.datetime | None
    max: datetime.datetime | None
    count: int | None
    intervals_sum: datetime.timedelta | None


class IntervalBase(BaseModel):
    start: datetime.datetime
    end: datetime.datetime
    note: Optional[str]


class IntervalCreate(IntervalBase):
    entries: List[EntryCreate]


class Interval(IntervalBase):
    id: int
    entries: List[Entry]

    class Config:
        orm_mode = True


class IntervalsResponse(BaseModel):
    meta: IntervalsMeta
    data: List[Interval]


Activity.update_forward_refs()
Interval.update_forward_refs()
