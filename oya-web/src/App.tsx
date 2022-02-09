import React from 'react';
import { dequal } from 'dequal';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
// import { RouteObject } from 'react-router';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './theme';
import { AlertServiceContainer } from './AlertService';
import Layout from './Layout';
import HomePage, { HomePageOld } from './HomePage';
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
        {mainRoutes.map(routeMapper)}
      </Route>
    </Routes>
  );
}

export function ReportsRouter() {
  return (
    <Routes>
      <Route path='/' element={<ReportPageLayout />}>
        {reportRoutes.map(routeMapper)}
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
      </Route>
    </Routes>
  );
}

interface RouteInfo {
  path: string;
  label?: string,
  to?: string;
  hideLink?: boolean;
  element?: React.ReactNode;
}

export const routeMapper = (r: RouteInfo) => (
  <Route key={r.path} path={r.path} element={r.element} />
);
export const mapRoutes = (routes: RouteInfo[]) => routes.map(routeMapper);

export const mainRoutes: RouteInfo[] = [
  { path: '', label: 'home', element: <HomePage /> },
  { path: 'reports/*', label: 'home', element: <ReportsRouter /> },
  { path: 'activities/*', label: 'home', element: <ActivityPanelRouter /> },
  { path: 'home-old', label: 'home', element: <HomePageOld /> },
  { path: '*', element: '404 not found', hideLink: true },
];

export const activityPanelRoutes: RouteInfo[] = [
  { path: '', label: 'overview', element: <ActivityPanelHome /> },
  { path: 'times', label: 'time chart', element: <TimeRe /> },
  { path: '*', element: '404 not found', hideLink: true },
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
  { path: '*', element: '404 not found', hideLink: true },
];

declare global {
  interface Window {
    dequal: typeof dequal;
  }
}
window.dequal = dequal;
