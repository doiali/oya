from sqlalchemy.orm import Session, aliased
from sqlalchemy import distinct, extract, func, select, case, literal
import datetime
from .models import Interval, Activity, Entry, Association


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


    Interval2 = aliased(Interval)
    Entry2 = aliased(Entry)
    t_start = case((Interval2.start < min, min), else_=Interval2.start)
    baseIndex = func.floor(extract("EPOCH", t_start - min) / extract("EPOCH", tick))
    period_start = baseIndex * tick + min
    period_end = case((period_start + tick > max, max), else_=period_start + tick)
    t_end = case((Interval2.end > period_end, period_end), else_=Interval2.end)
    percent_1 = extract("EPOCH", (t_end - t_start)) / extract(
        "EPOCH", Interval2.end - Interval2.start
    )
    t_time_1 = percent_1 * Entry2.time
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
            percent_1.label("percent"),
            t_time_1.label("t_time"),
            Entry2.time.label("entry_time"),
        )
        .select_from(Entry2)
        .join(Interval2)
        .where(Interval2.end >= min)
        .where(Interval2.start <= max)
        .cte(recursive=True)
    )
    period_end2 = case(
        (cte1_a.c.period_start + tick * 2 > max, max),
        else_=cte1_a.c.period_start + tick * 2,
    )
    t_start2 = cte1_a.c.period_start + tick
    t_end2 = case(
        (cte1_a.c.interval_end > period_end2, period_end2),
        else_=cte1_a.c.interval_end,
    )
    percent_2 = extract("EPOCH", (t_end2 - t_start2)) / extract(
        "EPOCH", cte1_a.c.interval_end - cte1_a.c.interval_start
    )
    t_time_2 = percent_2 * cte1_a.c.entry_time
    cte1 = cte1_a.union_all(
        select(
            cte1_a.c.interval_id,
            cte1_a.c.activity_id,
            (cte1_a.c.index + 1).label("index"),
            (cte1_a.c.line + 1).label("line"),
            t_start2.label("t_start"),
            t_end2.label("t_end"),
            (cte1_a.c.period_start + tick).label("period_start"),
            period_end2.label("period_end"),
            cte1_a.c.interval_start,
            cte1_a.c.interval_end,
            percent_2.label("percent"),
            t_time_2.label("t_time"),
            cte1_a.c.entry_time,
        )
        .where(cte1_a.c.period_start + tick < cte1_a.c.interval_end)
        .where(cte1_a.c.period_start + tick < max)
    )

    Links = aliased(Association)
    cte2_a = select(
        Activity.id.label("activity_id"),
        Activity.id.label("parent_id"),
        literal(0).label("level"),
    ).cte(recursive=True)
    cte2_alias = cte2_a.alias()
    cte2 = cte2_a.union_all(
        select(
            cte2_alias.c.activity_id,
            Links.parent_id.label("parent_id"),
            (cte2_alias.c.level + 1).label("level"),
        )
        .select_from(cte2_alias)
        .join(Links, onclause=cte2_alias.c.parent_id == Links.child_id)
    )

    cte3 = (
        select(cte2.c.level, cte2.c.parent_id, *cte1.c)
        .select_from(cte2)
        .join(cte1, onclause=cte2.c.activity_id == cte1.c.activity_id)
    ).cte()

    stmt3 = select(cte3).order_by(
        cte3.c.interval_id.desc(), cte3.c.activity_id, cte3.c.index.desc()
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
    rows = db.execute(stmt.limit(50)).all()
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
