from typing import List

from sqlalchemy import Column, func, select
from sqlalchemy.orm import Session
from app import schemas
from app.models import Interval, Activity, Association, Entry, User
from app.database import SessionLocal, engine
import datetime
from dateutil import parser
import copy
import json


class Stmt:
    entires = select(Entry)
    activities = select(Activity)
    associations = select(Association)
    intervals = select(Interval).order_by(Interval.end.desc())


user_id = 1

with SessionLocal() as session:
    """"""
    intervals = (
        session.execute(
            select(Interval)
            .where(Interval.user_id == user_id)
            .order_by(Interval.start.asc())
        )
        .scalars()
        .all()
    )
    intervals_data = []
    id = "1"
    for interval in intervals:
        for entry in interval.entries:
            note = None
            if entry.note:
                note = entry.activity.name + ": " + entry.note
            if interval.note:
                if note is not None:
                    note = note + "  \n" + interval.note
                else:
                    note = interval.note
            entry_data = {
                "id": id,
                "legacyId": interval.id,
                "start": interval.start,
                "end": interval.start + entry.time,
                "activityId": str(entry.activity_id),
                "note": note,
            }
            intervals_data.append(entry_data)
            id = str(int(id) + 1)

    activites = (
        session.execute(
            select(Activity).where(Activity.user_id == user_id).order_by(Activity.id)
        )
        .scalars()
        .all()
    )
    activities_data = []
    for activity in activites:
        parent_id = None
        if activity.parents:
            parent_id = str(activity.parents[0].id)
        activity_data = {
            "id": str(activity.id),
            "name": activity.name,
            "parentId": parent_id,
        }
        activities_data.append(activity_data)
    output_file = "data.json"
    data = {
        "entries": intervals_data,
        "activities": activities_data,
    }
    with open(output_file, "w") as f:
        json.dump(data, f, default=str, indent=4)
