from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
import datetime
from . import models, schemas
from .models import Interval, Activity, Entry
from copy import deepcopy


def get_activities(db: Session, skip: int = 0, limit: int = 10000):
    stmt = (
        select(models.Activity)
        .options(
            joinedload(models.Activity.parents), joinedload(models.Activity.children)
        )
        .order_by(models.Activity.id.desc())
        .offset(skip)
        .limit(limit)
    )
    activities = db.execute(stmt).scalars().unique().all()
    return activities


def get_activity(db: Session, activity_id: int):
    activity = db.get(models.Activity, activity_id)
    return activity


def create_activity(db: Session, activity: schemas.ActivityCreate):
    db_activity = models.Activity(name=activity.name, is_suspended=activity.is_suspended)
    db.add(db_activity)
    db.flush()
    if activity.parentIds:
        db_activity.parents[:] = (
            db.query(models.Activity)
            .filter(models.Activity.id.in_(activity.parentIds))
            .all()
        )
    if activity.childIds:
        db_activity.children[:] = (
            db.query(models.Activity)
            .filter(models.Activity.id.in_(activity.childIds))
            .all()
        )
    db.commit()
    db.refresh(db_activity)
    return db_activity


def update_activity(db: Session, activity: schemas.ActivityUpdate, activity_id: int):
    db_activity = get_activity(db=db, activity_id=activity_id)
    if db_activity:
        if activity.parentIds is not None:
            db_activity.parents[:] = (
                db.query(models.Activity)
                .filter(models.Activity.id.in_(activity.parentIds))
                .all()
            )
        if activity.childIds is not None:
            db_activity.children[:] = (
                db.query(models.Activity)
                .filter(models.Activity.id.in_(activity.childIds))
                .all()
            )
        if activity.name:
            db_activity.name = activity.name
        if activity.is_suspended is not None:
            db_activity.is_suspended = activity.is_suspended
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
    stmt = (
        select(models.Interval)
        .options(joinedload(models.Interval.entries))
        .order_by(models.Interval.end.desc())
        .offset(skip)
        .limit(limit)
    )
    intervals = db.execute(stmt).scalars().unique().all()
    return intervals


def get_daily_report(db: Session, date: datetime.date):
    stmt = (
        select(Interval)
        .options(
            joinedload(Interval.entries)
            .joinedload(Entry.activity)
            .joinedload(Activity.parents)
        )
        .where(
            Interval.start.between(date, date + datetime.timedelta(days=1))
            | Interval.end.between(date, date + datetime.timedelta(days=1))
        )
        .order_by(Interval.end.desc())
    )
    res = db.execute(stmt).unique().scalars()
    periods = []
    report = {}
    for row in res:
        obj = {
            "s": str(row.start_datetime.time())[0:5]
            if row.start_datetime.date() >= date
            else "00:00",
            "e": str(row.end_datetime.time())[0:5]
            if row.end_datetime.date() < date + datetime.timedelta(days=1)
            else "24:00",
            "note": row.note,
            "entries": row.entries,
        }
        obj["d"] = (
            int(obj["e"][0:2]) * 60
            + int(obj["e"][3:5])
            - int(obj["s"][0:2]) * 60
            - int(obj["s"][3:5])
        )
        delta = datetime.timedelta(minutes=obj["d"])
        periods.append(obj)
        for e in row.entries:
            for a in [e.activity, *e.activity.allParents]:
                if str(a.id) not in report:
                    report[str(a.id)] = {
                        "activity": a,
                        "duration": obj["d"],
                        "occurance": 1,
                    }
                else:
                    report[str(a.id)]["duration"] += obj["d"]
                    report[str(a.id)]["occurance"] += 1
    return {
        "date": str(date),
        "report": report,
        "periods": periods,
    }
    #     print(obj["s"], obj["e"], obj["entries"] , row)
    # print(report)


def create_interval(db: Session, interval: schemas.IntervalCreate):
    db_interval = models.Interval(
        start=interval.start,
        end=interval.end,
        note=interval.note,
    )
    for e in interval.entries:
        db_interval.entries.append(models.Entry(**e.dict()))
    db.add(db_interval)
    db.commit()
    db.refresh(db_interval)
    return db_interval


def update_interval(db: Session, interval: schemas.IntervalCreate, interval_id):
    db_interval = db.get(models.Interval, interval_id)
    if not db_interval:
        return
    if interval.note is not None:
        db_interval.note = interval.note
    if interval.start is not None:
        db_interval.start = interval.start
    if interval.end is not None:
        db_interval.end = interval.end
    new_entries = []
    for e in db_interval.entries:
        if e.activity_id not in [x.activity_id for x in interval.entries]:
            db.delete(e)
    for e in interval.entries:
        db_entry = db.get(
            models.Entry, {"activity_id": e.activity_id, "interval_id": interval_id}
        )
        if db_entry:
            db_entry.note = e.note
            db_entry.time = e.time
            new_entries.append(db_entry)
        else:
            new_entries.append(models.Entry(**e.dict()))
    db_interval.entries = new_entries
    db.commit()
    db.refresh(db_interval)
    return db_interval


def delete_interval(db: Session, interval_id):
    db_interval = (
        db.query(models.Interval).filter(models.Interval.id == interval_id).first()
    )
    if not db_interval:
        raise ReferenceError("interval not exist")
    db.delete(db_interval)
    db.commit()
