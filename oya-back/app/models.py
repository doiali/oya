from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    DateTime,
    Interval as IntervalType,
    Text,
)
from sqlalchemy.orm import relationship, validates
from dateutil import parser
import datetime

from sqlalchemy.sql.schema import CheckConstraint
from .database import Base
from typing import Set, ForwardRef, List


class Association(Base):
    __tablename__ = "association"
    child_id = Column(Integer, ForeignKey("activities.id"), primary_key=True)
    parent_id = Column(Integer, ForeignKey("activities.id"), primary_key=True)
    order = Column(Integer)


Activity = ForwardRef("Activity")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String)
    parents = relationship(
        "Activity",
        secondary="association",
        primaryjoin=id == Association.child_id,
        secondaryjoin=id == Association.parent_id,
        back_populates="children",
    )
    children = relationship(
        "Activity",
        secondary="association",
        primaryjoin=id == Association.parent_id,
        secondaryjoin=id == Association.child_id,
        back_populates="parents",
    )

    @property
    def childIds(self):
        return sorted(list(map(lambda x: x.id, self.children)))

    @property
    def parentIds(self):
        return sorted(list(map(lambda x: x.id, self.parents)))

    @property
    def allParents(self):
        x = set()

        def recur(act: Activity):
            for parent in act.parents:
                if parent in x:
                    continue
                x.add(parent)
                recur(parent)

        recur(self)
        return sorted(x,key=lambda x:x.id)

    @property
    def allChildren(self):
        x = set()

        def recur(act: Activity):
            for child in act.children:
                if child in x:
                    continue
                x.add(child)
                recur(child)

        recur(self)
        return sorted(x,key=lambda x:x.id)

    @property
    def allChildIds(self):
        x = {self.id}
        for c in self.allChildren:
            x.add(c.id)
        return sorted(x)

    @property
    def allParentIds(self):
        x = {self.id}
        for p in self.allParents:
            x.add(p.id)
        return sorted(x)

    @validates("parents")
    def validate_parents(self, key, parent):
        if parent.id in self.allChildIds:
            raise ValueError("failed validation")
        return parent

    @validates("children")
    def validate_children(self, key, child):
        if child.id in self.allParentIds:
            raise ValueError("failed validation")
        return child

    entries = relationship("Entry", back_populates="activity", cascade="all")

    def __repr__(self):
        return f"<activity {self.id} {self.name}>"


class Interval(Base):
    __tablename__ = "intervals"
    __table_args__ = (
        CheckConstraint(
            "end_datetime > start_datetime",
            name="CK_intervals_end_datetime_gt_start_datetime",
        ),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    start_datetime: datetime.datetime = Column(DateTime(timezone=True), index=True)
    end_datetime: datetime.datetime = Column(DateTime(timezone=True), index=True)
    note = Column(Text)

    @property
    def start(self):
        return datetime.datetime.isoformat(self.start_datetime)

    @property
    def end(self):
        return datetime.datetime.isoformat(self.end_datetime)

    @start.setter
    def start(self, t):
        self.start_datetime = t

    @end.setter
    def end(self, t):
        self.end_datetime = t

    entries = relationship("Entry", back_populates="interval", cascade="all")

    def __repr__(self):
        return (
            f"<interval {self.start_datetime} to {self.end_datetime}: {self.entries}>"
        )


class Entry(Base):
    __tablename__ = "entries"

    interval_id = Column(Integer, ForeignKey("intervals.id"), primary_key=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), primary_key=True)
    time = Column(IntervalType)
    note = Column(Text)

    interval = relationship(Interval, back_populates="entries")
    activity = relationship(Activity, back_populates="entries")

    def __repr__(self):
        return f"{self.activity.name}"
