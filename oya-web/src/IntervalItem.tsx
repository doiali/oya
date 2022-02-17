import { Interval } from './apiService/types';
import { format } from 'date-fns-jalali';
import { Stack, IconButton, Chip, Collapse, Typography, Box } from '@mui/material';
import { Delete, Edit, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { deleteInterval } from './apiService';
import AlertService from './AlertService';
import { mutate } from 'swr';
import React, { memo, useRef, useState } from 'react';
import { marked } from 'marked';
import IntervalEditor from './IntervalEditor';
import useActivities from './useActivities';
import { getDeltaString } from './utils';

export type IntervalItemProps = {
  interval: Interval;
  index: number;
  highLights?: number[];
};

export default memo(function IntervalItem(
  { interval, index, highLights }: IntervalItemProps,
) {
  const { activityMappings } = useActivities();
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
  const isSame = (id: number) => highLights?.includes(id);
  const isDesc = (id: number) => highLights?.map(a => activityMappings[a]).some(a => a?.allChildIds.includes(id));

  return (
    <Stack spacing={1}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap' }} spacing={1}>
          <Typography color="secondary">{index}. {' '}</Typography>
          <Chip dir="rtl" variant="outlined" label={format(start, 'MM/dd-HH:mm eeee')} />
          <span>{' '}-{' '}</span>
          <Chip dir="rtl" variant="outlined" label={format(end, 'MM/dd-HH:mm eeee')} />
          <span>{' '}:{' '}</span>
          {interval.entries.map(({ activity_id }, i) => (
            <Chip
              color={isDesc(activity_id) ? (isSame(activity_id) ? 'success' : 'primary') : 'default'}
              label={activityMappings[activity_id]?.name}
              key={String(interval.id) + '-' + (activityMappings[activity_id]?.id ?? ('i' + i))}
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {interval.note && (
            <IconButton onClick={() => setOpen((prev) => !prev)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
          <Chip color="secondary" variant="outlined" label={getDeltaString(interval.start, interval.end)} />
          <IconButton onClick={() => setIsEditing(prev => !prev)}>
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
        <Box py={2}>
          <IntervalEditor
            interval={interval}
            onClose={() => setIsEditing(false)}
          />
        </Box>
      )}
    </Stack>
  );
});
