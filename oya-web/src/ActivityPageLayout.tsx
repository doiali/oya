import { Box, Button, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useActivities, { ActivityMap } from './useActivities';
import ActivitiesTreeView from './ActivitiesTreeView';
import { ReportContext, useReport } from './report/ReportProvider';
import { Activity } from './apiService';
import {
  Outlet, useLocation, useNavigate, useOutletContext, useParams, useResolvedPath,
} from 'react-router';
import { activityPanelRoutes } from './MainRouter';
import TabsNav from './TabsNav';
import { breakpoint } from './Layout';
import { Close } from '@mui/icons-material';
import RangeSelector from './report/RangeSelector';

export type ActivityContext = {
  activity?: Activity,
  onClose?: () => void,
  report: ReportContext,
};

export function useActivityContext() {
  return useOutletContext<ActivityContext>();
}

const getSelectedActivity = (id: string, am: ActivityMap) => {
  const selectedIds = id.split('-');
  const selectedActivityId = selectedIds[selectedIds.length - 1];
  return am.get(Number(selectedActivityId));
};

const innerDrawerWidth = 400;

export default function ActivityPageLayout({ base = false }: { base?: boolean; }) {
  const { pathname: resolvedPath } = useResolvedPath('');
  const { id: nodeIdParams = '' } = useParams();
  const nodeId = base ? '' : nodeIdParams;
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const report = useReport();
  const { activityMap: am } = useActivities();
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up(breakpoint));
  const selectedActivity = useMemo(() => (
    getSelectedActivity(nodeId, am)
  ), [nodeId, am]);

  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(isWide);
  }, [isWide]);

  const handleSelect = useCallback((newId: string) => {
    if (base || !nodeId) {
      navigate(newId + search);
    } else if (nodeId) {
      navigate(
        resolvedPath.slice(0, -nodeId.length) +
        (newId ? newId + pathname.slice(resolvedPath.length) : '') +
        search,
      );
    }
  }, [resolvedPath, nodeId, pathname, navigate, base, search]);

  const context = useMemo<ActivityContext>(() => ({
    report,
    activity: selectedActivity,
    onClose: () => handleSelect(''),
  }), [report, selectedActivity, handleSelect]);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Drawer
        sx={theme => ({
          width: innerDrawerWidth,
          maxWidth: '100%',
          '& .MuiDrawer-paper': {
            maxWidth: '100%',
            width: innerDrawerWidth,
            position: 'relative',
            zIndex: theme.zIndex.appBar - 1,
          },
        })}
        open={open}
        variant={isWide ? 'persistent' : 'temporary'}
        onClose={() => setOpen(false)}
      >
        <Box
          sx={theme => ({
            position: 'relative',
            backgroundColor: theme.palette.background.paper,
            top: 0,
            height: '100%',
            px: { xs: 2, md: 3 },
            py: 6,
          })}
        >
          <Box mb={2} mt={-4} display={{ xs: 'block', [breakpoint]: 'none' }}>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <ActivitiesTreeView
            selected={nodeId}
            onNodeSelect={handleSelect}
          />
        </Box>
      </Drawer>
      <Box
        sx={theme => ({
          flexGrow: 1, px: { xs: 2, md: 3 }, py: 6,
          width: '100%',
          [theme.breakpoints.up(breakpoint)]: {
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: `-${innerDrawerWidth}px`,
            ...(open && {
              width: `calc(100% - ${innerDrawerWidth}px)`,
              transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
              marginLeft: 0,
            }),
          },
        })}
      >
        <Box mb={2} display="flex">
          <Button onClick={() => setOpen(p => !p)} variant='contained'>
            {open ? 'Hide activities' : 'Show activities'}
          </Button>
          <RangeSelector
            sx={{ pl: 2, flexGrow: 1 }}
            state={report.state}
            onChange={report.onChange}
          />
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabsNav preserveSearch routes={activityPanelRoutes} disabled={base || !nodeId} />
        </Box>
        <Box sx={{ py: 6 }}>
          <Outlet context={context} />
        </Box>
      </Box>
    </Box>
  );
}
