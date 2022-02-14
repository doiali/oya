import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';

interface ListItemLinkProps {
  icon?: React.ReactNode;
  primary: string;
  to: string;
}

export default function ListItemLink(props: ListItemLinkProps) {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(() => (
    React.forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'to'>>(function Link(
      itemProps,
      ref,
    ) {
      return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
    })
  ), [to]);

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}
