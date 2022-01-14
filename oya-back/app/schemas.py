from typing import List, Optional, ForwardRef, Any, Dict
import typing

from pydantic import BaseModel
import datetime


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


class Activity(ActivityBase, BaseModel):
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


class ActivitySelect(BaseModel):
    id: int


class EntryCreate(BaseModel):
    note: Optional[str]
    activity: ActivitySelect


class Entry(BaseModel):
    note: Optional[str]
    activity: Activity

    class Config:
        orm_mode = True


class EntryView(BaseModel):
    note: Optional[str]
    activity: ActivityBase

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
    activity: ActivityBase

    class Config:
        orm_mode = True


class Period(BaseModel):
    s: str
    e: str
    d: str
    note: Optional[str]
    entries: List[EntryView]

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
