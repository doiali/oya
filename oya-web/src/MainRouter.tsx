import React from 'react';
import { useRoutes } from 'react-router-dom';
import Layout from './Layout';
import { HomePageOld } from './HomePage';
import ReportPageLayout from './report/ReportPageLayout';
import { ActivityPanelHome } from './ActivityPanel';
import { Assessment, BrunchDining, Home as HomeIcon } from '@mui/icons-material';
import TimeRe from './report/TimeRe';
import ActivityPageLayout from './ActivityPageLayout';
// import TreemapNivo from './report/TreemapNivo';
import SunburstNivo from './report/SunburstNivo';
// import Calender from './report/Calender';
import LoginPage, { LoginPageLayout } from './LoginPage';
import ActivityCalender from './report/ActivityCalender';
import ClockPage from './report/ClockPage';

export interface RouteInfo {
  path: string;
  label?: string,
  to?: string;
  hideLink?: boolean;
  icon?: React.ReactNode;
  element?: React.ReactNode;
}

const MainRouter = () => useRoutes([
  { element: <Layout />, children: mainRoutes },
  {
    path: '/login', element: <LoginPageLayout />, children: [
      { path: '', element: <LoginPage /> },
    ],
  },
]);

const ReportsRouter = () => useRoutes([
  { element: <ReportPageLayout />, children: reportRoutes },
]);

const ActivityPanelRouter = () => useRoutes([
  { path: '/', element: <ActivityPageLayout base /> },
  { path: '/:id', element: <ActivityPageLayout />, children: activityPanelRoutes },
]);

export const mainRoutes: RouteInfo[] = [
  { path: '', label: 'home', icon: <HomeIcon />, element: <HomePageOld /> },
  { path: 'reports/*', to: 'reports', label: 'reports', icon: <Assessment />, element: <ReportsRouter /> },
  {
    path: 'activities/*', to: 'activities', label: 'activities',
    icon: <BrunchDining />, element: <ActivityPanelRouter />,
  },
  // { path: 'home-old', label: 'home-old', icon: <Cottage />, element: <HomePageOld /> },
  { path: '*', element: '404 not found', hideLink: true },
];

export const activityPanelRoutes: RouteInfo[] = [
  { path: '', label: 'overview', element: <ActivityPanelHome /> },
  { path: 'times', label: 'time chart', element: <TimeRe /> },
  { path: 'calender', label: 'calender', element: <ActivityCalender /> },
  { path: 'clocks', label: 'clocks', element: <ClockPage /> },
  // { path: 'calender', label: 'calender', element: <Calender /> },
  { path: '*', element: '404 not found', hideLink: true },
];

export const reportRoutes: RouteInfo[] = [
  { path: '', label: 'overview', element: <SunburstNivo /> },
  // { path: 'nivo-tree', label: 'tree map', element: <TreemapNivo /> },
  { path: '*', element: '404 not found', hideLink: true },
];

export default MainRouter;
