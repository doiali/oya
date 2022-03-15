from sqlalchemy.orm import Session
from sqlalchemy import select
import datetime
from typing import List
from .. import schemas
from ..schemas.auth import User as UserSchema
from fastapi import APIRouter, Depends
from ..database import get_db
from .auth import get_current_user
from ..controllers.report import get_report_cte


router = APIRouter()


@router.get("/totals/", tags=["Reports"], response_model=schemas.report.ReportBase)
async def get_total_report(
    from_date: datetime.date | datetime.datetime = None,
    to_date: datetime.date | datetime.datetime = None,
    tick: datetime.timedelta = datetime.timedelta(days=1),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(get_current_user),
):
    (sq, common_columns) = get_report_cte(
        db=db, from_date=from_date, to_date=to_date, tick=tick, user=user
    )
    stmt = select(*common_columns)
    return db.execute(stmt).first()


@router.get(
    "/totals-periodic/",
    tags=["Reports"],
    response_model=List[schemas.report.ReportPeriodic],
)
def get_periodic_total_report(
    from_date: datetime.date | datetime.datetime = None,
    to_date: datetime.date | datetime.datetime = None,
    tick: datetime.timedelta = datetime.timedelta(days=1),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(get_current_user),
):
    (sq, common_columns) = get_report_cte(
        db=db, from_date=from_date, to_date=to_date, tick=tick, user=user
    )
    stmt = (
        select(sq.c.index, *common_columns)
        .group_by(sq.c.index)
        .order_by(sq.c.index.desc())
    )
    return db.execute(stmt).all()


@router.get(
    "/activities/",
    tags=["Reports"],
    response_model=List[schemas.report.ReportActivities],
)
def get_activities_report(
    from_date: datetime.date | datetime.datetime = None,
    to_date: datetime.date | datetime.datetime = None,
    tick: datetime.timedelta = datetime.timedelta(days=1),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(get_current_user),
):
    (sq, common_columns) = get_report_cte(
        db=db, from_date=from_date, to_date=to_date, tick=tick, user=user
    )
    stmt = (
        select(sq.c.parent_id.label("activity_id"), *common_columns)
        .group_by(sq.c.parent_id)
        .order_by(sq.c.parent_id)
    )
    return db.execute(stmt).all()


@router.get(
    "/activities-periodic/",
    tags=["Reports"],
    response_model=List[schemas.report.ReportActivitiesPeriodic],
)
def get_periodic_activities_report(
    from_date: datetime.date | datetime.datetime = None,
    to_date: datetime.date | datetime.datetime = None,
    tick: datetime.timedelta = datetime.timedelta(days=1),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(get_current_user),
):
    (sq, common_columns) = get_report_cte(
        db=db, from_date=from_date, to_date=to_date, tick=tick, user=user
    )
    stmt = (
        select(sq.c.index, sq.c.parent_id.label("activity_id"), *common_columns)
        .group_by(sq.c.index, sq.c.parent_id)
        .order_by(sq.c.index.desc(), sq.c.parent_id)
    )
    return db.execute(stmt).all()


@router.get(
    "/activities-periodic/{activitiy_id}/",
    tags=["Reports"],
    response_model=List[schemas.report.ReportActivitiesPeriodic],
)
def get_periodic_activities_report(
    activitiy_id: int,
    from_date: datetime.date | datetime.datetime = None,
    to_date: datetime.date | datetime.datetime = None,
    tick: datetime.timedelta = datetime.timedelta(days=1),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(get_current_user),
):
    (sq, common_columns) = get_report_cte(
        db=db, from_date=from_date, to_date=to_date, tick=tick, user=user
    )
    stmt = (
        select(sq.c.index, sq.c.parent_id.label("activity_id"), *common_columns)
        .where(sq.c.parent_id == activitiy_id)
        .group_by(sq.c.index, sq.c.parent_id)
        .order_by(sq.c.index.desc(), sq.c.parent_id)
    )
    return db.execute(stmt).all()
