import { Box, Button, Collapse } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import useActivities, { ActivityMappings } from './useActivities';
import ActivitiesTreeView from './ActivitiesTreeView';
import { ReportContext, useReport } from './report/ReportProvider';
import { Activity } from './apiService';
import {
  Outlet, useLocation, useNavigate, useOutletContext, useParams, useResolvedPath,
} from 'react-router';
import { activityPanelRoutes } from './MainRouter';
import TabsNav from './TabsNav';

export type ActivityContext = {
  activity?: Activity,
  onClose?: () => void,
  report: ReportContext,
};

export function useActivityContext() {
  return useOutletContext<ActivityContext>();
}

const getSelectedActivity = (id: string, am: ActivityMappings) => {
  const selectedIds = id.split('-');
  const selectedActivityId = selectedIds[selectedIds.length - 1];
  return am[selectedActivityId];
};

export default function ActivityPageLayout({ base = false }: { base?: boolean; }) {
  const { pathname: resolvedPath } = useResolvedPath('');
  const { id: nodeIdParams = '' } = useParams();
  const nodeId = base ? '' : nodeIdParams;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const report = useReport();
  const { activityMappings: am } = useActivities();
  const selectedActivity = useMemo(() => (
    getSelectedActivity(nodeId, am)
  ), [nodeId, am]);

  const [open, setOpen] = useState(true);

  const handleSelect = useCallback((newId: string) => {
    if (base || !nodeId) {
      navigate(newId);
    } else if (nodeId) {
      navigate(
        resolvedPath.slice(0, -nodeId.length) +
        (newId ? newId + pathname.slice(resolvedPath.length) : ''),
      );
    }
  }, [resolvedPath, nodeId, pathname, navigate, base]);

  const context = useMemo<ActivityContext>(() => ({
    report,
    activity: selectedActivity,
    onClose: () => handleSelect(''),
  }), [report, selectedActivity, handleSelect]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Collapse in={open} orientation='horizontal'>
        <Box
          sx={theme => ({
            minWidth: 400,
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <ActivitiesTreeView
            selected={nodeId}
            onNodeSelect={handleSelect}
          />
        </Box>
      </Collapse>
      <Box sx={{ flexGrow: 1, p: 3, py: 6 }}>
        <Box>
          <Button onClick={() => setOpen(p => !p)} variant='contained'>
            {open ? 'Hide activities' : 'Show activities'}
          </Button>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabsNav routes={activityPanelRoutes} disabled={base || !nodeId} />
        </Box>
        <Box sx={{ py: 2 }}>
          <Outlet context={context} />
        </Box>
      </Box>
    </Box>
  );
}
