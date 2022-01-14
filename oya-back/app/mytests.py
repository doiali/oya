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
x0 = parser.parse('2022-01-13T13:30:00+03:30')
x1 = datetime.datetime(year=2022, month=1, day=14,hour=14)
x2 = x1 + datetime.timedelta(days=1)
print(type(x0.time()))
crud.get_daily_report(db=db,date=x0.date())
# for a in res:
#     print(a)
#     # print(a.start_datetime, " " , a.end_datetime, a.entries)
#     # for x in a:
#     #     print(x,end=' --- ')
#     # print("")
