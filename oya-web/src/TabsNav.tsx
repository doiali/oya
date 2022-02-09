import { Tab, Tabs } from '@mui/material';
import { matchPath, resolvePath, useLocation, useResolvedPath } from 'react-router';
import { Link } from 'react-router-dom';
import { RouteInfo } from './App';

type TabsNavProps = {
  routes: RouteInfo[];
  disabled?: boolean,
};

export default function TabsNav({ routes, disabled }: TabsNavProps) {
  const { pathname: base } = useResolvedPath('');
  const { pathname } = useLocation();
  const value: false | string = !disabled && (
    routes.find(r => (
      r.path !== '*' && !r.hideLink &&
      matchPath(resolvePath(r.path, base).pathname, pathname)
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
