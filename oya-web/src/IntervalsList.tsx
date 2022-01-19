import { Interval } from './apiService/types';
import { format } from 'date-fns-jalali';
import { Stack, Divider, Chip, Box, Typography } from '@mui/material';
import React, { memo, useMemo } from 'react';
import IntervalsFilter, { useIntervalsFilter } from './IntervalsFilter';
import IntervalItem from './IntervalItem';

type IntervalsListProps = {
  intervals: Interval[],
};

export default memo(function IntervalsList({ intervals }: IntervalsListProps) {
  const { filteredIntervals, ...intervalsFilterProps } = useIntervalsFilter({ intervals });

  const list = useMemo(() => {
    let prevEnd = '9';
    return (
      <Stack spacing={1}>
        {filteredIntervals.map((interval, i) => {
          const end = interval.end.substring(0, 10);
          const isNewDay = end < prevEnd;
          if (isNewDay) prevEnd = end;
          return (
            <React.Fragment key={interval.id}>
              {isNewDay && (
                <Divider orientation="horizontal" flexItem>
                  <Chip color="secondary" dir="rtl" label={format(new Date(interval.end), 'eeee d MMMM y')} />
                </Divider>
              )}
              <IntervalItem index={filteredIntervals.length - i} interval={interval} />
            </React.Fragment>
          );
        })}
      </Stack>
    );
  }, [filteredIntervals]);

  return (
    <Box component="section">
      <IntervalsFilter {...intervalsFilterProps} />
      <Typography mb={2} variant="h5">
        Intervals List
      </Typography>
      {list}
    </Box>
  );
});
