from sqlalchemy.orm import Session, aliased
from sqlalchemy import (
    distinct,
    extract,
    func,
    select,
    case,
    literal,
    literal_column,
    and_,
)
import datetime
from .models import Interval, Activity, Entry, Association


def get_report_cte(
    *,
    min: datetime.datetime = None,
    max: datetime.datetime = None,
    tick: datetime.timedelta = datetime.timedelta(days=1),
):
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
            literal(0).label("line"),
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
        .where(Interval2.user_id == 1)
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
    cte2_a = (
        select(
            Activity.id.label("activity_id"),
            Activity.id.label("parent_id"),
            literal(0).label("level"),
        )
        .where(Activity.user_id == 1)
        .cte(recursive=True)
    )
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

    sq = (
        select(cte2.c.level, cte2.c.parent_id, *cte1.c)
        .select_from(cte2)
        .join(cte1, onclause=cte2.c.activity_id == cte1.c.activity_id)
    ).cte()

    common_columns = (
        # sq.c.index,
        # sq.c.parent_id.label("activity"),
        func.sum(sq.c.t_time).label("time"),
        func.sum(
            case((sq.c.level == 0, sq.c.t_time), else_=datetime.timedelta(0))
        ).label("time_pure"),
        func.count("*").label("occurance_in_period"),
        func.count(case((sq.c.line == 0, 1))).label("occurance"),
        func.count(case((and_(sq.c.line == 0, sq.c.level == 0), 1))).label(
            "occurance_pure"
        ),
        func.count(distinct(sq.c.index)).label("periods"),
        func.ceil(extract("EPOCH", max - min) / extract("EPOCH", tick)).label(
            "all_periods"
        ),
        func.count(distinct(sq.c.interval_id)).label("intervals_count"),
        func.sum(sq.c.t_end - sq.c.t_start).label("intervals_total_time"),
        func.sum(
            case(
                (sq.c.level == 0, sq.c.t_end - sq.c.t_start),
                else_=datetime.timedelta(0),
            )
        ).label("intervals_total_time_pure"),
        func.min(sq.c.period_start).label("period_start"),
        func.max(sq.c.period_end).label("period_end"),
        (func.max(sq.c.period_end) - func.min(sq.c.period_start)).label("period_range"),
    )

    return (sq, common_columns)


def get_report(
    *,
    db: Session,
    from_date: datetime.datetime = None,
    to_date: datetime.datetime = None,
    tick: datetime.timedelta = datetime.timedelta(days=1),
):
    stmt_meta = select(
        func.min(Interval.start),
        func.max(Interval.end),
    ).where(Interval.user_id == 1)
    meta = db.execute(stmt_meta).first()
    min = from_date if from_date is not None else meta.min
    max = to_date if to_date is not None else meta.max
    (sq, common_columns) = get_report_cte(min=min, max=max, tick=tick)

    stmt1 = select(*common_columns)
    stmt2 = (
        select(sq.c.parent_id.label("activity"), *common_columns)
        .group_by(sq.c.parent_id)
        .order_by(sq.c.parent_id)
    )
    stmt3 = (
        select(sq.c.index, *common_columns)
        .group_by(sq.c.index)
        .order_by(sq.c.index.desc())
    )
    stmt4 = (
        select(sq.c.index, sq.c.parent_id.label("activity"), *common_columns)
        .group_by(sq.c.index, sq.c.parent_id)
        .order_by(sq.c.index.desc(), sq.c.parent_id)
    )

    stmt = stmt4

    stmt_totals = (
        select(
            func.count("*").label("count_entries"),
            func.count(distinct(Interval.id)).label("count_interval"),
            func.sum(Interval.end - Interval.start).label("intervals_total_time"),
            func.sum(Entry.time).label("entries_total_time"),
        )
        .select_from(Entry)
        .join(Interval)
        .where(Interval.user_id == 1)
    )
    sq2 = stmt.subquery()
    stmt_totals_from_sq = select(
        func.count("*").label("count"),
        func.sum(sq2.c.intervals_total_time_pure).label("intervals_total_time_pure"),
        func.sum(sq2.c.time_pure).label("total_time_pure"),
        func.sum(sq2.c.occurance_pure).label("total_occurance_pure"),
        func.sum(sq2.c.intervals_count).label("intervals_count"),
    ).select_from(sq2)

    rows = db.execute(stmt.limit(100)).all()
    return {
        "totals": db.execute(stmt_totals).first(),
        "totals_from_sq": db.execute(stmt_totals_from_sq).first(),
        "data": rows,
    }
