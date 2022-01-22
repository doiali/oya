from typing import List

from sqlalchemy.orm import Session
from sqlalchemy import Column, select
from . import crud, schemas
from .models import Interval, Activity, Association, Entry
from .database import SessionLocal, engine
import datetime
from dateutil import parser
import copy

with SessionLocal() as session:
    """"""
    stmt = select(Entry).where(Entry.time.is_(None)).order_by(Entry.interval_id)
    res = session.execute(stmt).scalars().all()
    for entry in res:
        entry.time = entry.interval.end - entry.interval.start
    for r in res:
        print(r.interval_id, r.activity_id, r.time)
    # session.commit()
