import { Interval } from './apiService/types';
import { Stack, Divider, Chip, Pagination, Box } from '@mui/material';
import React, { memo, useEffect, useRef, useState } from 'react';
import IntervalItem from './IntervalItem';
import Widget from './Widget';
import { useDateContext } from './DateProvider';

type IntervalsListProps = {
  intervals: Interval[],
  highLights?: number[],
};

const rowsPerPage = 30;
export default memo(function IntervalsList({ intervals, highLights }: IntervalsListProps) {
  const [page, setPage] = useState(1);
  const { utils: u } = useDateContext();
  const rows = intervals.length;
  const totalPages = Math.ceil(rows / rowsPerPage) || 1;
  const ref = useRef<HTMLDivElement>(null);
  const prevPage = useRef(page);
  useEffect(() => { setPage(1); }, [rows]);
  useEffect(() => {
    if (page > prevPage.current) {
      const top = (ref.current?.offsetTop ?? 0) - 75;
      window.scroll({ top, behavior: 'smooth' });
    }
    prevPage.current = page;
  }, [page]);

  const renderList = () => {
    let prevEnd = new Date('2050-1-1');
    return (
      <Stack spacing={1} sx={{ mb: 1 }}>
        {intervals
          .slice((page - 1) * rowsPerPage, page * rowsPerPage)
          .map((interval, i) => {
            const end = new Date(interval.end);
            end.setTime(end.getTime() - 1);
            end.setHours(0, 0, 0, 0);
            const isNewDay = end < prevEnd;
            if (isNewDay) prevEnd = end;
            return (
              <React.Fragment key={interval.id}>
                {isNewDay && (
                  <Divider orientation="horizontal" flexItem>
                    <Chip color="secondary" dir="rtl" label={u.formatByString(end, 'eeee d MMMM y')} />
                  </Divider>
                )}
                <IntervalItem
                  index={rows - (page - 1) * rowsPerPage - i}
                  interval={interval}
                  highLights={highLights}
                />
              </React.Fragment>
            );
          })}
      </Stack>
    );
  };

  const pagination = (
    <Box
      sx={theme => ({
        [theme.breakpoints.up('lg')]: {
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        },
      })}
    >
      <Box mb={{ xs: 2, lg: 0 }}>total rows: {rows}</Box>
      {(rows > rowsPerPage) && (
        <Pagination count={totalPages} page={page} onChange={(_, x) => setPage(x)} />
      )}
    </Box>
  );

  return (
    <Widget title="Intervals List" ref={ref}>
      {pagination}
      {renderList()}
      {(rows > 10) && pagination}
    </Widget>
  );
});
