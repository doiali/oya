import { Box, Grid, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Activity } from './apiService';
import { ActivityTotalReport, createActivityTotalReport, createDailyDataMap } from './reportUtils';
import TreemapReport from './TreemapReport';
import useActivities from './useActivities';
import useIntervals from './useIntervals';
import { getDeltaStringOfRange as ts } from './utils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function useReport() {
  const { intervals } = useIntervals();
  const { activityMappings, activities } = useActivities();
  const ddm = createDailyDataMap(intervals, activityMappings);
  const dda = Object.values(ddm);
  const atrm = createActivityTotalReport(dda);
  const atra = Object.values(atrm).sort((a, b) => Number(b?.time) - Number(a?.time));
  return { intervals, activityMappings, activities, ddm, dda, atrm, atra };
}

export default function ReportPage() {
  const { atrm, dda, atra } = useReport();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(dda);
    // eslint-disable-next-line no-console
    console.log(atra);
  }, [atra, dda]);

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="cards" />
          <Tab label="vis-tree" />
          <Tab label="Item Three" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Grid container spacing={2}>
          {atra.map((r) => r && (
            <Grid key={r.activity.id} item xs={6} md={4} lg={3} xl={2}>
              <ActivityOverViewReport
                activity={r.activity}
                atrm={atrm}
              />
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TreemapReport />
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
    </Box>
  );
}

type ActivityOverViewReportProps = {
  activity: Activity,
  atrm: ActivityTotalReport,
};

export function ActivityOverViewReport({ activity, atrm }: ActivityOverViewReportProps) {
  const renderRow = (name: string, value: string | number) => (
    <Typography textAlign="center" key={name}>
      {name}: <b>{value}</b>
    </Typography>
  );
  const r = atrm[activity.id];
  if (!r) return null;
  return (
    <Paper sx={{ p: 2, height: '100%', flexShrink: 0 }}>
      <Typography gutterBottom variant='h5' textAlign="center">{activity.name}</Typography>
      <Stack>
        {renderRow('days', `${r.days} of ${r.allDays}`)}
        {renderRow('total time', ts(r.time))}
        {renderRow('avg per all days', ts(r.avgPerAllDays))}
        {renderRow('avg per days', ts(r.avgPerDays))}
        {renderRow('occurance', r.occurance.toString())}
      </Stack>
    </Paper>
  );
}
