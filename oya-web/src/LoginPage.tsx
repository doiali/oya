import { LockOutlined } from '@mui/icons-material';
import { Box, AppBar, Toolbar, Typography, Container, Button, FormControlLabel, Checkbox, TextField, Avatar } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import AlertService from './AlertService';
import { getToken } from './apiService';
import { useAuth } from './AuthProvider';
import { DrawerHeader } from './Layout';
import ThemeModeSwitch from './ThemeModeSwitch';

export default function LoginPage() {
  const { login } = useAuth();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console
    getToken(data).then(({ data }) => {
      if (data.token_type === 'bearer')
        login('Bearer ' + data.access_token);
    }, () => AlertService.error('error in login'));
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="username"
            name="username"
            autoComplete="username"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
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
