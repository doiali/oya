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


class ReportBase(BaseModel):
    time: datetime.timedelta
    time_pure: datetime.timedelta
    occurance_in_period: int
    occurance: int
    occurance_pure: int
    periods: int
    all_periods: int
    intervals_count: int
    intervals_total_time: datetime.timedelta
    intervals_total_time_pure: datetime.timedelta
    period_start: datetime.datetime
    period_end: datetime.datetime
    period_range: datetime.timedelta


class ReportPeriodic(ReportBase):
    index: int


class ReportActivities(ReportBase):
    activity_id: int


class ReportActivitiesPeriodic(ReportBase):
    index: int
    activity_id: int


Activity.update_forward_refs()
Interval.update_forward_refs()
