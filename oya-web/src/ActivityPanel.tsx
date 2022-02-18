import { Stack } from '@mui/material';
import ActivityEditor from './ActivityEditor';
import ActivityOverviewReport from './report/ActivityOverviewReport';
import React from 'react';
import { useActivityContext } from './ActivityPageLayout';
import Widget from './Widget';

export const ActivityPanelHome = () => {
  const { activity, onClose } = useActivityContext();
  return activity ? (
    <Stack spacing={2}>
      <Widget
        title={(
          <>Update Activity <span style={{ fontSize: '0.7em' }}>id: {activity.id}</span></>
        )}
      >
        <ActivityEditor
          activity={activity}
          onClose={() => onClose?.()}
        />
      </Widget>
      <ActivityOverviewReport activity={activity} />
    </Stack>
  ) : null;
};
