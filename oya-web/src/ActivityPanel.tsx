import { Card, CardContent, CardHeader, Divider, Stack } from '@mui/material';
import ActivityEditor from './ActivityEditor';
import ActivityOverviewReport from './report/ActivityOverviewReport';
import React from 'react';
import { useActivityContext } from './ActivityPageLayout';

export const ActivityPanelHome = () => {
  const { activity, onClose } = useActivityContext();
  return activity ? (
    <Stack spacing={2}>
      <Card elevation={2} sx={{ minWidth: 500 }}>
        <CardHeader
          title={(
            <>Update Activity <span style={{ fontSize: '0.7em' }}>id: {activity.id}</span></>
          )}
        />
        <Divider />
        <CardContent>
          <ActivityEditor
            activity={activity}
            onClose={() => onClose?.()}
          />
        </CardContent>
      </Card>
      <ActivityOverviewReport activity={activity} />
    </Stack>
  ) : null;
};
