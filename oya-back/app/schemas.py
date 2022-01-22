import datetime
from typing import List, Optional, ForwardRef, Dict
import typing

from pydantic import BaseModel


Activity = ForwardRef("Activity")
Interval = ForwardRef("Interval")


class ActivityCreate(BaseModel):
    name: str
    parentIds: Optional[List[int]]
    childIds: Optional[List[int]]


class ActivityUpdate(BaseModel):
    name: Optional[str]
    parentIds: Optional[List[int]]
    childIds: Optional[List[int]]


class ActivityBase(BaseModel):
    id: int
    name: str

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


class IntervalBase(BaseModel):
    start: str
    end: str
    note: Optional[str]


class IntervalCreate(IntervalBase):
    entries: List[EntryCreate]


class Interval(IntervalBase):
    id: int
    entries: List[Entry]

    class Config:
        orm_mode = True


class ReportSinge(BaseModel):
    duration: int
    occurance: int

    class Config:
        orm_mode = True


class Period(BaseModel):
    s: str
    e: str
    d: int
    note: Optional[str]
    entries: List[Entry]

    class Config:
        orm_mode = True


class DailyReport(BaseModel):
    date: str
    periods: List[Period]
    report: Dict[str, ReportSinge]

    class Config:
        orm_mode = True


Activity.update_forward_refs()
Interval.update_forward_refs()
