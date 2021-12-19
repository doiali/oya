import { Interval, Activity } from './apiService/types';
import { format } from 'date-fns-jalali';
import { Stack, Divider, IconButton, Chip, Paper, Collapse, TextField, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Delete, Edit, KeyboardArrowDown, KeyboardArrowUp, Search } from '@mui/icons-material';
import { deleteInterval } from './apiService';
import AlertService from './AlertService';
import { mutate } from 'swr';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import IntervalEditor from './IntervalEditor';
import { getActivityParentsNames } from './ActivitiesPanel';

type IntervalsListProps = {
  intervals: Interval[],
  activities: Activity[],
};

export default function IntervalsList({ intervals, activities }: IntervalsListProps) {
  const [searchVal, setSearchVal] = useState('');
  const [delayedSearchVal, setDelayedSearchVal] = useState('');
  const intervalsIndex = useMemo(() => intervals.map((interval) => (
    interval.entries.map((e) => getActivityParentsNames(e.activity)).join(' ') + (interval.note ?? '').toLowerCase()
  )), [intervals]);
  useEffect(() => {
    const id = setTimeout(() => {
      setDelayedSearchVal(searchVal.toLowerCase());
    }, 500);
    return () => {
      clearTimeout(id);
    };
  }, [searchVal]);
  const filteredIntervals = useMemo(() => (
    intervals.filter((_, i) => intervalsIndex[i].includes(delayedSearchVal))
  ), [intervals, delayedSearchVal, intervalsIndex]);
  const list = useMemo(() => (
    <Stack spacing={1} divider={<Divider orientation="horizontal" flexItem />}>
      {filteredIntervals.map((interval, i) => (
        <IntervalSingle activities={activities} index={intervals.length - i} key={interval.id} interval={interval} />
      ))}
    </Stack>
  ), [filteredIntervals, activities, intervals.length]);
  return (
    <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgb(255,255,235)' }} elevation={2}>
      <TextField
        sx={{ mb: 2 }}
        variant='outlined'
        label='search'
        fullWidth
        value={searchVal}
        onChange={(e) => setSearchVal(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Search />
            </InputAdornment>
          ),
        }}
      />
      {list}
    </Paper>
  );
}

const Index = styled('span')(() => ({
  color: 'orange',
}));

function IntervalSingle({ interval, activities, index }: { interval: Interval; activities: Activity[]; index: number; }) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);
  const handleDelete = () => {
    setLoading(true);
    deleteInterval(interval.id).then(() => {
      AlertService.success('interval deleted');
      mutate('/intervals/');
    }, () => {
      setLoading(false);
      AlertService.error('error deleting interval');
    });
  };
  const start = new Date(interval.start);
  const end = new Date(interval.end);
  const dm = Math.round((end.getTime() - start.getTime()) / 60000);
  const s = Math.floor(dm / 60).toString().padStart(2, '0') + ':' + (dm % 60).toString().padStart(2, '0');
  return (
    <Stack spacing={1}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap' }} spacing={1}>
          <Index>{index}. {' '}</Index>
          <Chip dir="rtl" variant="outlined" label={format(start, 'MM/dd-HH:mm eeee')} />
          <span>{' '}-{' '}</span>
          <Chip dir="rtl" variant="outlined" label={format(end, 'MM/dd-HH:mm eeee')} />
          <span>{' '} {s} :{' '}</span>
          {interval.entries.map(({ id, activity }) => (
            <Chip label={activity.name} key={id} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {interval.note &&
            // (notesRef.current?.scrollHeight ?? 0 > 30) &&
            (
              <IconButton onClick={() => setOpen((prev) => !prev)}>
                {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            )}
          <IconButton onClick={() => setIsEditing(true)}>
            <Edit />
          </IconButton>
          <IconButton disabled={loading} onClick={handleDelete}>
            <Delete />
          </IconButton>
        </Stack>
      </Stack>
      {!isEditing && interval.note && (
        <Collapse in={open} collapsedSize={45}>
          <div ref={notesRef} dangerouslySetInnerHTML={{ __html: marked.parse(interval.note ?? '') }} />
        </Collapse>
      )}
      {isEditing && (
        <IntervalEditor
          activities={activities}
          interval={interval}
          onClose={() => setIsEditing(false)}
        />
      )}
    </Stack>
  );
}
