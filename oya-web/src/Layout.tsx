import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Outlet } from 'react-router-dom';
import ListItemLink from './ListItemLink';
import { Home, Logout } from '@mui/icons-material';
import ThemeModeSwitch from './ThemeModeSwitch';
import { mainRoutes } from './MainRouter';
import ProtectedView from './ProtectedView';
import { ListItem, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material';
import { useAuth } from './AuthProvider';
import CalenderSelector from './CalenderSelector';

const drawerWidth = 280;
export const breakpoint = 'lg';
export const toolbarHeight = 80;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  overflow: 'hidden',
  paddingTop: toolbarHeight,
  [theme.breakpoints.up(breakpoint)]: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  },
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  [theme.breakpoints.up(breakpoint)]: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  },
}));

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  height: toolbarHeight,
  justifyContent: 'flex-end',
}));

const LogoutButton = () => {
  const { logout: handleLogout } = useAuth();
  return (
    <ListItem button onClick={handleLogout}>
      <ListItemIcon><Logout /></ListItemIcon>
      <ListItemText primary="Log out" />
    </ListItem>
  );
};

export default function Layout() {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up(breakpoint));
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(isWide);
  }, [isWide]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleListClick = () => {
    if (!isWide)
      setOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex', flex: '1 1 auto',
        '& .mobile-only': {
          [theme.breakpoints.up('md')]: {
            display: 'none',
          },
        },
        '& .desktop-only': {
          [theme.breakpoints.down('sm')]: {
            display: 'none',
          },
        },
      }}
    >
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ height: toolbarHeight }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Oya
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <ThemeModeSwitch />
          <CalenderSelector />
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isWide ? 'persistent' : 'temporary'}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box
          onClick={handleListClick}
          onKeyDown={handleListClick}
        >
          <List>
            {mainRoutes.filter(r => r.path !== '*' && !r.hideLink).map(r => (
              <ListItemLink
                key={r.path}
                to={r.to ?? r.path}
                primary={r.label ?? ''}
                icon={r.icon ?? <Home />}
              />
            ))}
          </List>
          <Divider />
          <List>
            <LogoutButton />
          </List>
          <Divider />
        </Box>
      </Drawer>
      <Main open={open}>
        <ProtectedView>
          <Outlet />
        </ProtectedView>
      </Main>
    </Box>
  );
}
