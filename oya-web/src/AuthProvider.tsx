import { AxiosError } from 'axios';
import { createContext, FC, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { getCurrentUser, session, User } from './apiService';

type AuthContextValue = {
  user?: User,
  authorized: boolean,
  loaded: boolean,
  login: (token: string) => void,
  logout: () => void,
  token?: string,
};

const defaultValue: AuthContextValue = {
  authorized: false,
  loaded: false,
  login: () => 0,
  logout: () => 0,
};

const AuthContext = createContext(defaultValue);

const fetcher = () => getCurrentUser().then((res) => res.data);

const AuthProvider: FC = ({ children }) => {
  const [{ token, ready }, setState] = useState<{ token?: string, ready?: boolean; }>({});

  const login = (token: string) => {
    localStorage.setItem('token', token);
    session.defaults.headers.common.Authorization = token;
    setState(p => ({ ...p, token }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete session.defaults.headers.common.Authorization;
    setState((p) => ({ ...p, token: undefined }));
  };

  const { data, error } = useSWR((token && ready) ? '/users/me' : null, fetcher, {
    onError: (err: AxiosError) => {
      if (err.response?.status === 401) logout();
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) session.defaults.headers.common.Authorization = token;
    setState({ ready: true, token: token ?? undefined });
  }, []);

  const value: AuthContextValue = useMemo(() => {
    return {
      user: data,
      token,
      authorized: !!(token && data),
      loaded: !!ready && (token ? !!(data || error) : true),
      login, logout,
    };
  }, [token, data, error, ready]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
