/* eslint-disable react/display-name */
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import * as React from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { LinkProps } from '@mui/material/Link';
import deepMerge from '../deepMerge';

const LinkBehavior = React.forwardRef<
  any,
  Omit<RouterLinkProps, 'to'> & { href: RouterLinkProps['to']; }
>((props, ref) => {
  const { href, ...other } = props;
  // Map href (MUI) -> to (react-router)
  return <RouterLink ref={ref} to={href} {...other} />;
});

const baseTheme: ThemeOptions = {
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
      } as LinkProps,
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
  },
};

const getTheme = (ThemeOptions: ThemeOptions = {}) => createTheme(deepMerge(baseTheme, ThemeOptions));

export const themes = {
  light: getTheme({ palette: { mode: 'light' } }),
  dark: getTheme({ palette: { mode: 'dark' } }),
} as const;

export type ThemeName = keyof typeof themes;

const ThemeContext = React.createContext({
  themeKey: 'light' as ThemeName,
  changeTheme(themeName: ThemeName) { window.localStorage.setItem('user-theme', themeName); },
});

export function ThemeProvider({ children }: { children: React.ReactNode; }) {
  const [themeKey, setThemeKey] = React.useState(() => {
    const initialTheme = window.localStorage.getItem('user-theme');
    return ((initialTheme && Object.keys(themes).includes(initialTheme))
      ? initialTheme : Object.keys(themes)[0]) as ThemeName;
  });
  const theme = themes[themeKey];
  const changeTheme = React.useCallback((themeName: ThemeName) => {
    window.localStorage.setItem('user-theme', themeName);
    setThemeKey(themeName);
  }, []);
  const provider = React.useMemo(() => ({ themeKey, changeTheme }), [themeKey, changeTheme]);
  return (
    <ThemeContext.Provider value={provider}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => {
  const context = React.useContext(ThemeContext);
  return context;
};
