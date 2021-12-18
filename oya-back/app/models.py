from sqlalchemy import Boolean, Column, ForeignKey, Integer, \
    String, DateTime, Float, Text
from sqlalchemy.orm import relationship, validates
from dateutil import parser
import datetime
from .database import Base


class Association(Base):
    __tablename__ = 'association'
    id = Column(Integer, primary_key=True, autoincrement=True)
    child_id = Column(Integer, ForeignKey('activities.id'))
    parent_id = Column(Integer, ForeignKey('activities.id'), nullable=True)
    order = Column(Integer)


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
    def allChildIds(self):
        x = {self.id}

        def recur(act: Activity):
            for child in act.children:
                if child.id in x:
                    continue
                x.add(child.id)
                recur(child)

        recur(self)
        return x

    @property
    def allParentIds(self):
        x = {self.id}

        def recur(act: Activity):
            for parent in act.parents:
                if parent.id in (x):
                    continue
                x.add(parent.id)
                recur(parent)

        recur(self)
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


class Interval(Base):
    __tablename__ = "intervals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    _start = Column(DateTime, index=True)
    _end = Column(DateTime, index=True)
    note = Column(Text)

    @property
    def start(self):
        return datetime.datetime.isoformat(self._start)

    @property
    def end(self):
        return datetime.datetime.isoformat(self._end)

    @start.setter
    def start(self, t):
        self._start = t

    @end.setter
    def end(self, t):
        self._end = t

    @validates('_started', '_end')
    def validate_dates(self, key, field):
        if key == '_end' and isinstance(self._start, datetime.datetime):
            if self._start >= field:
                raise AssertionError("The end field must be "
                                     "greater than the start field")
        elif key == '_started' and isinstance(self._end, datetime.datetime):
            if self._end <= field:
                raise AssertionError("The end field must be "
                                     "greater than the start field")
        return field

    entries = relationship('Entry', back_populates="interval", cascade='all')


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
