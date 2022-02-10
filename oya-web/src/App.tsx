import React from 'react';
import { dequal } from 'dequal';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './theme';
import { AlertServiceContainer } from './AlertService';
import Layout from './Layout';
import HomePage, { HomePageOld } from './HomePage';
import ReportPageLayout from './report/ReportPageLayout';
import { ActivityPanelHome } from './ActivityPanel';
import TimeRe from './report/TimeRe';
import ActivityPageLayout from './ActivityPageLayout';
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

const MainRouter = () => useRoutes([
  { element: <Layout />, children: mainRoutes },
]);

const ReportsRouter = () => useRoutes([
  { element: <ReportPageLayout />, children: reportRoutes },
]);

const ActivityPanelRouter = () => useRoutes([
  { path: '/', element: <ActivityPageLayout /> },
  { path: '/:id', element: <ActivityPageLayout />, children: activityPanelRoutes },
]);

export interface RouteInfo {
  path: string;
  label?: string,
  to?: string;
  hideLink?: boolean;
  element?: React.ReactNode;
}

export const mainRoutes: RouteInfo[] = [
  { path: '', label: 'home', element: <HomePage /> },
  { path: 'reports/*', to: 'reports', label: 'reports', element: <ReportsRouter /> },
  { path: 'activities/*', to: 'activities', label: 'activities', element: <ActivityPanelRouter /> },
  { path: 'home-old', label: 'home-old', element: <HomePageOld /> },
  { path: '*', element: '404 not found', hideLink: true },
];

export const activityPanelRoutes: RouteInfo[] = [
  { path: '', label: 'overview', element: <ActivityPanelHome /> },
  { path: 'times', label: 'time chart', element: <TimeRe /> },
  { path: '*', element: '404 not found', hideLink: true },
];

export const reportRoutes: RouteInfo[] = [
  { path: '', label: 'overview', element: <SunburstNivo /> },
  { path: 'nivo-tree', label: 'tree map', element: <TreemapNivo /> },
  { path: '*', element: '404 not found', hideLink: true },
];

declare global {
  interface Window {
    dequal: typeof dequal;
  }
}
window.dequal = dequal;
