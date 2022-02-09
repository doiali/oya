import { Tab, Tabs } from '@mui/material';
import { matchPath, useLocation, useResolvedPath } from 'react-router';
import { Link } from 'react-router-dom';
import { RouteInfo } from './App';

type TabsNavProps = {
  routes: RouteInfo[];
  disabled?: boolean,
};

export default function TabsNav({ routes, disabled }: TabsNavProps) {
  const { pathname: resolvedPath } = useResolvedPath('');
  const { pathname } = useLocation();
  const base = resolvedPath.endsWith('/') ? resolvedPath : resolvedPath + '/';

  const value: false | string = !disabled && (
    routes.find(r => (
      r.path !== '*' && !r.hideLink &&
      matchPath(r.path.startsWith('/') ? r.path : base + r.path, pathname)
    ))?.path ?? false
  );

  return (
    <Tabs value={value}>
      {routes.filter(r => r.path !== '*' && !r.hideLink).map(r => (
        <Tab
          disabled={disabled}
          value={r.path}
          key={r.path}
          component={Link}
          to={r.to ?? r.path}
          label={r.label}
        />
      ))}
    </Tabs>
  );
}
