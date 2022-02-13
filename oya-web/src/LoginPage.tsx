import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';
import { DrawerHeader } from './Layout';
import ThemeModeSwitch from './ThemeModeSwitch';

export default function LoginPage() {
  return (
    <Container maxWidth="sm" sx={{ pt: 7, textAlign: 'center' }}>
      welcome to login
    </Container>
  );
}

const LoginController: FC = ({ children }) => {
  const { loaded, authorized } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (authorized && !isRedirecting) {
      setIsRedirecting(true);
      navigate((state as any)?.from || '/');
    }
  }, [authorized, navigate, state, isRedirecting]);

  if (isRedirecting) return <p>redirecting</p>;
  if (!loaded) return <p>loading</p>;
  if (authorized) return <p>authorized</p>;
  return <>{children}</>;
};

export function LoginPageLayout() {
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Oya
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <ThemeModeSwitch />
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <DrawerHeader />
        <LoginController>
          <Outlet />
        </LoginController>
      </Box>
    </>
  );
}
