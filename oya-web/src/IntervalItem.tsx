import { Interval, Activity } from './apiService/types';
import { format } from 'date-fns-jalali';
import { Stack, IconButton, Chip, Collapse, Typography } from '@mui/material';
import { Delete, Edit, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { deleteInterval } from './apiService';
import AlertService from './AlertService';
import { mutate } from 'swr';
import React, { memo, useRef, useState } from 'react';
import { marked } from 'marked';
import IntervalEditor from './IntervalEditor';
import { dequal } from 'dequal';

export type IntervalItemProps = {
  interval: Interval;
  activities: Activity[];
  index: number;
};

export default memo(function IntervalItem(
  { interval, activities, index }: IntervalItemProps,
) {
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
          <Typography color="secondary">{index}. {' '}</Typography>
          <Chip dir="rtl" variant="outlined" label={format(start, 'MM/dd-HH:mm eeee')} />
          <span>{' '}-{' '}</span>
          <Chip dir="rtl" variant="outlined" label={format(end, 'MM/dd-HH:mm eeee')} />
          <span>{' '}:{' '}</span>
          {interval.entries.map(({ activity }) => (
            <Chip label={activity.name} key={String(interval.id) + '-' + activity.id} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {interval.note && (
            <IconButton onClick={() => setOpen((prev) => !prev)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
          <Chip color="secondary" variant="outlined" label={s} />
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
}, (prevProps, nextProps) => {
  return (
    prevProps.activities === nextProps.activities &&
    prevProps.index === nextProps.index &&
    dequal(prevProps.interval, nextProps.interval)
  );
});
