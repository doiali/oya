import datetime
from typing import List

from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .. import schemas, controllers
from ..database import get_db
from ..controllers.auth import get_current_user


router = APIRouter()


@router.get("/activities/", tags=["Activities"], response_model=List[schemas.main.Activity])
def read_activities(db: Session = Depends(get_db), user=Depends(get_current_user)):
    activities = controllers.main.get_activities(db=db, user=user)
    return activities


@router.post("/activities/", tags=["Activities"], response_model=schemas.main.Activity)
def create_activity(
    activity: schemas.main.ActivityCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        return controllers.main.create_activity(db=db, activity=activity, user=user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"{e}")
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"{e.orig}")


@router.delete(
    "/activities/{activity_id}", tags=["Activities"], response_model=schemas.main.Activity
)
def delete_activity(
    activity_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    deleted_activity = controllers.main.delete_activity(db=db, activity_id=activity_id, user=user)
    if not deleted_activity:
        raise HTTPException(status_code=400, detail="activity not found")
    return deleted_activity


@router.put(
    "/activities/{activity_id}", tags=["Activities"], response_model=schemas.main.Activity
)
def update_activity(
    activity_id: int,
    activity: schemas.main.ActivityUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        updated_activity = controllers.main.update_activity(
            db=db, activity=activity, activity_id=activity_id, user=user
        )
        if not updated_activity:
            raise HTTPException(status_code=400, detail="activity not found")
        return updated_activity
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"{e}")
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"{e.orig}")


@router.get("/intervals/", tags=["Intervals"], response_model=schemas.main.IntervalsResponse)
def get_intervals_data(
    skip: int = 0,
    limit: int = 5000,
    from_date: datetime.date | datetime.datetime = None,
    to_date: datetime.date | datetime.datetime = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    intervals = controllers.main.get_intervals(
        db=db, skip=skip, limit=limit, user=user, from_date=from_date, to_date=to_date
    )
    meta = controllers.main.get_intervals_meta(
        db=db, user=user, from_date=from_date, to_date=to_date
    )
    return {"meta": meta, "data": intervals}


@router.post("/intervals/", tags=["Intervals"], response_model=schemas.main.Interval)
def create_interval(
    interval: schemas.main.IntervalCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return controllers.main.create_interval(db=db, interval=interval, user=user)


@router.put(
    "/intervals/{interval_id}", tags=["Intervals"], response_model=schemas.main.Interval
)
def update_interval(
    interval: schemas.main.IntervalCreate,
    interval_id,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return controllers.main.update_interval(
        db=db, interval_id=interval_id, interval=interval, user=user
    )


@router.delete("/intervals/{interval_id}", tags=["Intervals"], status_code=204)
def delete_interval(
    interval_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    try:
        controllers.main.delete_interval(db=db, interval_id=interval_id, user=user)
    except ReferenceError:
        raise HTTPException(status_code=400, detail="interval not found")
