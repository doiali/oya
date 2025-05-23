from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, select
from ..schemas.auth import User as UserSchema
import datetime
from .. import models, schemas
from ..models import Interval, Activity, Entry

e403 = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="you don't have permission"
)


def get_activities(*, user: UserSchema, db: Session, skip: int = 0, limit: int = 10000):
    stmt = (
        select(models.Activity)
        .options(
            joinedload(models.Activity.parents), joinedload(models.Activity.children)
        )
        .where(models.Activity.user_id == user.id)
        .order_by(models.Activity.id.desc())
        .offset(skip)
        .limit(limit)
    )
    activities = db.execute(stmt).scalars().unique().all()
    return activities


def get_activity(*, user: UserSchema, db: Session, activity_id: int):
    activity = db.get(models.Activity, activity_id)
    if activity.user_id != user.id:
        raise e403
    return activity


def create_activity(
    *, user: UserSchema, db: Session, activity: schemas.main.ActivityCreate
):
    db_activity = models.Activity(
        name=activity.name, is_suspended=activity.is_suspended, user_id=user.id
    )
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


def update_activity(
    *,
    user: UserSchema,
    db: Session,
    activity: schemas.main.ActivityUpdate,
    activity_id: int,
):
    db_activity = db.get(Activity, activity_id)
    if db_activity.user_id != user.id:
        raise e403
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
        db.commit()
        db.refresh(db_activity)
        return db_activity


def delete_activity(*, user: UserSchema, db: Session, activity_id: int):
    db_activity = db.get(Activity, activity_id)
    if db_activity:
        if db_activity.user_id != user.id:
            raise e403
        db.delete(db_activity)
        db.commit()
        return db_activity


def get_intervals(
    *,
    user: UserSchema,
    db: Session,
    skip: int = 0,
    limit: int = 10000,
    from_date: datetime.datetime = None,
    to_date: datetime.datetime = None,
):
    stmt = (
        select(models.Interval)
        .options(joinedload(models.Interval.entries))
        .where(models.Interval.user_id == user.id)
        .order_by(models.Interval.end.desc())
        .offset(skip)
        .limit(limit)
    )
    if from_date is not None:
        stmt = stmt.where(Interval.end >= from_date)
    if to_date is not None:
        stmt = stmt.where(Interval.start <= to_date)
    intervals = db.execute(stmt).scalars().unique().all()
    return intervals


def get_intervals_meta(
    *,
    user: UserSchema,
    db: Session,
    from_date: datetime.datetime = None,
    to_date: datetime.datetime = None,
):
    stmt = select(
        func.min(Interval.start).label("min"),
        func.max(Interval.end).label("max"),
        func.count(Interval.id).label("count"),
        func.sum(Interval.end - Interval.start).label("intervals_sum"),
    ).where(Interval.user_id == user.id)
    if from_date is not None:
        stmt = stmt.where(Interval.end >= from_date)
    if to_date is not None:
        stmt = stmt.where(Interval.start <= to_date)
    meta = db.execute(stmt).first()
    return meta


def create_interval(
    *, user: UserSchema, db: Session, interval: schemas.main.IntervalCreate
):
    db_interval = models.Interval(
        start=interval.start,
        end=interval.end,
        note=interval.note,
        user_id=user.id,
    )
    for e in interval.entries:
        db_interval.entries.append(models.Entry(**e.dict()))
    db.add(db_interval)
    db.commit()
    db.refresh(db_interval)
    return db_interval


def update_interval(
    *, user: UserSchema, db: Session, interval: schemas.main.IntervalCreate, interval_id
):
    db_interval = db.get(models.Interval, interval_id)
    if db_interval.user_id != user.id:
        raise e403
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


def delete_interval(*, user: UserSchema, db: Session, interval_id):
    db_interval = (
        db.query(models.Interval).filter(models.Interval.id == interval_id).first()
    )
    if db_interval.user_id != user.id:
        raise e403
    if not db_interval:
        raise ReferenceError("interval not exist")
    db.delete(db_interval)
    db.commit()
