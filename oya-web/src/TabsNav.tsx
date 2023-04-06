import { Tab, Tabs } from '@mui/material';
import { matchPath, resolvePath, useLocation, useResolvedPath } from 'react-router';
import { Link } from 'react-router-dom';
import { RouteInfo } from './MainRouter';

type TabsNavProps = {
  routes: RouteInfo[];
  disabled?: boolean;
  preserveSearch?: boolean;
};

export default function TabsNav({ routes, disabled, preserveSearch }: TabsNavProps) {
  const { pathname: base } = useResolvedPath('');
  const { pathname, search } = useLocation();
  const value: false | string = !disabled && (
    routes.find(r => (
      r.path !== '*' && !r.hideLink &&
      matchPath(resolvePath(r.path, base).pathname, pathname)
    ))?.path ?? false
  );

  return (
    <Tabs value={value}>
      {routes.filter(r => r.path !== '*' && !r.hideLink).map(r => {
        let to = r.to ?? r.path;
        if (preserveSearch) {
          if (to)
            to = to + search;
          else
            to = base + search;
        }
        return (
          <Tab
            disabled={disabled}
            value={r.path}
            key={r.path}
            component={Link}
            to={to}
            label={r.label}
          />
        );
      })}
    </Tabs>
  );
}
