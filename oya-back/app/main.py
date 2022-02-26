import datetime
from typing import List
from dateutil import parser

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from . import crud, models, schemas
from .database import engine, get_db
from .auth import get_current_user, router

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(router)

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3022",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/activities/", tags=["Activities"], response_model=List[schemas.Activity])
def read_activities(db: Session = Depends(get_db), user=Depends(get_current_user)):
    activities = crud.get_activities(db=db, user=user)
    return activities


@app.post("/activities/", tags=["Activities"], response_model=schemas.Activity)
def create_activity(
    activity: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        return crud.create_activity(db=db, activity=activity, user=user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"{e}")
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"{e.orig}")


@app.delete(
    "/activities/{activity_id}", tags=["Activities"], response_model=schemas.Activity
)
def delete_activity(
    activity_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    deleted_activity = crud.delete_activity(db=db, activity_id=activity_id, user=user)
    if not deleted_activity:
        raise HTTPException(status_code=400, detail="activity not found")
    return deleted_activity


@app.put(
    "/activities/{activity_id}", tags=["Activities"], response_model=schemas.Activity
)
def update_activity(
    activity_id: int,
    activity: schemas.ActivityUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        updated_activity = crud.update_activity(
            db=db, activity=activity, activity_id=activity_id, user=user
        )
        if not updated_activity:
            raise HTTPException(status_code=400, detail="activity not found")
        return updated_activity
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"{e}")
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"{e.orig}")


@app.get(
    "/intervals/metadata",
    tags=["Intervals"],
    response_model=schemas.IntervalsMeta,
)
def get_intervals_metadata(
    from_date: datetime.date | datetime.datetime = None,
    to_date: datetime.date | datetime.datetime = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return crud.get_intervals_meta(
        db=db, user=user, from_date=from_date, to_date=to_date
    )


@app.get("/intervals/", tags=["Intervals"], response_model=List[schemas.Interval])
def get_intervals(
    skip: int = 0,
    limit: int = 5000,
    from_date: datetime.date | datetime.datetime = None,
    to_date: datetime.date | datetime.datetime = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return crud.get_intervals(
        db=db, skip=skip, limit=limit, user=user, from_date=from_date, to_date=to_date
    )


@app.get(
    "/intervals-new/", tags=["Intervals"], response_model=schemas.IntervalsResponse
)
def get_intervals_data(
    skip: int = 0,
    limit: int = 5000,
    from_date: datetime.date | datetime.datetime = None,
    to_date: datetime.date | datetime.datetime = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    intervals = crud.get_intervals(
        db=db, skip=skip, limit=limit, user=user, from_date=from_date, to_date=to_date
    )
    meta = crud.get_intervals_meta(
        db=db, user=user, from_date=from_date, to_date=to_date
    )
    return { "meta": meta, "data": intervals}


@app.get("/daily_report/", tags=["Reports"], response_model=schemas.DailyReport)
def get_daily_report(
    date: str, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    return crud.get_daily_report(db=db, date=parser.parse(date).date(), user=user)


@app.post("/intervals/", tags=["Intervals"], response_model=schemas.Interval)
def create_interval(
    interval: schemas.IntervalCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return crud.create_interval(db=db, interval=interval, user=user)


@app.put(
    "/intervals/{interval_id}", tags=["Intervals"], response_model=schemas.Interval
)
def update_interval(
    interval: schemas.IntervalCreate,
    interval_id,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return crud.update_interval(
        db=db, interval_id=interval_id, interval=interval, user=user
    )


@app.delete("/intervals/{interval_id}", tags=["Intervals"], status_code=204)
def delete_interval(
    interval_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    try:
        crud.delete_interval(db=db, interval_id=interval_id, user=user)
    except ReferenceError:
        raise HTTPException(status_code=400, detail="interval not found")
