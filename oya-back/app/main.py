from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "https://localhost:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/activities/", tags=["Activities"], response_model=List[schemas.Activity])
def read_activities(db: Session = Depends(get_db)):
    activities = crud.get_activities(db)
    return activities


@app.post("/activities/", tags=["Activities"], response_model=schemas.Activity)
def create_activity(activity: schemas.ActivityCreate, db: Session = Depends(get_db)):
    return crud.create_activity(db=db, activity=activity)


@app.delete("/activities/{activity_id}", tags=["Activities"], response_model=schemas.Activity)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    deleted_activity = crud.delete_activity(db=db, activity_id=activity_id)
    if not deleted_activity:
        raise HTTPException(status_code=400, detail="activity not found")
    return deleted_activity


@app.put("/activities/{activity_id}", tags=["Activities"], response_model=schemas.Activity)
def update_activity(activity_id: int, activity: schemas.ActivityUpdate, db: Session = Depends(get_db)):
    try:
        updated_activity = crud.update_activity(db=db, activity=activity, activity_id=activity_id)
        if not updated_activity:
            raise HTTPException(status_code=400, detail="activity not found")
        return updated_activity
    except ValueError:
        raise HTTPException(status_code=400, detail="you are creating a loop!")


@app.get("/intervals/", tags=["Intervals"], response_model=List[schemas.Interval])
def get_intervals(db: Session = Depends(get_db)):
    return crud.get_intervals(db=db)


@app.post("/intervals/", tags=["Intervals"], response_model=schemas.Interval)
def create_interval(interval: schemas.IntervalCreate, db: Session = Depends(get_db)):
    return crud.create_interval(db=db, interval=interval)


@app.put("/intervals/{interval_id}", tags=["Intervals"], response_model=schemas.Interval)
def update_interval(interval: schemas.IntervalUpdate, interval_id, db: Session = Depends(get_db)):
    return crud.update_interval(db=db, interval_id=interval_id, interval=interval)


@app.delete("/intervals/{interval_id}", tags=["Intervals"], status_code=204)
def delete_interval(interval_id: int, db: Session = Depends(get_db)):
    try:
        crud.delete_interval(db=db, interval_id=interval_id)
    except ReferenceError:
        raise HTTPException(status_code=400, detail="interval not found")
