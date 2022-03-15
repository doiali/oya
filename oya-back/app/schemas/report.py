import datetime
from typing import List, Optional, Dict

from pydantic import BaseModel


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
