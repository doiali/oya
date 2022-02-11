import { Interval } from './apiService/types';
import { format } from 'date-fns-jalali';
import { Stack, Divider, Chip, Box, Typography, Pagination } from '@mui/material';
import React, { memo, useEffect, useRef, useState } from 'react';
import IntervalItem from './IntervalItem';

type IntervalsListProps = {
  intervals: Interval[],
  highLights?: number[],
};

const rowsPerPage = 40;
export default memo(function IntervalsList({ intervals, highLights }: IntervalsListProps) {
  const [page, setPage] = useState(1);
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
      <Stack spacing={1}>
        {intervals
          .slice((page - 1) * rowsPerPage, page * rowsPerPage)
          .map((interval, i) => {
            const end = new Date(interval.end);
            end.setHours(0, 0, 0, 0);
            const isNewDay = end < prevEnd;
            if (isNewDay) prevEnd = end;
            return (
              <React.Fragment key={interval.id}>
                {isNewDay && (
                  <Divider orientation="horizontal" flexItem>
                    <Chip color="secondary" dir="rtl" label={format(new Date(interval.end), 'eeee d MMMM y')} />
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
    <Stack
      spacing={1} direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between' }}
    >
      <span>total rows: {rows}</span>
      {(rows > rowsPerPage) && (
        <Pagination count={totalPages} page={page} onChange={(_, x) => setPage(x)} />
      )}
    </Stack>
  );

  return (
    <Box component="section" ref={ref}>
      <Typography mb={2} variant="h5">
        Intervals List
      </Typography>
      {pagination}
      {renderList()}
      {(rows > 10) && pagination}
    </Box>
  );
});
