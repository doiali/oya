import React from 'react';
import { useRoutes } from 'react-router-dom';
import Layout from './Layout';
import HomePage, { HomePageOld } from './HomePage';
import ReportPageLayout from './report/ReportPageLayout';
import { ActivityPanelHome } from './ActivityPanel';
import TimeRe from './report/TimeRe';
import ActivityPageLayout from './ActivityPageLayout';
import TreemapNivo from './report/TreemapNivo';
import SunburstNivo from './report/SunburstNivo';

export interface RouteInfo {
  path: string;
  label?: string,
  to?: string;
  hideLink?: boolean;
  element?: React.ReactNode;
}

const MainRouter = () => useRoutes([
  { element: <Layout />, children: mainRoutes },
]);

const ReportsRouter = () => useRoutes([
  { element: <ReportPageLayout />, children: reportRoutes },
]);

const ActivityPanelRouter = () => useRoutes([
  { path: '/', element: <ActivityPageLayout base /> },
  { path: '/:id', element: <ActivityPageLayout />, children: activityPanelRoutes },
]);

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

export default MainRouter;
