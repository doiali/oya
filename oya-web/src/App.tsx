import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './theme';
import { AlertServiceContainer } from './AlertService';
import Layout from './Layout';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage, { HomePageOld } from './HomePage';
import { dequal } from 'dequal';
import ReportPageLayout from './report/ReportPageLayout';
import { ActivityPanelHome } from './ActivityPanel';
import TimeRe from './report/TimeRe';
import ActivityPageLayout from './ActivityPageLayout';
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
        <Route path='reports/*' element={<ReportsRouter />} />
        <Route path="activities/*" element={<ActivityPanelRouter />} />
        <Route path="home-old" element={<HomePageOld />} />
        <Route path="*" element="404 not found" />
      </Route>
    </Routes>
  );
}

export function ReportsRouter() {
  return (
    <Routes>
      <Route path='/' element={<ReportPageLayout />}>
        {reportRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
        <Route path="*" element="404 not found" />
      </Route>
    </Routes>
  );
}

export function ActivityPanelRouter() {
  return (
    <Routes>
      <Route path="/" element={<ActivityPageLayout />} />
      <Route path="/:id" element={<ActivityPageLayout />}>
        {activityPanelRoutes.map(routeMapper)}
        <Route index element={<ActivityPanelHome />} />
        <Route path="*" element="not found" />
      </Route>
    </Routes>
  );
}

type RouteInfo = {
  path: string;
  label: string,
  element: React.ReactElement;
  to?: string;
};

export const routeMapper = (r: RouteInfo) => <Route key={r.path} path={r.path} element={r.element} />;
export const mapRoutes = (routes: RouteInfo[]) => routes.map(routeMapper);

export const activityPanelRoutes: RouteInfo[] = [
  { path: '', label: 'overview', element: <ActivityPanelHome /> },
  { path: 'times', label: 'time chart', element: <TimeRe /> },
];

export const reportRoutes: RouteInfo[] = [
  { path: 'activity/*', to: 'activity', label: 'activity', element: <ActivityPanelRouter /> },
  { path: 'bar', label: 'Bars', element: <BarTotalRechart /> },
  { path: 'pie', label: 'Pie', element: <PieTotalRechart /> },
  { path: 're-tree', label: 'Re Tree', element: <TreemapRechart /> },
  { path: 'vis-tree', label: 'Vis Tree', element: <TreemapReactVis /> },
  { path: 'nivo-tree', label: 'Nivo Tree', element: <TreemapNivo /> },
  { path: 'sunburst', label: 'Nivo Sunburst', element: <SunburstNivo /> },
  { path: 'cards', label: 'Cards', element: <GridOverviewReport /> },
];

declare global {
  interface Window {
    dequal: typeof dequal;
  }
}
window.dequal = dequal;
