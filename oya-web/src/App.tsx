import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './theme';
import { AlertServiceContainer } from './AlertService';
import Layout from './Layout';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage, { HomePageOld } from './HomePage';
import { dequal } from 'dequal';
import ReportPage from './report/ReportPage';
import { ActivityPanelHome } from './ActivityPanel';
import TimeRe from './report/TimeRe';
import ActivityPage from './ActivityPage';
import { GridOverviewReport } from './report/ActivityOverviewReport';
import BarTotalRechart from './report/BarTotalRechart';
import PieTotalRechart from './report/PieTotalRechart';
import TreemapRechart from './report/TreemapRechart';
import TreemapReactVis from './report/TreemapReactVis';
import TreemapNivo from './report/TreemapNivo';
import SunburstNivo from './report/SunburstNivo';
import React from 'react';

export default function App() {
  return (
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <CssBaseline />
          <AlertServiceContainer />
          <MainRouter />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

function MainRouter() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path='reports' element={<ReportPage />}>
          {reportRoutes.map(r => <Route key={r.link} path={r.link} element={r.element} />)}
          <Route path="*" element="404 not found" />
        </Route>
        <Route path="activities/*" element={<ActivityPanelRouter />}>
        </Route>
        <Route path="home-old" element={<HomePageOld />} />
        <Route path="*" element="404 not found" />
      </Route>
    </Routes>
  );
}

export function ActivityPanelRouter() {
  return (
    <Routes>
      <Route path="/" element={<ActivityPage />}>
        {ActivityPanelRoutes.map(routeMapper)}
        <Route index element={<ActivityPanelHome />} />
        <Route path="*" element="not found" />
      </Route>
    </Routes>
  );
}

type RouteInfo = { link: string; to?: string; label: string, element: React.ReactElement; };

export const routeMapper = (r: RouteInfo) => <Route key={r.link} path={r.link} element={r.element} />;
export const mapRoutes = (routes: RouteInfo[]) => routes.map(routeMapper);

export const ActivityPanelRoutes: RouteInfo[] = [
  { link: 'overview', label: 'overview', element: <ActivityPanelHome /> },
  { link: 'time', label: 'time chart', element: <TimeRe /> },
];

export const reportRoutes: RouteInfo[] = [
  { link: 'cards', label: 'Cards', element: <GridOverviewReport /> },
  { link: 'bar', label: 'Bars', element: <BarTotalRechart /> },
  { link: 'pie', label: 'Pie', element: <PieTotalRechart /> },
  { link: 're-tree', label: 'Re Tree', element: <TreemapRechart /> },
  { link: 'time-re/*', to: 'time-re', label: 'Re Time', element: <ActivityPanelRouter /> },
  { link: 'vis-tree', label: 'Vis Tree', element: <TreemapReactVis /> },
  { link: 'nivo-tree', label: 'Nivo Tree', element: <TreemapNivo /> },
  { link: 'sunburst', label: 'Nivo Sunburst', element: <SunburstNivo /> },
];

declare global {
  interface Window {
    dequal: typeof dequal;
  }
}
window.dequal = dequal;
