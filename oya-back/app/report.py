from sqlalchemy.orm import Session, aliased
from sqlalchemy import distinct, extract, func, select, case
import datetime
from .models import Interval, Activity, Entry


def get_intervals2(
    *,
    db: Session,
    from_date: datetime.datetime = None,
    to_date: datetime.datetime = None,
    period: datetime.timedelta = None,
    tick: datetime.timedelta = datetime.timedelta(days=1),
):
    stmt = select(
        func.min(Interval.start),
        func.max(Interval.end),
    ).where(Interval.user_id == 1)
    meta = db.execute(stmt).first()
    min = from_date if from_date is not None else meta.min
    max = to_date if to_date is not None else meta.max
    t_end = case((Interval.end > max, max), else_=Interval.end).label("t_end")
    t_start = case((Interval.start < min, min), else_=Interval.start).label("t_start")
    percent = (
        extract("EPOCH", (t_end - t_start))
        / extract("EPOCH", Interval.end - Interval.start)
    ).label("percent")
    t_time = (percent * Entry.time).label("t_time")

    # ctetick = select(
    #     literal(min).label("s"),
    #     case(
    #         (and_(Interval.end >= min, Interval.start < min + tick), 1), else_=0
    #     ).label("c"),
    # ).cte(recursive=True)
    # stmt2 = select(
    #     (ctetick.c.s + tick).label("s"),
    #     case(
    #         (
    #             and_(Interval.end >= ctetick.c.s, Interval.start < ctetick.c.s + tick),
    #             1,
    #         ),
    #         else_=0,
    #     ).label("c"),
    # ).where(ctetick.c.s < max)
    # sss = ctetick.union_all(stmt2)
    # stmt3 = select(
    #     Interval.id,
    #     (sss.c.s).label('all_days'),
    #     (sss.c.c).label('days')
    # ).where(Interval.id == 1162).limit(1004)

    Interval2 = aliased(Interval)
    Entry2 = aliased(Entry)
    ctetick = (
        select(
            Entry2.activity_id.label("activity_id"),
            Interval2.id.label("interval_id"),
            Interval2.end.label("end"),
            func.floor(
                extract("EPOCH", Interval2.start - min) / extract("EPOCH", tick)
            ).label("index"),
        )
        .select_from(Entry2)
        .join(Interval2)
        .cte(recursive=True)
    )
    sss = ctetick.union_all(
        select(
            ctetick.c.activity_id,
            ctetick.c.interval_id,
            ctetick.c.end,
            (ctetick.c.index + 1).label("index"),
        ).where((ctetick.c.index + 1) * tick + min < ctetick.c.end)
    )
    cte3 = sss
    cte2 = (
        select(sss.c.activity_id, func.count(distinct(sss.c.index)).label("count"))
        .select_from(sss)
        .group_by(sss.c.activity_id)
    ).cte()
    stmt2 = select("*").select_from(cte2)
    stmt = (
        select(
            Entry.activity_id,
            func.count(Entry.interval_id).label("occurance"),
            func.sum(cte2.c.count).label("days"),
            func.sum(t_time),
        )
        .select_from(Entry)
        .join(Interval)
        .join(cte2, onclause=cte2.c.activity_id == Entry.activity_id)
        .where(Interval.user_id == 1)
        .where(Interval.end >= min)
        .where(Interval.start <= max)
        .group_by(Entry.activity_id)
        .order_by(Entry.activity_id)
        .limit(1000)
    )
    intervals = db.execute(stmt2).all()
    return {"count": len(intervals), "data": intervals}
