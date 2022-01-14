from sqlalchemy.orm import Session
import datetime
from . import models, schemas
from dateutil import parser
from copy import deepcopy


def get_activities(db: Session, skip: int = 0, limit: int = 10000):
    activities = db.query(models.Activity).order_by(models.Activity.id.desc()).\
        offset(skip).limit(limit).all()
    return activities


def get_activity(db: Session, activity_id: int):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    return activity


def create_activity(db: Session, activity: schemas.ActivityCreate):
    db_activity = models.Activity(name=activity.name)
    if activity.parentIds:
        db_activity.parents = db.query(models.Activity).\
            filter(models.Activity.id.in_(activity.parentIds)).all()
    if activity.childIds:
        db_activity.children = db.query(models.Activity).\
            filter(models.Activity.id.in_(activity.childIds)).all()
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


def update_activity(db: Session, activity: schemas.ActivityUpdate, activity_id: int):
    db_activity = get_activity(db=db, activity_id=activity_id)
    if db_activity:
        if activity.parentIds is not None:
            db_activity.parents = db.query(models.Activity).\
                filter(models.Activity.id.in_(activity.parentIds)).all()
        if activity.childIds is not None:
            db_activity.children = db.query(models.Activity).\
                filter(models.Activity.id.in_(activity.childIds)).all()
        if activity.name:
            db_activity.name = activity.name
        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)
        return db_activity


def delete_activity(db: Session, activity_id: int):
    db_activity = get_activity(db=db, activity_id=activity_id)
    if db_activity:
        db.delete(db_activity)
        db.commit()
        return db_activity


def get_intervals(db: Session, skip: int = 0, limit: int = 10000):
    intervals = db.query(models.Interval).\
        order_by(models.Interval.end_datetime.desc()).offset(skip).limit(limit).all()
    return intervals


def create_interval(db: Session, interval: schemas.IntervalCreate):
    db_interval = models.Interval(
        start=parser.parse(interval.start),
        end=parser.parse(interval.end),
        note=interval.note,
    )
    for e in interval.entries:
        db_interval.entries.append(
            models.Entry(activity_id=e.activity.id, note=e.note)
        )
    db.add(db_interval)
    db.commit()
    db.refresh()
    return db_interval


def update_interval(db: Session, interval: schemas.IntervalCreate, interval_id):
    db_interval = db.get(models.Interval,interval_id)
    if not db_interval:
        return
    if interval.note is not None:
        db_interval.note = interval.note
    if interval.start is not None:
        db_interval.start = parser.parse(interval.start)
    if interval.end is not None:
        db_interval.end = parser.parse(interval.end)
    new_entries = []
    for e in db_interval.entries:
        if e.activity.id not in [ x.activity.id for x in interval.entries]:
            db.delete(e)
    for e in interval.entries:
        db_entry = db.get(models.Entry,{"activity_id":e.activity.id, "interval_id":interval_id})
        print(db_entry)
        if db_entry:
            db_entry.note = e.note
            new_entries.append(db_entry)
        else:
            new_entries.append(models.Entry(note=e.note, activity_id=e.activity.id))
    db_interval.entries = new_entries
    db.commit()
    db.refresh(db_interval)
    return db_interval


def delete_interval(db: Session, interval_id):
    db_interval = db.query(models.Interval).filter(models.Interval.id == interval_id).first()
    if not db_interval:
        raise ReferenceError('interval not exist')
    db.delete(db_interval)
    db.commit()

