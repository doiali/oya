from typing import List

from sqlalchemy.orm import Session
from sqlalchemy import Column
from . import crud, models, schemas
from .database import SessionLocal, engine
import datetime
from dateutil import parser
import copy

models.Base.metadata.create_all(bind=engine)
db: Session = SessionLocal()

x1 = datetime.datetime(year=2021, month=12, day=15)
x2 = x1 + datetime.timedelta(days=1)

results: List[models.Interval] = db.query(models.Interval) \
    .where(x1 < models.Interval.start_datetime).where(models.Interval.start_datetime < x2)
for a in results:
    print(a.start_datetime)
