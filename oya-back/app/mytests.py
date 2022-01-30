from typing import List

from sqlalchemy.orm import Session
from sqlalchemy import Column, func, select
from . import crud, schemas
from .models import Interval, Activity, Association, Entry
from .database import SessionLocal, engine
import datetime
from dateutil import parser
import copy


class Stmt:
    entryEmptyTime = (
        select(Entry).where(Entry.time.is_(None)).order_by(Entry.interval_id)
    )
    intervalMeta = select(
        func.count(Interval.id).label("count"),
        func.min(Interval.start).label("min_start"),
        func.max(Interval.end).label("max_end"),
    )


with SessionLocal() as session:
    """"""
    stmt = Stmt.intervalMeta
    res = session.execute(stmt).all()
    for r in res:
        print(r)
    # session.commit()
