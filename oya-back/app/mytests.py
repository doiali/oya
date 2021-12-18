from sqlalchemy.orm import Session
from sqlalchemy import Column
from . import crud, models, schemas
from .database import SessionLocal, engine
import datetime
from dateutil import parser
import copy

models.Base.metadata.create_all(bind=engine)
db: Session = SessionLocal()

db_e = models.Entry(note='test1',activity_id=1,interval_id=1,dedication=100)
db.add(db_e)
db.commit()
db.refresh(db_e)
print(db_e.id)
x = db_e.id
print(x)
yyy = db.query(models.Entry).filter(models.Entry.id==x).first()
print(yyy.id,yyy.note,yyy.activity.name)
q = copy.copy(yyy)
db.delete(yyy)
db.commit()
print(q.id,q.note,q.activity.name)