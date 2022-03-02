from sqlalchemy.orm import Session, aliased
from sqlalchemy import distinct, extract, func, select, case, literal
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
    stmt_meta = select(
        func.min(Interval.start),
        func.max(Interval.end),
    ).where(Interval.user_id == 1)
    meta = db.execute(stmt_meta).first()
    min = from_date if from_date is not None else meta.min
    max = to_date if to_date is not None else meta.max
    t_end_temp = case((Interval.end > max, max), else_=Interval.end).label("t_end")
    t_start_temp = case((Interval.start < min, min), else_=Interval.start).label(
        "t_start"
    )
    percent = (
        extract("EPOCH", (t_end_temp - t_start_temp))
        / extract("EPOCH", Interval.end - Interval.start)
    ).label("percent")
    t_time = (percent * Entry.time).label("t_time")

    Interval2 = aliased(Interval)
    Entry2 = aliased(Entry)
    t_start = case((Interval2.start < min, min), else_=Interval2.start)
    baseIndex = func.floor(extract("EPOCH", t_start - min) / extract("EPOCH", tick))
    period_start = baseIndex * tick + min
    period_end = case((period_start + tick > max, max), else_=period_start + tick)
    t_end = case((Interval2.end > period_end, period_end), else_=Interval2.end)
    cte1_a = (
        select(
            Interval2.id.label("interval_id"),
            Entry2.activity_id.label("activity_id"),
            baseIndex.label("index"),
            literal(1).label("line"),
            t_start.label("t_start"),
            t_end.label("t_end"),
            period_start.label("period_start"),
            period_end.label("period_end"),
            Interval2.start.label("interval_start"),
            Interval2.end.label("interval_end"),
        )
        .select_from(Entry2)
        .join(Interval2)
        .cte(recursive=True)
    )
    period_end2 = case(
        (cte1_a.c.period_start + tick * 2 > max, max),
        else_=cte1_a.c.period_start + tick * 2,
    )
    t_end2 = case(
        (cte1_a.c.interval_end > period_end2, period_end2),
        else_=cte1_a.c.interval_end,
    )
    cte1 = cte1_a.union_all(
        select(
            cte1_a.c.interval_id,
            cte1_a.c.activity_id,
            (cte1_a.c.index + 1).label("index"),
            (cte1_a.c.line + 1).label("line"),
            (cte1_a.c.period_start + tick).label("t_start"),
            t_end2.label("t_end"),
            (cte1_a.c.period_start + tick).label("period_start"),
            period_end2.label("period_end"),
            cte1_a.c.interval_start,
            cte1_a.c.interval_end,
        )
        .where(cte1_a.c.period_start + tick < cte1_a.c.interval_end)
        .where(cte1_a.c.period_start + tick < max)
    )

    cte2 = (
        select(cte1.c.activity_id, func.count(distinct(cte1.c.index)).label("count"))
        .select_from(cte1)
        .group_by(cte1.c.activity_id)
    ).cte()
    stmt2 = select("*").select_from(cte2)
    stmt3 = (
        select(
            cte1.c.interval_id,
            cte1.c.activity_id,
            cte1.c.line,
            cte1.c.index,
        )
        .select_from(cte1)
        .order_by(cte1.c.interval_id.desc(), cte1.c.activity_id, cte1.c.index.desc())
    )

    stmt_main = (
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
    )

    stmt = stmt3

    stmt_counter = select(func.count("*").label("count")).select_from(stmt.cte())
    entries_counter = (
        select(
            func.count("*").label("count"),
            func.count(distinct(Interval.id)).label("count_interval"),
            func.count(case((Interval.end - Interval.start >= tick, 1))).label(
                "gt_tick"
            ),
        )
        .select_from(Entry)
        .join(Interval)
    )
    entries_counter_result = db.execute(entries_counter).first()
    count = db.execute(stmt_counter).first().count
    rows = db.execute(stmt.limit(1000)).all()
    return {
        "meta": {
            "count": count,
            "entries_count": entries_counter_result.count,
            "entries_gt_tick": entries_counter_result.gt_tick,
            "intervals_count": entries_counter_result.count_interval,
            "len": len(rows),
        },
        "data": rows,
    }
