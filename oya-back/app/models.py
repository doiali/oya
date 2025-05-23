from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    DateTime,
    Interval as IntervalType,
    Text,
    desc,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship, validates
from dateutil import parser
import datetime
from fastapi import HTTPException, status
from sqlalchemy.sql.schema import CheckConstraint
from .database import Base
from typing import Set, ForwardRef, List

e403 = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="you don't have permission"
)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    email = Column(String, nullable=True, unique=True)
    firstname = Column(String, nullable=True)
    lastname = Column(String, nullable=True)
    superuser = Column(Boolean, nullable=True)

    intervals = relationship("Interval", back_populates="user")
    activities = relationship("Activity", back_populates="user")

    def __repr__(self):
        return f"<User {self.id} - {self.username}>"


class Association(Base):
    __tablename__ = "association"
    child_id = Column(Integer, ForeignKey("activities.id"), primary_key=True)
    parent_id = Column(Integer, ForeignKey("activities.id"), primary_key=True)
    order = Column(Integer)


class Activity(Base):
    __tablename__ = "activities"
    __table_arg__ = (
        UniqueConstraint('user_id','name'),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    name = Column(String)
    is_suspended = Column(Boolean, default=False, nullable=False)

    user = relationship(User, back_populates="activities")
    parents = relationship(
        "Activity",
        secondary="association",
        primaryjoin=id == Association.child_id,
        secondaryjoin=id == Association.parent_id,
        back_populates="children",
        order_by=lambda: desc(Activity.id),
    )
    children = relationship(
        "Activity",
        secondary="association",
        primaryjoin=id == Association.parent_id,
        secondaryjoin=id == Association.child_id,
        back_populates="parents",
        order_by=lambda: desc(Activity.id),
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

        def recur(act):
            for parent in act.parents:
                if parent in x:
                    continue
                x.add(parent)
                recur(parent)

        recur(self)
        return sorted(x, key=lambda x: x.id)

    @property
    def allChildren(self):
        x = set()

        def recur(act):
            for child in act.children:
                if child in x:
                    continue
                x.add(child)
                recur(child)

        recur(self)
        return sorted(x, key=lambda x: x.id)

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
            raise ValueError("you are creating a loop")
        if parent.user_id != self.user_id:
            raise e403
        return parent

    @validates("children")
    def validate_children(self, key, child):
        if child.id in self.allParentIds:
            raise ValueError("you are creating a loop")
        if child.user_id != self.user_id:
            raise e403
        return child

    entries = relationship("Entry", back_populates="activity")

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
    user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    start = Column(DateTime(timezone=True), index=True)
    end = Column(DateTime(timezone=True), index=True)
    note = Column(Text)

    entries = relationship("Entry", back_populates="interval", cascade="all")
    user = relationship(User, back_populates="intervals")

    def __repr__(self):
        return f"<interval {self.start} to {self.end}: {self.entries}>"


class Entry(Base):
    __tablename__ = "entries"

    interval_id = Column(Integer, ForeignKey("intervals.id",), primary_key=True)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="RESTRICT"), primary_key=True)
    time = Column(IntervalType)
    note = Column(Text)

    interval = relationship(Interval, back_populates="entries")
    activity = relationship(Activity, back_populates="entries")

    def __repr__(self):
        return f"{self.activity.name}"
