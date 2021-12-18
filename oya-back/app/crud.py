from sqlalchemy.orm import Session
import datetime
from . import models, schemas
from dateutil import parser
from copy import deepcopy


def get_activities(db: Session, skip: int = 0, limit: int = 10000):
    activities = db.query(models.Activity).order_by(models.Activity.id.desc()).offset(skip).limit(limit).all()
    return activities


def get_activity(db: Session, activity_id: int):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    return activity


def create_activity(db: Session, activity: schemas.ActivityCreate):
    db_activity = models.Activity(name=activity.name)
    if (activity.parentIds):
        db_activity.parents = db.query(models.Activity).filter(models.Activity.id.in_(activity.parentIds)).all()
    if (activity.childIds):
        db_activity.children = db.query(models.Activity).filter(models.Activity.id.in_(activity.childIds)).all()
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


def update_activity(db: Session, activity: schemas.ActivityUpdate, activity_id: int):
    db_activity = get_activity(db=db,activity_id=activity_id)
    if(db_activity):
        if(activity.parentIds != None):
            db_activity.parents = db.query(models.Activity).filter(models.Activity.id.in_(activity.parentIds)).all()
        if(activity.childIds != None):
            db_activity.children = db.query(models.Activity).filter(models.Activity.id.in_(activity.childIds)).all()
        if(activity.name):
            db_activity.name = activity.name
        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)
        return db_activity


def delete_activity(db: Session, activity_id: int):
    db_activity = get_activity(db=db,activity_id=activity_id)
    if(db_activity):
        db.delete(db_activity)
        db.commit()
        return db_activity


def get_intervals(db: Session, skip: int = 0, limit: int = 10000):
    intervals = db.query(models.Interval).order_by(models.Interval._end.desc()).offset(skip).limit(limit).all()
    return intervals


def create_interval(db: Session, interval: schemas.IntervalCreate):
    db_interval = models.Interval(
        start=parser.parse(interval.start),
        end=parser.parse(interval.end),
        note=interval.note
    )
    db.add(db_interval)
    db.commit()
    db.refresh(db_interval)
    if(interval.entries):
        for e in interval.entries:
            create_entry(db=db,entry=e,interval_id=db_interval.id)
        db.refresh(db_interval)
    return db_interval

def update_interval(db: Session, interval: schemas.IntervalUpdate, interval_id):
    db_interval = db.query(models.Interval).filter(models.Interval.id == interval_id).first()
    if not db_interval:
        return
    if(interval.note is not None):
        db_interval.note = interval.note
    if(interval.start is not None):
        db_interval.start = parser.parse(interval.start)
    if(interval.end is not None):
        db_interval.end = parser.parse(interval.end)
    for e in db_interval.entries:
        if(e.id not in list(map(lambda x: x.id,interval.entries))):
            delete_entry(db,entry_id=e.id)
    for e in interval.entries:
        if(e.id):
            update_entry(db=db,entry=e,entry_id=e.id)
        else:
            create_entry(db=db,entry=e,interval_id=interval_id)
    db.commit()
    db.refresh(db_interval)


    return db_interval

def delete_interval(db: Session, interval_id):
    db_interval = db.query(models.Interval).filter(models.Interval.id == interval_id).first()
    if not db_interval:
        raise ReferenceError('interval not exist')
    db.delete(db_interval)
    db.commit()


def get_entries(db: Session):
    return db.query(models.Entry).all()

def delete_entry(db: Session, entry_id):
    db_entry = db.query(models.Entry).filter(models.Entry.id==entry_id).first()
    if(not db_entry):
        raise ReferenceError('entry not found')
    db.delete(db_entry)
    db.commit()

def create_entry(db: Session, entry: schemas.EntryCreate,interval_id):
    db_interval = db.query(models.Interval).filter(models.Interval.id==interval_id).first()
    if not db_interval:
        raise ReferenceError('interval not found')
    activity_db = db.query(models.Activity).filter(models.Activity.id==entry.activity_id).first()
    if not activity_db:
        raise ReferenceError('activity not found')
    db_entry = models.Entry(**entry.dict(),interval_id=interval_id)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def update_entry(db: Session, entry: schemas.EntryUpdate,entry_id):
    db_entry = db.query(models.Entry).filter(models.Entry.id==entry_id).first()
    if not db_entry:
        raise ReferenceError('entry not found')
    e = entry.dict()
    for key in e:
        setattr(db_entry,key,e[key])
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry