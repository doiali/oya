from sqlalchemy import Boolean, Column, ForeignKey, Integer, \
    String, DateTime, Float, Text
from sqlalchemy.orm import relationship, validates
from dateutil import parser
import datetime
from .database import Base
from typing import Set, ForwardRef, List


class Association(Base):
    __tablename__ = 'association'
    id = Column(Integer, primary_key=True, autoincrement=True)
    child_id = Column(Integer, ForeignKey('activities.id'))
    parent_id = Column(Integer, ForeignKey('activities.id'), nullable=True)
    order = Column(Integer)


Activity = ForwardRef('Activity')


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String)
    parents = relationship(
        'Activity',
        secondary='association',
        primaryjoin=id == Association.child_id,
        secondaryjoin=id == Association.parent_id,
        back_populates='children'
    )
    children = relationship(
        'Activity',
        secondary='association',
        primaryjoin=id == Association.parent_id,
        secondaryjoin=id == Association.child_id,
        back_populates='parents'
    )

    @property
    def childIds(self):
        return list(map(lambda x: x.id, self.children))

    @property
    def parentIds(self):
        return list(map(lambda x: x.id, self.parents))

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
        return x

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
        return x

    @property
    def allChildIds(self):
        x = {self.id}
        for c in self.allChildren:
            x.add(c.id)
        return x

    @property
    def allParentIds(self):
        x = {self.id}
        for p in self.allParents:
            x.add(p.id)
        return x

    @validates('parents')
    def validate_parents(self, key, parent):
        if parent.id in self.allChildIds:
            raise ValueError("failed validation")
        return parent

    @validates('children')
    def validate_children(self, key, child):
        if child.id in self.allParentIds:
            raise ValueError("failed validation")
        return child

    entries = relationship('Entry', back_populates='activity', cascade='all')

    def __repr__(self):
        return f"<activity {self.id} {self.name}>"


class Interval(Base):
    __tablename__ = "intervals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    start_datetime: datetime.datetime = Column(DateTime, index=True)
    end_datetime: datetime.datetime = Column(DateTime, index=True)
    note = Column(Text)

    @property
    def start(self):
        return datetime.datetime.isoformat(self.start_datetime)

    @property
    def end(self):
        return datetime.datetime.isoformat(self.end_datetime)

    @property
    def start_date(self) -> datetime.date:
        return self.start_datetime.date()

    @property
    def end_date(self) -> datetime.date:
        return self.end_datetime.date()

    @start.setter
    def start(self, t):
        self.start_datetime = t

    @end.setter
    def end(self, t):
        self.end_datetime = t

    @validates('_started', '_end')
    def validate_dates(self, key, field):
        if key == '_end' and isinstance(self.start_datetime, datetime.datetime):
            if self.start_datetime >= field:
                raise AssertionError("The end field must be "
                                     "greater than the start field")
        elif key == '_started' and isinstance(self.end_datetime, datetime.datetime):
            if self.end_datetime <= field:
                raise AssertionError("The end field must be "
                                     "greater than the start field")
        return field

    entries = relationship('Entry', back_populates="interval", cascade='all')

    def __repr__(self):
        return f'<interval {self.start_datetime} to {self.end_datetime}: {self.entries}>'


class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    interval_id = Column(Integer, ForeignKey("intervals.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    dedication = Column(Float)
    note = Column(Text)

    interval = relationship(Interval, back_populates="entries")
    activity = relationship(Activity, back_populates="entries")

    @property
    def activity_name(self):
        return self.activity.name

    def __repr__(self):
        return f"{self.activity.name}"
